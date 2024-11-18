import requests
from django.utils.decorators import method_decorator
from rest_framework import generics, status
from rest_framework.response import Serializer
from rest_framework.views import APIView, Response, csrf_exempt
from .serializers import UserRegistrationSerializer, ServiceObtainTokenSerializer, MyTokenObtainPairSerializer, PasswordModficationSerializer
from .permissions import IsOwner
from .models import CustomUser
from .requests_manager import send_delete_requests, send_create_requests, send_update_requests
from rest_framework import serializers
from rest_framework.exceptions import APIException
from django.contrib.auth import authenticate
from .trad import translate
# Create your views here.

#######################
from django.core.mail import send_mail
from rest_framework_simplejwt.views import TokenObtainPairView
import random
from sendgrid.helpers.mail import Mail, Email, To, Content
import string
import sendgrid
from django.conf import settings
from datetime import datetime, timedelta
import pyotp
from django_otp.plugins.otp_totp.models import TOTPDevice


class CustomTokenObtainPairView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return super().post(request, *args, **kwargs)
        if user.two_fa_enabled:
            return Response({
                'message': '2FA is enabled. Please enter the OTP from your Google Authenticator app.'
            }, status=status.HTTP_202_ACCEPTED)
        return super().post(request, *args, **kwargs)
    
class OTPValidationView(APIView):

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        otp = request.data.get("otp")
        if not username or not otp:
            return Response({"message": "Username and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"message": "Invalid credentials."}, status=status.HTTP_404_NOT_FOUND)
        try:
            device = TOTPDevice.objects.get(user=user)
        except TOTPDevice.DoesNotExist:
            return Response({"message": "No 2FA device set up for this user."}, status=status.HTTP_400_BAD_REQUEST)
        if device.verify_token(otp):
            token = MyTokenObtainPairSerializer.get_token(user)
            access_token = str(token.access_token)
            refresh_token = str(token)
            return Response({
                "message": "OTP verified successfully.",
                "access": access_token,
                "refresh": refresh_token
            }, status=status.HTTP_200_OK)
        return Response({"message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
###################################################


class UserDetailView(generics.RetrieveAPIView) :
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]


class UserDeleteView(generics.DestroyAPIView) :
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]

    def perform_destroy(self, instance):
        req_url = [f'http://matchmaking:8443/api/matchmaking/{instance.username}/delete/',
                    f'http://users:8443/api/users/delete/{instance.username}/',
                    f'http://history:8443/api/history/user/delete/{instance.username}/',
                    'http://avatars:8443/api/avatars/',
                   ]
        lang = self.request.headers.get('lang')
        if send_delete_requests(urls=req_url, body={'username': instance.username}) != True:
            message = translate(lang, "update_username_error_in_game")
            return Response({'Error': message}, status=status.HTTP_400_BAD_REQUEST)
        instance.delete()


class UserCreateView(generics.ListCreateAPIView) :
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    lookup_field = 'username'

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data.get('username')
        req_urls = ['http://users:8443/api/users/create/',
                    'http://matchmaking:8443/api/matchmaking/create/',
                    'http://history:8443/api/history/user/create/',
                    ]
        if send_create_requests(urls=req_urls, body={'username':username}) == False:
            raise MicroServiceError
        user = serializer.save()
        return user


class UserUpdateView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    lookup_field = 'username'
    permission_classes = [IsOwner]
    serializer_class = UserRegistrationSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        self.check_object_permissions(request, user)
        old_username = user.username
        serializer = UserRegistrationSerializer(user, data=request.data, partial=True, context={'request': request})
        lang = request.headers.get('lang')
        message = translate(lang, "update_success")

        
        if serializer.is_valid():
            new_username = serializer.validated_data.get('username', old_username)
            if old_username != new_username:
                
                req_urls = [
                    f'http://matchmaking:8443/api/matchmaking/{old_username}/update/',
                    f'http://users:8443/api/users/{old_username}/update/',
                    f'http://history:8443/api/history/user/update/{old_username}/',
                    'http://avatars:8443/api/avatars/',
                ]
                if send_update_requests(old_username, req_urls, body={'username': new_username, 'old_username': old_username, 'new_username': new_username}) == False:
                    message = translate(lang, "update_username_error_in_game")
                    return Response({'Error': message}, status=status.HTTP_400_BAD_REQUEST)
                serializer.save()
                token = MyTokenObtainPairSerializer.get_token(user)
                access_token = str(token.access_token)
                refresh_token = str(token)
                response_data = {
                        'OK':message,
                        'new username':user.username,
                        'access': access_token,
                        'refresh': refresh_token, 
                        }
                return Response(response_data, status=status.HTTP_200_OK)
            two_fa_enabled = serializer.validated_data.get('two_fa_enabled', user.two_fa_enabled)
            
            if two_fa_enabled and not user.two_fa_enabled:
                try:
                    device = TOTPDevice.objects.create(user=user, name="Default 2FA Device")
                    device.save()
                    otp_uri = device.config_url
                    serializer.save()
                    return Response({
                        'Ok': 'Update successful',
                        'otp_uri': otp_uri,
                        'device_id': device.id
                    }, status=status.HTTP_200_OK)
                except:
                    return Response({"error": "Could not update 2FA."}, status=status.HTTP_400_BAD_REQUEST)
            elif not two_fa_enabled and user.two_fa_enabled:
                try:
                    device = TOTPDevice.objects.get(user=user)
                    device.delete()
                except TOTPDevice.DoesNotExist:
                    pass
                serializer.save()
                return Response({
                    'message': '2FA disabled successfully.'
                }, status=status.HTTP_200_OK)
            serializer.save()
            return Response({'Ok': 'Update successful'}, status=status.HTTP_200_OK)

        else:
            message = translate(lang, "invalid_data_error")
            return Response({'Error': message}, status=status.HTTP_400_BAD_REQUEST)


class PasswordUpdateView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = PasswordModficationSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]


class ServiceJWTObtainPair(APIView):
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        print('I ve beeen reached')
        serializer = ServiceObtainTokenSerializer(data=request.data, context={'request':request})
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MicroServiceError(APIException):
    status_code = 500
    default_detail = 'An error happend between microservice interaction. Please try again later'
    default_code = 'MicroService error'
