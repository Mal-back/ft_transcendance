import requests
from django.utils.decorators import method_decorator
from rest_framework import generics, status
from rest_framework.response import Serializer
from rest_framework.views import APIView, Response, csrf_exempt
from .serializers import UserRegistrationSerializer, ServiceObtainTokenSerializer, createServiceToken, MyTokenObtainPairSerializer
from .permissions import IsOwner
from .models import CustomUser, Service
from rest_framework import serializers
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
        token = createServiceToken(Service.objects.get('auth'))
        headers = {'Authorization': f'Bearer {token}'}
        req_url = f'http://users:8443/api/users/{instance.username}/delete/'
        response = requests.delete(req_url, headers=headers)
        if response.status != 204:
            raise serializers.ValidationError('Invalid data sent to users ms')
        instance.delete()


class UserCreateView(generics.ListCreateAPIView) :
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    lookup_field = 'username'

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data.get('username')
        token = createServiceToken(Service.objects.get(serviceName='auth'))
        headers = {'Authorization' : f'Bearer {token}'}
        service_url = 'http://users:8443/api/users/create/'
        response = requests.post(service_url, json={'username': username}, headers=headers)
        if response.status_code != 201:
            raise serializers.ValidationError('Invalid data sent to users ms')
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
        print(old_username)
        print(new_username)
        if old_username != new_username:
            token = createServiceToken(Service.objects.get(serviceName='auth'))
            headers = {'Authorization' : f'Bearer {token}'}
            service_url = f'http://users:8443/api/users/{old_username}/update/'
            response = requests.patch(service_url, json={'username': new_username}, headers=headers)
            if response.status_code != 200:
                raise serializers.ValidationError('Invalid data sent to users ms')
            else :
                serializer.save()
        else:
            serializer.save()
        return serializer.instance

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        user = self.perform_update(serializer=serializer)

        token = MyTokenObtainPairSerializer.get_token(user)
        print(token)
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

        




class ServiceJWTObtainPair(APIView):
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        serializer = ServiceObtainTokenSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
