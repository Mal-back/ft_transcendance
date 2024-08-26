from django.http import HttpResponse
from django.shortcuts import render
from django.views import View
from rest_framework import generics
from .models import PublicUser
from .serializers import PublicUserDetailSerializer, PublicUserListSerializer

# Create your views here.

class PublicUserCreateList(generics.ListCreateAPIView):
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserListSerializer

class PublicUserRetrieveDetail(generics.RetrieveAPIView):
    queryset = PublicUser.objects.all()
    serializer_class = PublicUserDetailSerializer

