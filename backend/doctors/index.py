import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для управления списком врачей пользователя'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('userId')
            
            cursor.execute(
                '''SELECT id, first_name, last_name, middle_name, specialty, phone
                   FROM doctors WHERE user_id = %s ORDER BY last_name''',
                (user_id,)
            )
            
            doctors = cursor.fetchall()
            doctors_list = [
                {
                    'id': row[0],
                    'firstName': row[1],
                    'lastName': row[2],
                    'middleName': row[3],
                    'specialty': row[4],
                    'phone': row[5]
                }
                for row in doctors
            ]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'doctors': doctors_list}),
                'isBase64Encoded': False
            }
            
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('userId')
            first_name = body.get('firstName')
            last_name = body.get('lastName')
            middle_name = body.get('middleName')
            specialty = body.get('specialty')
            phone = body.get('phone')
            
            cursor.execute(
                '''INSERT INTO doctors (user_id, first_name, last_name, middle_name, specialty, phone)
                   VALUES (%s, %s, %s, %s, %s, %s)
                   RETURNING id, first_name, last_name, middle_name, specialty, phone''',
                (user_id, first_name, last_name, middle_name, specialty, phone)
            )
            
            doctor = cursor.fetchone()
            conn.commit()
            
            doctor_data = {
                'id': doctor[0],
                'firstName': doctor[1],
                'lastName': doctor[2],
                'middleName': doctor[3],
                'specialty': doctor[4],
                'phone': doctor[5]
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'doctor': doctor_data}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()
