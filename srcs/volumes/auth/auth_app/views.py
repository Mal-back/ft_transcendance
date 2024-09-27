import requests
from django.utils.decorators import method_decorator
from rest_framework import generics, status
from rest_framework.response import Serializer
from rest_framework.views import APIView, Response, csrf_exempt
from .serializers import UserRegistrationSerializer, ServiceObtainTokenSerializer, MyTokenObtainPairSerializer, PasswordModficationSerializer
from .permissions import IsOwner
from .models import CustomUser
from .requests_manager import send_delete_requests, send_create_requests
from rest_framework import serializers
from rest_framework.exceptions import APIException
# Create your views here.

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
        req_url = [f'http://users:8443/api/users/delete/{instance.username}/',]
        send_delete_requests(url=req_url)
        instance.delete()


class UserCreateView(generics.ListCreateAPIView) :
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    lookup_field = 'username'

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data.get('username')
        req_urls = ['http://users:8443/api/users/create/',
                   'http://matchmaking:8443/api/matchmaking/create/',]
        if send_create_requests(urls=req_urls, body={'username':username}) == False:
            raise MicroServiceError
        user = serializer.save()
        return user
        

class UserUpdateView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]

    def perform_update(self, serializer):
        serializer.is_valid(raise_exception=True)
        instance = self.get_object()
        old_username = instance.username
        new_username = serializer.validated_data.get('username', old_username)
        # if old_username != new_username:
        #     req_url = f'http://users:8443/api/users/{old_username}/update/'
        #     if send_request(url=req_url, method='patch', body={'username':new_username}) != 200:
        #         raise serializers.ValidationError('Invalid data sent to users ms')
        #     else :
        #         serializer.save()
        # else:
        #     serializer.save()
        return serializer.instance

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        user = self.perform_update(serializer=serializer)

        token = MyTokenObtainPairSerializer.get_token(user)
        access_token = str(token.access_token)
        refresh_token = str(token)
        response_data = {
                'message':'update successefull',
                'new username':user.username,
                'access': access_token,
                'refresh': refresh_token, 
                }
        response_data.update(serializer.data)
        return Response(response_data, status=status.HTTP_200_OK)

class PasswordUpdateView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = PasswordModficationSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]

class ServiceJWTObtainPair(APIView):
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        serializer = ServiceObtainTokenSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MicroServiceError(APIException):
    status_code = 500
    default_detail = 'An error happend between microservice interaction. Please try again later'
    default_code = 'MicroService error'
