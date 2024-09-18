from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """Check whethr username in JWT token is equal to username of the requested obj"""
    def has_object_permission(self, request, view, obj):
        return obj.username == request.user.username
        
