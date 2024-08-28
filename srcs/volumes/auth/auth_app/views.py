from rest_framework import generics
from .serializers import UserRegistrationSerializer, UserLoginSerializer
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

class UserUpdateView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    lookup_field = 'username'
    permission_classes = [IsOwner]
