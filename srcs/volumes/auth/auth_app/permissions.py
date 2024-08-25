from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """Check whethr pk in JWT token is equal to pk of the requested obj"""
    def has_object_permission(self, request, view, obj):
        return obj.id == request.user.id
        
