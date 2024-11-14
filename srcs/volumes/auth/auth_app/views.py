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
from sendgrid.helpers.mail import Mail, Email, To, Content
import string
import sendgrid
from django.conf import settings
from datetime import datetime, timedelta
import pyotp
from django_otp.plugins.otp_totp.models import TOTPDevice

# class CustomTokenObtainPairView(TokenObtainPairView):

#     def post(self, request, *args, **kwargs):
      
#         username = request.data.get('username')
#         password = request.data.get('password')
#         if not username or not password:
#             return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
#         user = authenticate(request, username=username, password=password)
#         if user is None:
#             print("TEST")
#             return super().post(request, *args, **kwargs)
#         print(user.email)
#         if user.two_fa_enabled:
#             otp = self.generate_otp()
#             session_key = f"otp_{user.username}"
#             request.session[session_key] = {
#                 'otp': otp,
#                 'expiration': str(datetime.now() + timedelta(minutes=5))
#             }
#             try:
#                 self.send_otp_email(user.email, otp)
#             except:
#                 return Response({
#                 "error": "Can not send mail",
#             }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
#             return Response({
#                 'message': 'A 5 minutes one-time authentication code has been sent to your email. Please enter it to complete the login.'
#             }, status=202)
#         return super().post(request, *args, **kwargs)


#     def send_otp_email(self, email, otp):
#         subject = "Authentication code Transcendance"
#         message = f"Your one-time authentication code is : {otp}"
#         from_email = settings.DEFAULT_FROM_EMAIL
#         recipient_list = [email,]
#         send_mail(subject, message, from_email, recipient_list)


#     def generate_otp(self):
#         otp = str().join(random.choices(string.digits, k=6))
#         return otp


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    This view handles the initial authentication and, if 2FA is enabled, asks for the OTP.
    """

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user (password check)
        user = authenticate(request, username=username, password=password)

        if user is None:
            return super().post(request, *args, **kwargs)  # Fall back to JWT flow if authentication fails

        # Check if 2FA is enabled
        if user.two_fa_enabled:

            # User has 2FA enabled, return a 202 status and prompt for OTP verification
            return Response({
                'message': '2FA is enabled. Please enter the OTP from your Google Authenticator app.'
            }, status=status.HTTP_202_ACCEPTED)

        # If 2FA is not enabled, proceed with JWT flow
        return super().post(request, *args, **kwargs)
    
class OTPValidationView(APIView):
    """
    This view verifies the OTP entered by the user when 2FA is enabled.
    """

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        otp = request.data.get("otp")

        # Check if all necessary fields are provided
        if not username or not otp:
            return Response({"message": "Username and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate user with password first
        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({"message": "Invalid credentials."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure the user has a valid TOTP device (2FA setup)
        try:
            device = TOTPDevice.objects.get(user=user)
        except TOTPDevice.DoesNotExist:
            return Response({"message": "No 2FA device set up for this user."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify the OTP provided by the user
        if device.verify_token(otp):
            # OTP is valid, generate JWT tokens
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
        

# class UserUpdateView(generics.UpdateAPIView):
#     queryset = CustomUser.objects.all()
#     lookup_field = 'username'
#     permission_classes = [IsOwner]

#     def update(self, request, *args, **kwargs):
#         user = self.get_object()
#         self.check_object_permissions(request, user)
#         old_username = user.username
#         serializer = UserRegistrationSerializer(user, data=request.data, partial=True)
#         if serializer.is_valid():
#             new_username = serializer.validated_data.get('username', old_username)
#             if old_username != new_username:
#                 req_urls = [f'http://matchmaking:8443/api/matchmaking/{old_username}/update/',
#                             f'http://users:8443/api/users/{old_username}/update/',
#                             f'http://history:8443/api/history/user/update/{old_username}/',
#                             'http://avatars:8443/api/avatars/',
#                             ]
#                 if send_update_requests(old_username, req_urls, body={'username':new_username, 'old_username':old_username, 'new_username': new_username}) == False:
#                     return Response({'Error': 'Unable to update username. Please wait not to be in a game'}, status=status.HTTP_400_BAD_REQUEST)
#                 serializer.save()
#                 token = MyTokenObtainPairSerializer.get_token(user)
#                 access_token = str(token.access_token)
#                 refresh_token = str(token)
#                 response_data = {
#                         'OK':'update successefull',
#                         'new username':user.username,
#                         'access': access_token,
#                         'refresh': refresh_token, 
#                         }
#                 return Response(response_data, status=status.HTTP_200_OK)
#             serializer.save()
#             return Response({'Ok':'Update Successefull'}, status=status.HTTP_200_OK)
#         else:
#             return Response({'Error': 'Invalid Data'}, status=status.HTTP_400_BAD_REQUEST)


class UserUpdateView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    lookup_field = 'username'
    permission_classes = [IsOwner]
    serializer_class = UserRegistrationSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        self.check_object_permissions(request, user)
        old_username = user.username
        serializer = UserRegistrationSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Get the new username from the data (if it has been updated)
            new_username = serializer.validated_data.get('username', old_username)
            
            # If the username is changed, make the update
            if old_username != new_username:
                req_urls = [
                    f'http://matchmaking:8443/api/matchmaking/{old_username}/update/',
                    f'http://users:8443/api/users/{old_username}/update/',
                    f'http://history:8443/api/history/user/update/{old_username}/',
                    'http://avatars:8443/api/avatars/',
                ]
                if send_update_requests(old_username, req_urls, body={'username': new_username, 'old_username': old_username, 'new_username': new_username}) == False:
                    return Response({'Error': 'Unable to update username. Please wait not to be in a game'}, status=status.HTTP_400_BAD_REQUEST)
                serializer.save()
                token = MyTokenObtainPairSerializer.get_token(user)
                access_token = str(token.access_token)
                refresh_token = str(token)
                response_data = {
                    'OK': 'Update successful',
                    'new username': user.username,
                    'access': access_token,
                    'refresh': refresh_token,
                }
                return Response(response_data, status=status.HTTP_200_OK)

            # If the username is not changed, handle enabling/disabling 2FA
            two_fa_enabled = serializer.validated_data.get('two_fa_enabled', user.two_fa_enabled)
            
            if two_fa_enabled and not user.two_fa_enabled:
                # Enable 2FA
                device = TOTPDevice.objects.create(user=user, name="Default 2FA Device")
                device.save()

                # Generate the OTP URI (to be used for QR code generation)
                otp_uri = device.config_url

                return Response({
                    'Ok': 'Update successful',
                    'otp_uri': otp_uri,  # This URI can be used to generate the QR code in the frontend
                    'device_id': device.id
                }, status=status.HTTP_200_OK)

            elif not two_fa_enabled and user.two_fa_enabled:
                # Disable 2FA (delete the TOTP device)
                try:
                    device = TOTPDevice.objects.get(user=user)
                    device.delete()
                except TOTPDevice.DoesNotExist:
                    pass  # If no device exists, simply continue

                return Response({
                    'message': '2FA disabled successfully.'
                }, status=status.HTTP_200_OK)

            # If there is no change in the 2FA setting, proceed with normal update
            serializer.save()
            return Response({'Ok': 'Update successful'}, status=status.HTTP_200_OK)

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
