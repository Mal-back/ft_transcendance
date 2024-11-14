from django.db import transaction
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView, Response
from .models import Match, MatchUser, Tournament, TournamentUser
from .serializers import MatchUserSerializer, MatchSerializer, MatchGetSerializer, TournamentSerializer
from .permissions import IsAuth, IsMatchMaking
from .trad import translate

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
            Match.objects.filter(winner=old_username).update(winner=new_username)
            Match.objects.filter(looser=old_username).update(looser=new_username)
            TournamentUser.objects.filter(username=old_username).update(username=new_username)

        lang = request.headers.get('lang')
        message = translate(lang, "update_success")
        return Response({'OK':message}, status=status.HTTP_200_OK)

class MatchUserDelete(generics.DestroyAPIView):
    queryset = MatchUser.objects.all()
    serializer_class = MatchUserSerializer 
    permission_classes = [IsAuth]
    lookup_field = 'username'

    def perform_destroy(self, instance):
        username = instance.username
        Match.objects.filter(winner=username).update(winner='deleted_account')
        Match.objects.filter(looser=username).update(looser='deleted_account')
        TournamentUser.objects.filter(username=username).update(username='deleted_account', user_profile=None)
        instance.delete()

class MatchCreate(generics.CreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer 
    permission_classes = [IsMatchMaking]

class TournamentCreate(APIView):
    permission_classes = [IsMatchMaking]

    def post(self, request, *args, **kwargs):
        serializer = TournamentSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            print(obj.id)
            return Response({'id':obj.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TournamentList(generics.ListAPIView):
    serializer_class = TournamentSerializer 
    queryset = Tournament.objects.all()

class TournamentRetrieve(generics.RetrieveAPIView):
    serializer_class = TournamentSerializer 
    queryset = Tournament.objects.all()
    lookup_field = 'pk'

class MatchList(generics.ListAPIView):
    serializer_class = MatchGetSerializer 

    def get_queryset(self):
        queryset = Match.objects.all() 

        user = self.request.query_params.get('username')
        game_type = self.request.query_params.get('game_type')

        if user and game_type:
            queryset = queryset.filter(winner__username=user, game_type=game_type) | queryset.filter(looser__username=user, game_type=game_type)
        
        return queryset
