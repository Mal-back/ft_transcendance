from rest_framework import permissions
import jwt
from django.conf import settings

def is_ms(request, ms):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
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
        if service_name != ms:
            return False
        return True

    except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return False

class IsAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_ms(request, 'ms')

class IsMatchMaking(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_ms(request, 'matchmaking')

class IsAuthOrAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated or is_ms(request, 'auth') 
