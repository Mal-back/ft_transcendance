from django.db import transaction
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView, Response
from .models import Match, MatchUser
from .serializers import MatchUserSerializer, MatchSerializer, MatchGetSerializer
from .permissions import IsAuth, IsMatchMaking

# Create your views here.

class MatchUserCreate(generics.CreateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]

class MatchUserUpdate(generics.UpdateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]
    lookup_field = 'username'

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        old_username = kwargs.get('username')
        new_username = request.data.get('username')

        with transaction.atomic():
            user.username = new_username
            user.save()
            Match.objects.filter(player1=old_username).update(player1=new_username)
            Match.objects.filter(player2=old_username).update(player2=new_username)

        return Response({'OK':'Update Successefull'}, status=status.HTTP_200_OK)

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
    # permission_classes = [IsMatchMaking]

class MatchList(generics.ListAPIView):
    serializer_class = MatchGetSerializer 

    def get_queryset(self):
        queryset = Match.objects.all() 

        user = self.request.query_params.get('username')

        if user:
            queryset = queryset.filter(winner__username=user) | queryset.filter(looser__username=user)
        
        return queryset
