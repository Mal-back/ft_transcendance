from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings

class UserIsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            print(request.headers)
            return False

        try:
            token_type, token = auth_header.split()
            if token_type != 'Bearer':
                return False

            decoded_token = jwt.decode(
                token,
                settings.SIMPLE_JWT['VERIFYING_KEY'],
                algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
            )

            service_name = decoded_token.get('service_name')
            if service_name != 'matchmaking':
                return False

            return True

        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False