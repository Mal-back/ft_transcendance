from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings
from .models import PublicUser

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
        user_obj = PublicUser.objects.get(username=user)
        return(user_obj, token)
