import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для управления списком внуков пользователя'''
    
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
                '''SELECT id, first_name, last_name, middle_name, birth_date, gender, info
                   FROM grandchildren WHERE user_id = %s ORDER BY birth_date DESC''',
                (user_id,)
            )
            
            children = cursor.fetchall()
            children_list = [
                {
                    'id': row[0],
                    'firstName': row[1],
                    'lastName': row[2],
                    'middleName': row[3],
                    'birthDate': row[4].isoformat() if row[4] else None,
                    'gender': row[5],
                    'info': row[6]
                }
                for row in children
            ]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'grandchildren': children_list}),
                'isBase64Encoded': False
            }
            
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('userId')
            first_name = body.get('firstName')
            last_name = body.get('lastName')
            middle_name = body.get('middleName')
            birth_date = body.get('birthDate')
            gender = body.get('gender')
            info = body.get('info')
            
            cursor.execute(
                '''INSERT INTO grandchildren (user_id, first_name, last_name, middle_name, birth_date, gender, info)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   RETURNING id, first_name, last_name, middle_name, birth_date, gender, info''',
                (user_id, first_name, last_name, middle_name, birth_date, gender, info)
            )
            
            child = cursor.fetchone()
            conn.commit()
            
            child_data = {
                'id': child[0],
                'firstName': child[1],
                'lastName': child[2],
                'middleName': child[3],
                'birthDate': child[4].isoformat() if child[4] else None,
                'gender': child[5],
                'info': child[6]
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'grandchild': child_data}),
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
