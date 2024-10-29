from datetime import timedelta
from django.forms import ValidationError
from rest_framework import serializers
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, Service
import jwt
from django.conf import settings
from datetime import datetime, timedelta
from django.utils.timezone import now

class UserRegistrationSerializer(serializers.ModelSerializer) :
    password2 = serializers.CharField(max_length=128, write_only=True, style={'input_type': 'password'}, required=True)
    email = serializers.EmailField(required=True)
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'is_active', 'two_fa_enabled']
        extra_kwargs = {
                    'password': {'write_only': True, 'style': {'input_type': 'password'}},
                    'password2': {'write_only': True, 'style': {'input_type': 'password'}},
                    'is_active': {'read_only' : True},
                }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.context.get('request') != 'POST':
            self.fields['password2'].required = False
    

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already taken.Already have an account ? Sign in")
        return value

    def validate_username(self, value):
        forbidden_usernames = [
                'create',
                'update',
                'delete',
                'login',
                'logout',
                'refresh',
                'increment',
                'add',
                'admin',
                ]
        if value.lower() in forbidden_usernames:
            raise ValidationError('Forbidden user name')
        if 'israel' in value.lower():
            raise ValidationError("You can't choose a non-existing country as username. Free Palestine !")
        for char in value:
            if char not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_':
                raise ValidationError('Username should only contain letters, numbers, "-", "_" and "."')
        return value

    def validate(self, data):
        if data.get('password') != data.get('password2') :
            raise ValidationError('Both passwords doesn\'t match')
        return data

    def create(self, validated_data):
        validated_data.pop('password2', None)
        validated_data['password'] = make_password(validated_data['password'])
        user = CustomUser.objects.create(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=256)
    password = serializers.CharField(write_only=True)

class PasswordModficationSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=128, required=True, write_only=True)
    new_password = serializers.CharField(max_length=128, required=True, write_only=True)
    new_password2 = serializers.CharField(max_length=128, required=True, write_only=True)

    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value
    def validate(self, data):
        new1 = data.get('new_password')
        new2 = data.get('new_password2')
        if new1 != new2 :
            raise serializers.ValidationError("Passwords dont't match")
        elif new1 is None:
            raise serializers.ValidationError("Missign fields")
        elif new1 == '':
            raise serializers.ValidationError("Can't save an empty password")
        return data
    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        del token['user_id']
        token.set_exp(lifetime=timedelta(minutes=5))
        token.payload['exp'] = (datetime.utcnow() + timedelta(days=1)).timestamp()
        user.last_log = now()
        user.save()
        return token

class ServiceObtainTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['serviceName', 'password']

    def validate(self, attrs):
        password = attrs.get('password')
        serviceName = attrs.get('serviceName')
        try :
            service = Service.objects.get(serviceName=serviceName)
        except Service.DoesNotExist:
            raise ValidationError('Invalid Credentials')

        if not check_password(password, service.password) :
            raise ValidationError('Invalid Credentials')

        token = createServiceToken(service)
        return {'token': token}

#
def createServiceToken(service):
    payload = {
        'service_name': str(service.serviceName),
        'exp': datetime.utcnow() + timedelta(hours=12),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SIMPLE_JWT['SIGNING_KEY'], algorithm='RS512')
    return token
