from django.shortcuts import render
from rest_framework import generics

from .models import MatchUser, Match
from .serializers import MatchUserSerializer, MatchSerializer
from .permissions import IsAuth, IsOwner, IsAuthenticated, IsInvitedPlayer

# Create your views here.

class MatchUserCreate(generics.CreateAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]

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

class MatchCreate(generics.CreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(player1=self.request.user.username)

class MatchGetPendingInvites(generics.ListAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(player2=user.username)

class MatchAcceptInvite(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        match = self.get_object()
        match.status = 'accepted'
        match.save()

        #Send Request to game to game ms
