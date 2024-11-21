from django.contrib.auth.models import AnonymousUser
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
        return is_ms(request, 'auth')

class IsGame(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_ms(request, 'game')

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
