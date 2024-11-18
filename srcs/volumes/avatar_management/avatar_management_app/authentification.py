from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken
import jwt
from django.conf import settings
from .trad import translate

class CustomAuthentication(BaseAuthentication):
    def authenticate(self, request):
        authHeader = request.headers.get('Authorization')
        lang = request.headers.get('lang')

        if not authHeader:
            return None

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
            return None
        request.user_username = user
        return None
