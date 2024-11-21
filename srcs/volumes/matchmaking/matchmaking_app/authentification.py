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
from .trad import translate

class CustomAuthentication(BaseAuthentication):
    def authenticate(self, request):
        authHeader = request.headers.get('Authorization')
        lang = request.headers.get('lang')

        if not authHeader:
            raise AuthenticationFailed('You should be authenticated')

        try :
            tokenType, token = authHeader.split()
            if tokenType != 'Bearer':
                message = translate(lang, "header_info_error")
                raise AuthenticationFailed(message)
        except ValueError :
            message = translate(lang, "header_info_error")
            raise AuthenticationFailed(message)

        try :
            clear_token = jwt.decode(
                    token,
                    settings.SIMPLE_JWT['VERIFYING_KEY'],
                    settings.SIMPLE_JWT['ALGORITHM'] 
                    )
        except jwt.ExpiredSignatureError :
            message = translate(lang, "token_expired")
            raise AuthenticationFailed(message)
        except jwt.InvalidTokenError:
            message = translate(lang, "header_info_error")
            raise AuthenticationFailed(message)
        user = clear_token.get('username')
        if user is None:
            return(None, None)
        try:
            user_obj = MatchUser.objects.get(username=user)
        except MatchUser.DoesNotExist:
            message = translate(lang, "user_does_not_exist_error")
            raise AuthenticationFailed(message)
        if user_obj.last_online_update is None or now() - user_obj.last_online_update > timedelta(minutes=2):
            thread = threading.Thread(target=update_online_status, args=(user_obj.username,))
            thread.daemon = True
            thread.start()
            user_obj.last_online_update = now()
            user_obj.save()
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
