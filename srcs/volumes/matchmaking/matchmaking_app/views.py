from django.db import transaction
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from requests import delete
from rest_framework import generics, response, status
from rest_framework.views import APIView, Response
from .models import MatchUser, Match, InQueueUser
from .serializers import MatchUserSerializer, MatchSerializer, MatchResultSerializer, PendingInviteSerializer, SentInviteSerializer, AcceptedMatchSerializer, MatchMakingQueueSerializer
from .permissions import IsAuth, IsOwner, IsAuthenticated, IsInvitedPlayer, IsGame, IsInitiatingPlayer
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException
from .single_match_to_history import end_single_match
from .matchmaking_queue import get_opponent, YouHaveNoOpps

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
        is_in_queue = InQueueUser.objects.filter(user=old_username).exists()
        if accepted_matches.exists():
            return Response({'Error':'You already have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        elif matches_as_player1.exists():
            return Response({'Error':'You already send invite'}, status=status.HTTP_400_BAD_REQUEST)
        elif is_in_queue:
            return Response({'Error':'You are in matchmaking'}, status=status.HTTP_400_BAD_REQUEST)

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
        is_in_queue = InQueueUser.objects.filter(user=username).exists()
        if accepted_matches.exists():
            return Response({'Error':'You already have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        elif matches_as_player1.exists():
            return Response({'Error':'You already send invite'}, status=status.HTTP_400_BAD_REQUEST)
        elif is_in_queue:
            return Response({'Error':'You are in matchmaking'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            Match.objects.filter(player1=username).delete()
            Match.objects.filter(player2=username).delete()
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

class MatchCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        existing_matches = Match.objects.filter(player1=request.user.username, status__in=['pending', 'accepted', 'in_progress'])
        is_in_queue = InQueueUser.objects.filter(user=request.user.username).exists()
        if existing_matches.exists():
            return Response({'Error': 'You already invited somebody'}, status=status.HTTP_400_BAD_REQUEST)
        elif is_in_queue:
            return Response({'Error':'You are in matchmaking'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = MatchSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            if serializer.validated_data['player2'].username == request.user.username:
                return Response({'Error': 'You can not play against yourself'}, status=status.HTTP_400_BAD_REQUEST)
            if Match.objects.filter(player1=serializer.validated_data['player2'], player2=request.user).exists():
                return Response({'Error': 'You can not create a reverse invite'}, status=status.HTTP_400_BAD_REQUEST)
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

class MatchGetSentInvite(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        try :
            match = Match.objects.get(player1=request.user.username, status='pending')
        except Match.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = SentInviteSerializer(match)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
        is_in_queue = InQueueUser.objects.filter(user=request.user.username).exists()
        if accepted_matches.exists():
            return Response({'Error':'You already have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        elif matches_as_player1.exists():
            return Response({'Error':'You already send invite'}, status=status.HTTP_400_BAD_REQUEST)
        elif is_in_queue:
            return Response({'Error':'You are in matchmaking'}, status=status.HTTP_400_BAD_REQUEST)
        if match.status != 'pending':
            return Response({'Error':'You can\'t accept this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'accepted'
        match.save()
        try:
            sender = MicroServiceClient()
            ret = sender.send_requests(
                    urls = ['http://game:8443/api/game/pong-remote/create/'],
                    expected_status=[201],
                    method='post',
                    body={
                        'player_1_name':f'{match.player1.username}',
                        'player_2_name':f'{match.player2.username}',
                        }
                    )
            response = ret['http://game:8443/api/game/pong-remote/create/'] 
            matchId = response.text.strip('"')
            match.status = 'in_progress'
            match.matchId = matchId
            match.save()
            return Response({'Ok': 'Match Created', 'MatchId': f'{matchId}'}, status=status.HTTP_201_CREATED)
        except (RequestsFailed, InvalidCredentialsException):
            return Response({'Error': 'Request failed'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class MatchDeclineInvite(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayer]

    def update(self, request, *args, **kwargs):
        match = self.get_object()
        self.check_object_permissions(request, match)
        if match.status != 'pending':
            return Response({'Error':'You can\'t decline this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'declined'
        match.delete()
        return Response({'OK':'Match Declined'}, status=status.HTTP_200_OK)

class MatchDeleteInvite(APIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInitiatingPlayer]

    def delete(self, request, *args, **kwargs):
        match_pk = self.kwargs.get('pk')
        if match_pk is None:
            return Response({'Error':'No Pk'}, status=status.HTTP_400_BAD_REQUEST)
        try :
            match = Match.objects.get(id=match_pk)
        except Match.DoesNotExist:
            return Response({'Error':'Unexisting Match'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, match)
        if match.status != 'pending':
            return Response({'Error':'You can\'t cancel this match'}, status=status.HTTP_400_BAD_REQUEST)
        match.status = 'cancelled'
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class GetAcceptedMatch(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Match.objects.all()
    serializer_class = AcceptedMatchSerializer

    def get_object(self):
        user = self.request.user.username
        queryset = self.get_queryset()
        obj = generics.get_object_or_404(queryset, Q(player1=user) | Q(player2=user), status__in=['accepted', 'in_progress'])
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
            if match.tournament is None :
                end_single_match(match, serializer.validated_data)
                return Response({'OK':'Match Updated'}, status=status.HTTP_200_OK)
            else :
                # tournament logic here
                pass
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DebugSetGameAsFinished(APIView):
    def get(self, request, *args, **kwargs):
        id = self.kwargs.get('pk')
        match = Match.objects.get(id=id)
        match.status = 'finished'
        match.save()
        return Response({'OK':'Match set as finished'}, status=status.HTTP_200_OK)

class MatchMakingJoinQueue(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        accepted_matches = Match.objects.filter(player2=request.user.username, status__in=['accepted', 'in_progress'])
        matches_as_player1 = Match.objects.filter(player1=request.user.username, status__in=['pending', 'accepted', 'in_progress'])
        if InQueueUser.objects.filter(user=request.user.username).exists():
            return Response({'Error': 'You\'re already in the queue'}, status=status.HTTP_400_BAD_REQUEST)
        elif accepted_matches.exists():
            return Response({'Error':'You already have game in progress'}, status=status.HTTP_400_BAD_REQUEST)
        elif matches_as_player1.exists():
            return Response({'Error':'You already send invite'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = MatchMakingQueueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, win_rate=request.user.win_rate)
            print(request.user.win_rate)
            return Response({'Ok':'You are in queue'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MatchMakingRequestMatch(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try :
            queueUser = InQueueUser.objects.get(user=request.user.username)
            print('cc')
        except InQueueUser.DoesNotExist :
            return Response({'Error': 'You\'re not in the queue'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            new_match = get_opponent(queueUser)
            serializer = AcceptedMatchSerializer(new_match)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except YouHaveNoOpps:
            return Response(status=status.HTTP_204_NO_CONTENT)

class MatchMakingLeaveQueue(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        try :
            queueUser = InQueueUser.objects.get(user=request.user.username)
        except InQueueUser.DoesNotExist :
            return Response({'Error': 'You\'re not in the queue'}, status=status.HTTP_400_BAD_REQUEST)
        queueUser.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DebugIncrementVictory(APIView):
    def get(self, request, *args, **kwargs):
        username = self.kwargs.get('username')
        if username is not None:
            MatchUser.objects.filter(username=username).update(match_won=F('match_won') + 1) 
        return Response({'Ok':'Kr'}, status=status.HTTP_200_OK)

class DebugIncrementLoose(APIView):
    def get(self, request, *args, **kwargs):
        username = self.kwargs.get('username')
        if username is not None:
            MatchUser.objects.filter(username=username).update(match_lost=F('match_lost') + 1) 
        return Response({'Ok':'Kr'}, status=status.HTTP_200_OK)
