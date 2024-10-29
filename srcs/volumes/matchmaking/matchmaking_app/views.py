from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from requests import delete
from rest_framework import generics, response, status
from rest_framework.views import APIView, Response
from .models import MatchUser, Match
from .serializers import MatchUserSerializer, MatchSerializer, MatchResultSerializer, PendingInviteSerializer, SentInviteSerializer, AcceptedMatchSerializer
from .permissions import IsAuth, IsOwner, IsAuthenticated, IsInvitedPlayer, IsGame
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException
from .single_match_to_history import end_single_match

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
        accepted_matches = Match.objects.filter(player2=old_username, status__in=['accepted', 'in_progress'])
        matches_as_player1 = Match.objects.filter(player1=old_username, status__in=['accepted', 'in_progress'])
        if accepted_matches.exists():
            return Response({'Error':'You already have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        elif matches_as_player1.exists():
            return Response({'Error':'You already send invite'}, status=status.HTTP_400_BAD_REQUEST)

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
        accepted_matches = Match.objects.filter(player2=username, status__in=['accepted', 'in_progress'])
        matches_as_player1 = Match.objects.filter(player1=username, status__in=['accepted', 'in_progress'])
        if accepted_matches.exists():
            return Response({'Error':'You already have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        elif matches_as_player1.exists():
            return Response({'Error':'You already send invite'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            Match.objects.filter(player1=username).delete()
            Match.objects.filter(player2=username).delete()
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

class MatchCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        existing_matches = Match.objects.filter(player1=request.user.username, status__in=['pending', 'accepted', 'in_progress'])
        if existing_matches.exists():
            return Response({'Error': 'You already invited somebody'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = MatchSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(player1=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MatchGetPendingInvites(generics.ListAPIView):
    serializer_class = PendingInviteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        query = Match.objects.filter(player2=user.username, status='pending')
        if not query.exists():
            self.empty_response = True
        else:
            self.empty_response = False
        return query

    def list(self, request, *args, **kwargs):
        self.get_queryset()
        if getattr(self, 'empty_response', False):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return super().list(request, *args, **kwargs)

class MatchGetSentInvite(generics.RetrieveAPIView):
    serializer_class = SentInviteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Match.objects.get(player1=user.username, status='pending')

class MatchAcceptInvite(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayer]

    def update(self, request, *args, **kwargs):
        username = self.request.user.username
        match = self.get_object()
        self.check_object_permissions(request, match)
        accepted_matches = Match.objects.filter(player2=username, status__in=['accepted', 'in_progress'])
        matches_as_player1 = Match.objects.filter(player1=username, status__in=['pending', 'accepted', 'in_progress'])
        if accepted_matches.exists():
            return Response({'Error':'You already have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        elif matches_as_player1.exists():
            return Response({'Error':'You already send invite'}, status=status.HTTP_400_BAD_REQUEST)
        if match.status != 'pending':
            return Response({'Error':'You can\'t accept this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'accepted'
        match.save()
        #Send Request to game to game ms
        return Response({'lol': 'Ca veut dire que ca a matrcher mais y a pas de communication av le jeu'}, status=status.HTTP_206_PARTIAL_CONTENT)

class MatchDeclineInvite(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayer]

    def update(self, request, *args, **kwargs):
        match = self.get_object()
        self.check_object_permissions(request, match)
        if match.status != 'pending':
            return Response({'Error':'You can\'t declined this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'declined'
        match.delete()
        return Response({'OK':'Match Declined'}, status=status.HTTP_200_OK)

class MatchDeleteInvite(APIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsOwner]

    def delete(self, request, *args, **kwargs):
        match = self.get_object()
        self.check_object_permissions(request, match)
        if match.status != 'pending':
            return Response({'Error':'You can\'t cancel this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'cancelled'
        match.delete()
        return Response({'OK':'Match Cancelled'}, status=status.HTTP_200_OK)

class GetAcceptedMatch(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Match.objects.all()
    serializer_class = AcceptedMatchSerializer

    def get_object(self):
        user = self.request.user.username
        queryset = self.get_queryset()
        obj = generics.get_object_or_404(queryset, Q(player1=user) | Q(player2=user), status='accepted')
        return obj

class HandleMatchResult(APIView):
    queryset = Match.objects.all()
    lookup_field = 'matchId'
    permission_classes = [IsGame]

    def get_object(self, matchId):
        return get_object_or_404(self.queryset, matchId=matchId)

    def post(self, request, *args, **kwargs):
        serializer = MatchResultSerializer(data=request.data)
        match = self.get_object(kwargs['matchId'])
        if serializer.is_valid():
            data = serializer.save()
        if match.tournament is None :
            end_single_match(match, data)
            return Response({'OK':'Match Updated'}, status=status.HTTP_200_OK)
        else :
            # tournament logic here
            pass
        return Response({'Error':'Error'}, status=status.HTTP_400_BAD_REQUEST)

class DebugSetGameAsFinished(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        match = self.get_object()
        match.status = 'finished'
        match.save()
        return Response({'OK':'Match set as finished'}, status=status.HTTP_200_OK)
