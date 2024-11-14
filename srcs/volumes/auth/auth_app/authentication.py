from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import CustomUser

class CustomJWTAuth(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            username = validated_token.get('username')
            if username is None:
                raise InvalidToken('Info not found')
            user = CustomUser.objects.get(username=username)
            return user
        except CustomUser.DoesNotExist:
            raise InvalidToken('user not found')
