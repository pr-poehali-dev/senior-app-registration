import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для регистрации и входа пользователей в приложение для пожилых людей'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'register':
                phone = body.get('phone')
                first_name = body.get('firstName')
                last_name = body.get('lastName')
                middle_name = body.get('middleName')
                email = body.get('email')
                birth_date = body.get('birthDate')
                
                cursor.execute(
                    '''INSERT INTO users (phone, first_name, last_name, middle_name, email, birth_date)
                       VALUES (%s, %s, %s, %s, %s, %s)
                       ON CONFLICT (phone) DO UPDATE SET
                       first_name = EXCLUDED.first_name,
                       last_name = EXCLUDED.last_name,
                       middle_name = EXCLUDED.middle_name,
                       email = EXCLUDED.email,
                       birth_date = EXCLUDED.birth_date,
                       updated_at = CURRENT_TIMESTAMP
                       RETURNING id, phone, first_name, last_name, middle_name, email, birth_date, medical_card_number''',
                    (phone, first_name, last_name, middle_name, email, birth_date)
                )
                
                user = cursor.fetchone()
                conn.commit()
                
                user_data = {
                    'id': user[0],
                    'phone': user[1],
                    'firstName': user[2],
                    'lastName': user[3],
                    'middleName': user[4],
                    'email': user[5],
                    'birthDate': user[6].isoformat() if user[6] else None,
                    'medicalCardNumber': user[7]
                }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'user': user_data}),
                    'isBase64Encoded': False
                }
                
            elif action == 'login':
                phone = body.get('phone')
                
                cursor.execute(
                    '''SELECT id, phone, first_name, last_name, middle_name, email, birth_date, medical_card_number
                       FROM users WHERE phone = %s''',
                    (phone,)
                )
                
                user = cursor.fetchone()
                
                if user:
                    user_data = {
                        'id': user[0],
                        'phone': user[1],
                        'firstName': user[2],
                        'lastName': user[3],
                        'middleName': user[4],
                        'email': user[5],
                        'birthDate': user[6].isoformat() if user[6] else None,
                        'medicalCardNumber': user[7]
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'success': True, 'user': user_data}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'success': False, 'message': 'Пользователь не найден'}),
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
