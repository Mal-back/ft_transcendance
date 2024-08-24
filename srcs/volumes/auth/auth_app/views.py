from logging import raiseExceptions
from django.contrib.auth import authenticate
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.views import Response, status
from .serializers import UserRegistrationSerializer, UserLoginSerializer
from rest_framework import permissions
# Create your views here.

class UserDetailView(generics.RetrieveAPIView) :
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class UserCreateView(generics.CreateAPIView) :
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
