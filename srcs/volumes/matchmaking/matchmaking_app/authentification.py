from datetime import timedelta
from django.utils.timezone import now
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings
from .models import MatchUser
import threading
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException
from django.db import connection

class CustomAuthentication(BaseAuthentication):
    def authenticate(self, request):
        authHeader = request.headers.get('Authorization')

        if not authHeader:
            return None

        try :
            tokenType, token = authHeader.split()
            if tokenType != 'Bearer':
                raise AuthenticationFailed('Invalid header info')
        except ValueError :
            raise AuthenticationFailed('Invalid header info')

        try :
            clear_token = jwt.decode(
                    token,
                    settings.SIMPLE_JWT['VERIFYING_KEY'],
                    settings.SIMPLE_JWT['ALGORITHM'] 
                    )
        except jwt.ExpiredSignatureError :
            raise AuthenticationFailed('Token Expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid header info')
        user = clear_token.get('username')
        if user is None:
            return(None, None)
        user_obj = MatchUser.objects.get(username=user)
        if user_obj.last_online_update is None or now() - user_obj.last_online_update > timedelta(minutes=2):
            thread = threading.Thread(target=update_online_status, args=(user_obj.username,))
            thread.daemon = True
            thread.start()
        return(user_obj, token)

def update_online_status(username):
    try:
        sender = MicroServiceClient()
        sender.send_requests(
                urls=[f'http://users:8443/api/users/{username}/last_seen_online/'],
                method='patch',
                expected_status=[200],
                )
        print('Update last seen online field')
    except (RequestsFailed, InvalidCredentialsException):
        print('Failed to send request')
    connection.close()
