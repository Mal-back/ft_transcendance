from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken
import jwt
from django.conf import settings

class CustomAuthentication(BaseAuthentication):
    def authenticate(self, token):
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