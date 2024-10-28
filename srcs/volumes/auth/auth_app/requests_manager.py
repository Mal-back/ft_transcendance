from datetime import datetime, timedelta
import jwt
import requests
from django.conf import settings
from .serializers import createServiceToken
from .models import Service, Token
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError

def send_request(url:str, method:str, body={}, headers={}) -> int:
    req_methods = {
            'post':requests.post,
            'delete':requests.delete,
            'update':requests.put,
            'patch':requests.patch,
            }
    response = req_methods[method](url, json=body ,headers=headers)
    print(f'Request at url {url} return {response.status_code} with {response.text}')
    return response.status_code

def send_create_requests(urls:list, body={}, headers={}) -> bool:
    token = getToken()
    headers.update({'Authorization': f'Bearer {token}'})
    successefull_elements = []
    for url in urls:
        if send_request(url=url, method='post', body=body, headers=headers) != 201:
            break
        else:
            successefull_elements.append(url)
    if len(urls) != len(successefull_elements):
        for url in successefull_elements:
            rollback_url = url.replace('create', 'delete') + body['username'] + '/' 
            send_request(url=rollback_url, method='delete', headers=headers)
        return False
    return True

def send_delete_requests(urls:list, body={}, headers={}) -> bool :
    token = getToken()  
    headers.update({'Authorization': f'Bearer {token}'})
    for url in urls:
        if send_request(url=url, method='delete', body=body, headers=headers) != 204:
            return False
    return True

def send_update_requests(old_username:str, urls:list, body={}, headers={}) -> bool:
    token = getToken()  
    print(token)
    headers.update({'Authorization': f'Bearer {token}'})
    successefull_elements = []
    for url in urls:
        if send_request(url=url, method='patch', body=body, headers=headers) != 200:
            break
        else:
            successefull_elements.append(url)
    if len(urls) != len(successefull_elements):
        for url in successefull_elements:
            new_username = body['username']
            body['username'] = old_username
            print(body)
            rollback_url = url.replace(old_username, new_username) 
            send_request(url=rollback_url, method='patch', headers=headers, body=body)
        return False
    return True

def getToken():
    auth = Token.objects.get(serviceName='auth')

    try:
            decoded_token = jwt.decode(
                auth.token,
                settings.SIMPLE_JWT['VERIFYING_KEY'],
                algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
            )
            timestamp = decoded_token.get('exp')
            time = datetime.fromtimestamp(timestamp)
            margin = datetime.now() + timedelta(minutes=1)
            if time < margin:
                return generate_new_auth_token(auth)
            return auth.token
    except Exception:
        validated_token = generate_new_auth_token(auth)
    return validated_token

def generate_new_auth_token(tokenObj, serviceName:str='auth') :
        validated_token = createServiceToken(Service.objects.get(serviceName=serviceName))
        tokenObj.token = validated_token
        tokenObj.save()
        return validated_token
