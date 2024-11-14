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
from .trad import translate

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
            lang = self.context.get('request').headers.get('lang')
            message = translate(lang, "email_taken_error")
            raise serializers.ValidationError(message)
        return value

    def validate_username(self, value):
        lang = self.context.get('request').headers.get('lang')
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
            message = translate(lang, "forbidden_username_error")
            raise ValidationError(message)
        if 'israel' in value.lower():
            message = translate(lang, "free_palestine")
            raise ValidationError(message)
        for char in value:
            if char not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_':
                message = translate(lang, "invalid_characters_in_username_error")
                raise ValidationError(message)
        return value

    def validate(self, data):
        if data.get('password') != data.get('password2') :
            lang = self.context.get('request').headers.get('lang')
            message = translate(lang, "password_mismatch_error")
            raise ValidationError(message)
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
        lang = self.context['request'].headers.get('lang')
        if not user.check_password(value):
            message = translate(lang,"old_password_incorrect_error")
            raise serializers.ValidationError(message)
        return value
    def validate(self, data):
        new1 = data.get('new_password')
        new2 = data.get('new_password2')
        lang = self.context['request'].headers.get('lang')
        if new1 != new2 :
            message = translate(lang, "password_mismatch_error")
            raise serializers.ValidationError(message)
        elif new1 is None:
            message = translate(lang, "missing_fields_error")
            raise serializers.ValidationError(message)
        elif new1 == '':
            message = translate(lang, "empty_password_error")
            raise serializers.ValidationError(message)
        return data
    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance


# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)
#         token['username'] = user.username
#         del token['user_id']
#         if user.groups.filter(name='service').exists():
#             token.set_exp(lifetime=timedelta(hours=12))
#             token.set_exp(lifetime=timedelta(days=3), claim='refresh')
#         else:
#             token.set_exp(lifetime=timedelta(minutes=5))
#             token.set_exp(lifetime=timedelta(days=1), claim='refresh')
#
#         return token

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
        lang = self.context.get('request').headers.get('lang')
        message = translate(lang, "invalid_credentials_error")
        try :
            service = Service.objects.get(serviceName=serviceName)
        except Service.DoesNotExist:
            raise ValidationError(message)

        if not check_password(password, service.password) :
            raise ValidationError(message)

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
