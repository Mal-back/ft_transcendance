from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView, Response
from .models import Match, MatchUser
from .serializers import MatchUserSerializer, MatchSerializer
from .permissions import IsAuth, IsMatchMaking

# Create your views here.

class TestView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({'OK':'Hello World !!'}, status=status.HTTP_200_OK)

class MatchUserCreate(generics.CreateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]

class MatchUserUpdate(generics.UpdateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]
    lookup_field = 'username'

class MatchUserDelete(generics.DestroyAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]
    lookup_field = 'username'

    def perform_destroy(self, instance):
        username = instance.username
        Match.objects.filter(winner=username).update(winner='deleted_account')
        Match.objects.filter(looser=username).update(looser='deleted_account')
        instance.delete()

class MatchCreate(generics.CreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer 
    permission_classes = [IsAuth]
