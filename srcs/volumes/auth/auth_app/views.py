import requests
from django.utils.decorators import method_decorator
from rest_framework import generics, status
from rest_framework.response import Serializer
from rest_framework.views import APIView, Response, csrf_exempt
from .serializers import UserRegistrationSerializer, ServiceObtainTokenSerializer, createServiceToken
from .permissions import IsOwner
from .models import CustomUser, Service
from auth.auth_app import serializers
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
        if response.status_code != 200:
            raise serializers.ValidationError('Invalid data sent to users ms')
        user = serializer.save()
        return user
        

class UserUpdateView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]

class ServiceJWTObtainPair(APIView):
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        serializer = ServiceObtainTokenSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
