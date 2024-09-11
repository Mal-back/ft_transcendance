from datetime import timedelta
from django.forms import ValidationError
from rest_framework import serializers
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, Service
import jwt
from django.conf import settings
from datetime import datetime, timedelta

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

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        del token['user_id']
        if user.groups.filter(name='service').exists():
            token.set_exp(lifetime=timedelta(hours=12))
            token.set_exp(lifetime=timedelta(days=3), claim='refresh')
        else:
            token.set_exp(lifetime=timedelta(minutes=3))
            token.set_exp(lifetime=timedelta(hours=6), claim='refresh')

        return token

class ServiceObtainTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['serviceName', 'password']

    def validate(self, attrs):
        password = attrs.get('password')
        serviceName = attrs.get('serviceName')
        print(serviceName)
        print(make_password(password))
        try :
            service = Service.objects.get(serviceName=serviceName)
        except Service.DoesNotExist:
            raise ValidationError('Invalid Credentials')

        if not check_password(password, service.password) :
            raise ValidationError('Invalid Credentials')

        token = create_service_token(service)
        return {'token': token}

#
def create_service_token(service):
    payload = {
        'service_name': str(service.serviceName),
        'exp': datetime.utcnow() + timedelta(hours=12),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SIMPLE_JWT['SIGNING_KEY'], algorithm='RS512')
    return token