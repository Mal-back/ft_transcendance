from django.shortcuts import render
from rest_framework import generics

from .models import MatchUser
from .serializers import MatchUserSerializer
from .permissions import IsAuth, IsOwner

# Create your views here.

class MatchUserCreate(generics.CreateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    # permission_classes = [IsAuth]

class MatchUserList(generics.ListAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 

class MatchUserUpdate(generics.UpdateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]
    lookup_field = 'username'

class MatchUserDelete(generics.UpdateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]
    lookup_field = 'username'
