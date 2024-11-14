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
# Create your views here.

#######################
from django.core.mail import send_mail
from rest_framework_simplejwt.views import TokenObtainPairView
import random
import string
from django.conf import settings
from datetime import datetime, timedelta

class CustomTokenObtainPairView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):
      
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            print("TEST")
            return super().post(request, *args, **kwargs)
        print(user.email)
        if user.two_fa_enabled:
            otp = self.generate_otp()
            print("OTP: " + otp)
            session_key = f"otp_{user.username}"
            request.session[session_key] = {
                'otp': otp,
                'expiration': str(datetime.now() + timedelta(minutes=5))
            }
            try:
                self.send_otp_email(user.email, otp)
            except:
                return Response({
                "error": "Can not send mail",
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            return Response({
                'message': 'A 5 minutes one-time authentication code has been sent to your email. Please enter it to complete the login.'
            }, status=202)
        return super().post(request, *args, **kwargs)


    def send_otp_email(self, email, otp):
        subject = "Authentication code Transcendance"
        message = f"Your one-time authentication code is : {otp}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email,]
        print("subject" + subject + "message" + message + "from_email" + from_email + "recipient_list" + recipient_list)
        send_mail(subject, message, from_email, recipient_list)


    def generate_otp(self):
        otp = str().join(random.choices(string.digits, k=6))
        return otp
        

class OTPValidationView(APIView):

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        otp = request.data.get("otp")
        if not username or not otp:
            return Response({"message": "Username and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        session_key = f"otp_{user.username}"
        otp_data = request.session.get(session_key)
        if not otp_data:
            return Response({"message": "OTP has not been generated or has expired."}, status=status.HTTP_400_BAD_REQUEST)
        stored_otp = otp_data.get('otp')
        otp_expiration = otp_data.get('expiration')
        if datetime.now() > datetime.fromisoformat(otp_expiration):
            del request.session[session_key]
            return Response({"message": "OTP has expired. Please request a new OTP."}, status=status.HTTP_400_BAD_REQUEST)
        if otp == stored_otp:
            token = MyTokenObtainPairSerializer.get_token(user)
            access_token = str(token.access_token)
            refresh_token = str(token)
            del request.session[session_key]
            return Response({
                "message": "OTP verified successfully.",
                "access": access_token,
                "refresh": refresh_token
            }, status=status.HTTP_200_OK)
        else:
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
        if send_delete_requests(urls=req_url, body={'username': instance.username}) != True:
            return Response({'Error': 'Unable to update username. Please wait not to be in a game'}, status=status.HTTP_400_BAD_REQUEST)
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

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        self.check_object_permissions(request, user)
        old_username = user.username
        serializer = UserRegistrationSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            new_username = serializer.validated_data.get('username', old_username)
            if old_username != new_username:
                req_urls = [f'http://matchmaking:8443/api/matchmaking/{old_username}/update/',
                            f'http://users:8443/api/users/{old_username}/update/',
                            f'http://history:8443/api/history/user/update/{old_username}/',
                            'http://avatars:8443/api/avatars/',
                            ]
                if send_update_requests(old_username, req_urls, body={'username':new_username, 'old_username':old_username, 'new_username': new_username}) == False:
                    return Response({'Error': 'Unable to update username. Please wait not to be in a game'}, status=status.HTTP_400_BAD_REQUEST)
                serializer.save()
                token = MyTokenObtainPairSerializer.get_token(user)
                access_token = str(token.access_token)
                refresh_token = str(token)
                response_data = {
                        'OK':'update successefull',
                        'new username':user.username,
                        'access': access_token,
                        'refresh': refresh_token, 
                        }
                return Response(response_data, status=status.HTTP_200_OK)
            serializer.save()
            return Response({'Ok':'Update Successefull'}, status=status.HTTP_200_OK)
        else:
            return Response({'Error': 'Invalid Data'}, status=status.HTTP_400_BAD_REQUEST)

class PasswordUpdateView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = PasswordModficationSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]

class ServiceJWTObtainPair(APIView):
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        print('I ve beeen reached')
        serializer = ServiceObtainTokenSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MicroServiceError(APIException):
    status_code = 500
    default_detail = 'An error happend between microservice interaction. Please try again later'
    default_code = 'MicroService error'
