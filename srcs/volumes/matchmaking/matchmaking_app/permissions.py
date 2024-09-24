from rest_framework import permissions
import jwt
from django.conf import settings

class isAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        print("I i check the exception")
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            print('header')
            return False  # No authorization header means permission denied

        try:
            token_type, token = auth_header.split()
            if token_type != 'Bearer':
                print('bearer')
                return False  # Invalid token type

            # Decode the JWT token
            decoded_token = jwt.decode(
                token,
                settings.SIMPLE_JWT['VERIFYING_KEY'],
                algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
            )

            # Check if the service_name is "Auth"
            service_name = decoded_token.get('service_name')
            if service_name != 'auth':
                print('name')
                return False  # Service name does not match

            return True  # Service name matches "Auth"

        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            print('exception')
            return False  # Invalid token or error during decoding
