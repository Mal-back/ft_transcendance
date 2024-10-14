from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings
from .models import MatchUser

class UserIsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        elif request.method == 'DELETE':
            return self.has_permission_for_delete(self, request, view)
        return getattr(request, 'user_username', None) is not None

    def has_permission_for_delete(self, request, view):
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
    
