from django.shortcuts import render
from rest_framework import generics

from .models import MatchUser
from .serializers import MatchUserSerializer
from .permissions import isAuth

# Create your views here.

class MatchUserCreate(generics.CreateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    # permission_classes = [isAuth]

class MatchUserList(generics.ListAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
