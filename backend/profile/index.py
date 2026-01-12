import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления профилем пользователя: медкарта, настроение, данные'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            user_id = body.get('userId')
            
            if action == 'updateMedicalCard':
                medical_card_number = body.get('medicalCardNumber')
                
                cursor.execute(
                    '''UPDATE users SET medical_card_number = %s, updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s RETURNING medical_card_number''',
                    (medical_card_number, user_id)
                )
                
                result = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'medicalCardNumber': result[0]}),
                    'isBase64Encoded': False
                }
                
            elif action == 'saveMood':
                mood = body.get('mood')
                
                cursor.execute(
                    '''INSERT INTO mood_logs (user_id, mood) VALUES (%s, %s) RETURNING id''',
                    (user_id, mood)
                )
                
                result = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'moodId': result[0]}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('userId')
            action = params.get('action')
            
            if action == 'getMoodHistory':
                cursor.execute(
                    '''SELECT mood, created_at FROM mood_logs 
                       WHERE user_id = %s 
                       ORDER BY created_at DESC 
                       LIMIT 30''',
                    (user_id,)
                )
                
                moods = cursor.fetchall()
                mood_history = [
                    {
                        'mood': row[0],
                        'createdAt': row[1].isoformat() if row[1] else None
                    }
                    for row in moods
                ]
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'moods': mood_history}),
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
