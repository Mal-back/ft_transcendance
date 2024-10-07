from rest_framework.permissions import BasePermission

class UserIsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        return getattr(request, 'user_username', None) is not None
