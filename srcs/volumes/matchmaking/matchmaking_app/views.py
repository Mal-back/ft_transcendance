from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, response, status
from rest_framework.views import APIView, Response
from .models import MatchUser, Match
from .serializers import MatchUserSerializer, MatchSerializer, MatchResultSerializer, PendingInviteSerializer, SentInviteSerializer
from .permissions import IsAuth, IsOwner, IsAuthenticated, IsInvitedPlayer, IsGame
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException

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
        existing_matches = Match.objects.filter(player1=self.request.user.username)
        if existing_matches.exists():
            return Response({'Error':'Yo already invite somebody'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(player1=self.request.user.username)
        return Response({'OK':'Invite sent'}, status=status.HTTP_201_CREATED)

class MatchGetPendingInvites(generics.ListAPIView):
    serializer_class = PendingInviteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(player2=user.username)

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
        accepted_matches = Match.objects.filter(player2=username, status__in=['accepted', 'in_progress'])
        matches_as_player1 = Match.objects.filter(player1=username, status__in=['pending', 'accepted', 'in_progress'])
        if accepted_matches.exists() or matches_as_player1.exists():
            return Response({'Error':'You already send invites or have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        match = self.get_object()
        if match.status != 'pending':
            return Response({'Error':'You can\'t accept this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'accepted'
        match.save()
        #Send Request to game to game ms

class MatchDeclineInvite(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayer]

    def update(self, request, *args, **kwargs):
        match = self.get_object()
        if match.status != 'pending':
            return Response({'Error':'You can\'t declined this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'declined'
        match.save()
        return Response({'OK':'Match Declined'}, status=status.HTTP_200_OK)

class MatchDeleteInvite(APIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsOwner]

    def delete(self, request, *args, **kwargs):
        match = self.get_object()
        if match.status != 'pending':
            return Response({'Error':'You can\'t cancel this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'cancelled'
        return Response({'OK':'Match Cancelled'}, status=status.HTTP_200_OK)

class GetAcceptedMatch(generics.RetrieveAPIView):
    queryset = Match.objects.all()

    def get_object(self):
        user = self.request.user.username
        queryset = self.get_queryset()
        obj = generics.get_object_or_404(queryset, Q(player1=user) | Q(player2=user), status='accepted')
        return obj

class HandleMatchResult(APIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsGame]

    def get_object(self, pk):
        return get_object_or_404(self.queryset, id=pk)

    def post(self, request, *args, **kwargs):
        serializer = MatchResultSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            sender = MicroServiceClient()
            try :
                sender.send_requests(urls=[f"http://users:8443/api/users/{data['winner']}/increment/single_games_won",
                                            "http://users:8443/api/users/{data['looser']}/increment/single_games_lost",],
                                     method='patch',
                                     expected_status=[200]) 
            except (RequestsFailed, InvalidCredentialsException):
                pass
            try :
                # sender.send_requests(urls=["http://users:8443/api/history/"],
                #                      method='post',
                #                      expected_status=[201],
                #                      body=data) 
                pass
            except (RequestsFailed, InvalidCredentialsException):
                pass
            match = self.get_object(kwargs['pk'])
            match.status = 'finished'
            match.save()
            return Response({'OK':'Match Updated'}, status=status.HTTP_200_OK)
        return Response({'Error':'Error'}, status=status.HTTP_400_BAD_REQUEST)

class DebugSetGameAsFinished(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        match = self.get_object()
        match.status = 'finished'
        match.save()
        return Response({'OK':'Match set as finished'}, status=status.HTTP_200_OK)
# Remain the view to handle finished game


