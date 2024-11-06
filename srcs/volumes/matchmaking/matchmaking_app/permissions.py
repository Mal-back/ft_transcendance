from django.contrib.auth.models import AnonymousUser
from rest_framework import permissions
import jwt
from django.conf import settings

class IsAuth(permissions.BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return False  # No authorization header means permission denied

        try:
            token_type, token = auth_header.split()
            if token_type != 'Bearer':
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
                return False  # Service name does not match

            return True  # Service name matches "Auth"

        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False  # Invalid token or error during decoding

class IsGame(permissions.BasePermission):
    def has_permission(self, request, view):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return False  # No authorization header means permission denied

        try:
            token_type, token = auth_header.split()
            if token_type != 'Bearer':
                return False  # Invalid token type

            # Decode the JWT token
            decoded_token = jwt.decode(
                token,
                settings.SIMPLE_JWT['VERIFYING_KEY'],
                algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
            )

            # Check if the service_name is "Auth"
            service_name = decoded_token.get('service_name')
            if service_name != 'game':
                return False  # Service name does not match

            return True  # Service name matches "Auth"

        except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False  # Invalid token or error during decoding

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.username == request.user.username 

class IsInitiatingPlayer(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.player1.username == request.user.username 


class IsInvitedPlayer(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.player2.username == request.user.username 

class IsInvitedPlayerTournament(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user in obj.invited_players.all() 

class IsConfirmedPlayerTournament(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.username in obj.confirmed_players.values_list('user', flat=True) 

class IsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

