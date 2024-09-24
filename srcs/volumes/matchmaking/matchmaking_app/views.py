from django.shortcuts import render
from rest_framework import generics

from .models import MatchUser
from .serializers import MatchUserSerializer

# Create your views here.

class MatchUserCreate(generics.CreateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 

class MatchUserList(generics.ListAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
