from rest_framework import permissions
import jwt
from django.conf import settings

class IsAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        print('cc')
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
            if service_name != 'auth':
                return False
            return True

        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False

class IsAvatarManager(permissions.BasePermission):
    def has_permission(self, request, view):
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
            if service_name != 'avatar_manager':
                return False
            return True

        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False

class IsMatchmaking(permissions.BasePermission):
    def has_permission(self, request, view):
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
            if service_name != 'matchmaking':
                return False
            return True

        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        print(obj.username)
        print(request.user.username)
        return obj.username == request.user.username 
