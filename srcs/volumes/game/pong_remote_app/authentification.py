from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken
import jwt
from django.conf import settings

class CustomAuthentication(BaseAuthentication):
    def authenticate(self, token):
        return (None, None)

