import requests
from django.utils.decorators import method_decorator
from rest_framework import generics, status
from rest_framework.views import APIView, Response, csrf_exempt
from .serializers import UserRegistrationSerializer, ServiceObtainTokenSerializer
from .permissions import IsOwner
from .models import CustomUser
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
        user = serializer.save()
        service_url = 'http://localhost:8080/api/users/create/'
        response = requests.post(service_url, json={'username': user.username})
        if response.status_code != 200:
            print('fuck')
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
