from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer
from .permissions import IsOwner
# Create your views here.

class UserDetailView(generics.RetrieveAPIView) :
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsOwner]

class UserDeleteView(generics.DestroyAPIView) :
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsOwner]

class UserCreateView(generics.ListCreateAPIView) :
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsOwner]
