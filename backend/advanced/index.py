import json
import os
import psycopg2
import boto3
import base64
import urllib.request
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для расширенных функций: лекарства, погода, заметки, загрузка фото, удаление аккаунта'''
    
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action')
        
        if method == 'GET':
            if action == 'weather':
                lat = params.get('lat')
                lon = params.get('lon')
                api_key = os.environ.get('OPENWEATHER_API_KEY')
                
                if not api_key:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'temp': 18, 'condition': 'Облачно', 'icon': '03d'}),
                        'isBase64Encoded': False
                    }
                
                try:
                    url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=ru'
                    with urllib.request.urlopen(url) as response:
                        data = json.loads(response.read().decode())
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'temp': round(data['main']['temp']),
                            'condition': data['weather'][0]['description'].capitalize(),
                            'icon': data['weather'][0]['icon']
                        }),
                        'isBase64Encoded': False
                    }
                except:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'temp': 18, 'condition': 'Облачно', 'icon': '03d'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'medications':
                user_id = params.get('userId')
                cursor.execute('SELECT id, name, dosage, frequency, time_schedule, notes FROM medications WHERE user_id = %s ORDER BY name', (user_id,))
                medications = cursor.fetchall()
                meds_list = [{'id': r[0], 'name': r[1], 'dosage': r[2], 'frequency': r[3], 'timeSchedule': r[4], 'notes': r[5]} for r in medications]
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'medications': meds_list}), 'isBase64Encoded': False}
            
            elif action == 'notes':
                user_id = params.get('userId')
                cursor.execute('SELECT id, title, content, created_at FROM notes WHERE user_id = %s ORDER BY updated_at DESC', (user_id,))
                notes = cursor.fetchall()
                notes_list = [{'id': r[0], 'title': r[1], 'content': r[2], 'createdAt': r[3].isoformat() if r[3] else None} for r in notes]
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'notes': notes_list}), 'isBase64Encoded': False}
            
            elif action == 'photos':
                user_id = params.get('userId')
                cursor.execute('SELECT id, photo_url, description, uploaded_at FROM gallery_photos WHERE user_id = %s ORDER BY uploaded_at DESC', (user_id,))
                photos = cursor.fetchall()
                photos_list = [{'id': r[0], 'photoUrl': r[1], 'description': r[2], 'uploadedAt': r[3].isoformat() if r[3] else None} for r in photos]
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'photos': photos_list}), 'isBase64Encoded': False}
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'addMedication':
                user_id = body.get('userId')
                cursor.execute(
                    'INSERT INTO medications (user_id, name, dosage, frequency, time_schedule, notes) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, name',
                    (user_id, body.get('name'), body.get('dosage'), body.get('frequency'), body.get('timeSchedule'), body.get('notes'))
                )
                med = cursor.fetchone()
                conn.commit()
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'medication': {'id': med[0], 'name': med[1]}}), 'isBase64Encoded': False}
            
            elif action == 'logMedication':
                cursor.execute('INSERT INTO medication_logs (medication_id, user_id, skipped) VALUES (%s, %s, %s) RETURNING id',
                    (body.get('medicationId'), body.get('userId'), body.get('skipped', False)))
                log_id = cursor.fetchone()[0]
                conn.commit()
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'logId': log_id}), 'isBase64Encoded': False}
            
            elif action == 'addNote':
                user_id = body.get('userId')
                cursor.execute('INSERT INTO notes (user_id, title, content) VALUES (%s, %s, %s) RETURNING id, title', (user_id, body.get('title'), body.get('content')))
                note = cursor.fetchone()
                conn.commit()
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'note': {'id': note[0], 'title': note[1]}}), 'isBase64Encoded': False}
            
            elif action == 'uploadPhoto':
                user_id = body.get('userId')
                photo_base64 = body.get('photoBase64')
                description = body.get('description', '')
                
                s3 = boto3.client('s3', endpoint_url='https://bucket.poehali.dev',
                    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
                
                photo_data = base64.b64decode(photo_base64.split(',')[1] if ',' in photo_base64 else photo_base64)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                file_key = f'gallery/{user_id}/{timestamp}.jpg'
                
                s3.put_object(Bucket='files', Key=file_key, Body=photo_data, ContentType='image/jpeg')
                cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
                
                cursor.execute('INSERT INTO gallery_photos (user_id, photo_url, description) VALUES (%s, %s, %s) RETURNING id', (user_id, cdn_url, description))
                photo_id = cursor.fetchone()[0]
                conn.commit()
                
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'photo': {'id': photo_id, 'photoUrl': cdn_url}}), 'isBase64Encoded': False}
            
            elif action == 'updateProfile':
                user_id = body.get('userId')
                updates = []
                values = []
                
                if 'firstName' in body:
                    updates.append('first_name = %s')
                    values.append(body['firstName'])
                if 'lastName' in body:
                    updates.append('last_name = %s')
                    values.append(body['lastName'])
                if 'middleName' in body:
                    updates.append('middle_name = %s')
                    values.append(body['middleName'])
                if 'email' in body:
                    updates.append('email = %s')
                    values.append(body['email'])
                if 'birthDate' in body:
                    updates.append('birth_date = %s')
                    values.append(body['birthDate'])
                if 'sosPinCode' in body:
                    updates.append('sos_pin_code = %s')
                    values.append(body['sosPinCode'])
                if 'city' in body:
                    updates.append('city = %s')
                    values.append(body['city'])
                if 'street' in body:
                    updates.append('street = %s')
                    values.append(body['street'])
                if 'house' in body:
                    updates.append('house = %s')
                    values.append(body['house'])
                if 'utilityAccount' in body:
                    updates.append('utility_account = %s')
                    values.append(body['utilityAccount'])
                
                values.append(user_id)
                
                cursor.execute(f"UPDATE users SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id", tuple(values))
                conn.commit()
                
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
            
            elif action == 'deleteAccount':
                user_id = body.get('userId')
                cursor.execute('UPDATE users SET phone = %s WHERE id = %s', (f'deleted_{user_id}', user_id))
                conn.commit()
                return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}
        
        return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
        
    except Exception as e:
        conn.rollback()
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': str(e)}), 'isBase64Encoded': False}
    finally:
        cursor.close()
        conn.close()
