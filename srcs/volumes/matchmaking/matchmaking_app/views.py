from django.db import transaction
from django.db.models import F, Q
from django.shortcuts import get_object_or_404, redirect
from requests import delete
from rest_framework import generics, response, status
from rest_framework.views import APIView, Response
from .models import MatchUser, Match, InQueueUser, Tournament, TournamentUser
from .serializers import MatchUserSerializer, MatchSerializer, MatchResultSerializer, PendingInviteSerializer, SentInviteSerializer, AcceptedMatchSerializer, MatchMakingQueueSerializer, TournamentSerializer, TournamentAddPlayersSerializer, TournamentRemovePlayersSerializer, InviteSerializer, TournamentDetailSerializer, TournamentConciseSerializer
from .permissions import IsAuth, IsOwner, IsAuthenticated, IsInvitedPlayer, IsGame, IsInitiatingPlayer, IsInvitedPlayerTournament, IsConfirmedPlayerTournament
from ms_client.ms_client import MicroServiceClient, RequestsFailed, InvalidCredentialsException
from .single_match_to_history import end_single_match
from .matchmaking_queue import get_opponent, YouHaveNoOpps
from .match_utils import check_user_restrictions
from .tournament import schedule_rounds, handle_finished_matches, TournamentInternalError

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
        conflict = check_user_restrictions(user)
        if conflict:
            return conflict

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
        conflict = check_user_restrictions(instance)
        if conflict:
            return conflict

        Match.objects.filter(player1=username).delete()
        Match.objects.filter(player2=username).delete()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MatchCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        conflict = check_user_restrictions(request.user)
        if conflict:
            return conflict

        serializer = MatchSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            if serializer.validated_data['player2'].username == request.user.username:
                return Response({'Error': 'You can not play against yourself'}, status=status.HTTP_409_CONFLICT)
            if Match.objects.filter(player1=serializer.validated_data['player2'], player2=request.user).exists():
                return Response({'Error': 'You can not create a reverse invite'}, status=status.HTTP_409_CONFLICT)
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

class GetInvite(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        matchQuery = Match.objects.filter(Q(player1=user) | Q(player2=user), status='pending')
        tournamentQuery = Tournament.objects.filter(Q(invited_players=user) | Q(confirmed_players__user=user), status='pending').distinct() 
        try :
            on_going_match = Match.objects.get(Q(player1=user) | Q(player2=user), status__in=['accepted', 'in_progress'])
        except Match.DoesNotExist:
            on_going_match = None

        try :
            is_in_queue = InQueueUser.objects.get(user=request.user)
        except Match.DoesNotExist:
            is_in_queue = None

        try :
            is_in_tournament = TournamentUser.objects.get(user=request.user)
        except Match.DoesNotExist:
            is_in_queue = None

        if matchQuery.exists():
            match_serializer = InviteSerializer(matchQuery, context={'request':request}, many=True)
            match_data = match_serializer.data
        else:
            match_data = None

        if on_going_match:
            on_going_match_serializer = AcceptedMatchSerializer(on_going_match)
            on_going_data = on_going_match_serializer.data

        if tournamentQuery.exists():
            tournament_serializer = TournamentConciseSerializer(tournamentQuery, context={'request':request}, many=True) 
            tournament_data = tournament_serializer.data
        else:
            tournament_data = None

        if not match_data and not tournament_data and not on_going_match:
            return Response(status=status.HTTP_204_NO_CONTENT)

        combined_data = {
            'current_tournament': '/api/matchmaking/detail/' if is_in_tournament else None,
            'is_in_queue': True if is_in_queue else False,
            'on_going_match': on_going_data if on_going_match else {},  
            'match_pending': match_data if match_data else [],
            'tournament_pending': tournament_data if tournament_data else []
        }

        return Response(combined_data, status=status.HTTP_200_OK)


class MatchAcceptInvite(generics.UpdateAPIView):
    queryset = Match.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayer]

    def update(self, request, *args, **kwargs):
        username = self.request.user.username
        match = self.get_object()
        self.check_object_permissions(request, match)

        conflict = check_user_restrictions(request.user)
        if conflict:
            return conflict

        match.status = 'accepted'
        match.save()
        try:
            sender = MicroServiceClient()
            ret = sender.send_requests(
                    urls = [f'http://game:8443/api/game/{match.game_type}-remote/create/'],
                    expected_status=[201],
                    method='post',
                    body={
                        'player_1_name':f'{match.player1.username}',
                        'player_2_name':f'{match.player2.username}',
                        }
                    )
            response = ret[f'http://game:8443/api/game/{match.game_type}-remote/create/'] 
            print(response.status_code)
            print(response.text)
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
            return Response({'Error':'You can\'t decline this match'}, status=status.HTTP_409_CONFLICT)
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
            return Response({'Error':'Unexisting Match'}, status=status.HTTP_409_CONFLICT)
        self.check_object_permissions(request, match)
        if match.status != 'pending':
            return Response({'Error':'You can\'t cancel this match'}, status=status.HTTP_409_CONFLICT)
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
                handle_finished_matches(match, serializer.validated_data)
                return Response({'OK':'Match Updated'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        match = self.get_object(kwargs['matchId'])
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

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
        conflict = check_user_restrictions(request.user)
        if conflict:
            return conflict

        serializer = MatchMakingQueueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, win_rate=request.user.win_rate)
            return Response({'Ok':'You are in queue'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MatchMakingRequestMatch(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try :
            on_going_match = Match.objects.get(Q(player1=request.user) | Q(player2=request.user), status__in=['accepted', 'in_progress'])
            serializer = AcceptedMatchSerializer(on_going_match)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Match.DoesNotExist:
            pass
        try :
            queueUser = InQueueUser.objects.get(user=request.user.username)
        except InQueueUser.DoesNotExist :
            return Response({'Error': 'You\'re not in the queue'}, status=status.HTTP_409_CONFLICT)
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
            return Response({'Error': 'You\'re not in the queue'}, status=status.HTTP_409_CONFLICT)
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

class CreateTournament(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        conflict = check_user_restrictions(request.user)
        if conflict:
            return conflict

        serializer = TournamentSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.username in serializer.validated_data['invited_players']:
                return Response({'Error': 'You can not play against yourself'}, status=status.HTTP_409_CONFLICT)
            tournament = serializer.save(owner=request.user)
            owner = TournamentUser.objects.create(user=request.user, tournament=tournament)
            tournament.confirmed_players.add(owner)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AcceptTournamentInvite(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayerTournament]

    def update(self, request, *args, **kwargs):
        username = self.request.user.username
        tournament = self.get_object()
        self.check_object_permissions(request, tournament)
        conflict = check_user_restrictions(request.user)
        if conflict:
            return conflict

        if tournament.status != 'pending':
            return Response({'Error':'Tournament already started'}, status=status.HTTP_409_CONFLICT)
        TournamentUser.objects.create(user=request.user, tournament=tournament)
        tournament.invited_players.remove(request.user)
        return Response({'OK':'You accept the tournament'}, status=status.HTTP_200_OK)

class DeclineTournamentInvite(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsInvitedPlayerTournament]

    def update(self, request, *args, **kwargs):
        user = self.request.user
        tournament = self.get_object()
        self.check_object_permissions(request, tournament)
        if tournament.status != 'pending':
            return Response({'Error':'Tournament already started'}, status=status.HTTP_409_CONFLICT)
        tournament.invited_players.remove(user)
        return Response({'Ok':'You refuse invite'}, status=status.HTTP_200_OK)

class LeaveTournament(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    lookup_field = 'pk'
    permission_classes = [IsConfirmedPlayerTournament]

    def update(self, request, *args, **kwargs):
        tournament = self.get_object()
        self.check_object_permissions(request, tournament)
        try:
            player = tournament.confirmed_players.get(user=request.user)
        except TournamentUser.DoesNotExist:
            return Response({'Error':'You\'re not in the tournament'}, status=status.HTTP_409_CONFLICT)
        if tournament.status != 'pending':
            return Response({'Error':'Tournament already started'}, status=status.HTTP_409_CONFLICT)
        player.delete()
        return Response({'Ok':'You left tournament'}, status=status.HTTP_200_OK)

class AddInvitedPlayers(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        try :
            obj = Tournament.objects.get(owner=user)
        except Tournament.DoesNotExist:
            return None
        return obj

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = TournamentAddPlayersSerializer(data=request.data, instance=obj, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'OK':'Players List updated'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

class RemoveInvitedPlayers(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        try :
            obj = Tournament.objects.get(owner=user)
        except Tournament.DoesNotExist:
            return None
        return obj

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = TournamentRemovePlayersSerializer(data=request.data, instance=obj, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'OK':'Players List updated'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

class DeleteTournament(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        if obj.status != 'pending':
            return Response({'Error': 'Tournament already started'}, status=status.HTTP_409_CONFLICT)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        user = self.request.user
        try :
            obj = Tournament.objects.get(owner=user)
        except Tournament.DoesNotExist:
            return None
        return obj

class LaunchTournament(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        try :
            obj = Tournament.objects.get(owner=user)
        except Tournament.DoesNotExist:
            return None
        return obj

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        if obj.confirmed_players.count() < 3:
            return Response({'Error': 'A tournament should have at least three players'}, status=status.HTTP_409_CONFLICT)
        obj.status = 'in_progress'
        obj.save()
        try :
            schedule_rounds(obj)
        except TournamentInternalError:
            obj.delete()
            return Response({'Error':'Tournament are not available at the moment'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'OK':'Tournament started'}, status=status.HTTP_200_OK)

class LaunchNextRound(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        try :
            obj = Tournament.objects.get(owner=user)
        except Tournament.DoesNotExist:
            return None
        return obj

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        if Match.objects.filter(tournament=obj).exists() :
            return Response({'Error':'Round is not finished'}, status=status.HTTP_409_CONFLICT)
        elif obj.status == 'pending':
            return Response({'Error':'Tournament did not start'}, status=status.HTTP_409_CONFLICT)
        elif obj.status == 'finished':
            return Response({'Error':'Tournament already finished'}, status=status.HTTP_409_CONFLICT)
        obj.current_round += 1
        obj.save()
        try :
            schedule_rounds(obj)
        except TournamentInternalError:
            obj.delete()
            return Response({'Error':'Tournament are not available at the moment'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'OK':'Next round started'}, status=status.HTTP_200_OK)

class GetTournament(APIView):
    def get_object(self):
        user = self.request.user
        try :
            t_user = TournamentUser.objects.get(user=user)
            obj = TournamentUser.tournament
        except TournamentUser.DoesNotExist:
            return None
        return obj

    def get(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        if obj.status == 'finished':
            return redirect(f'/api/matchmaking/tournament/{obj.historyId}/', permanent=False)
        serializer = TournamentDetailSerializer(obj, context={'request':request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DebugSetTournamentAsFinished(APIView):
    def get(self, request, *args, **kwargs):
        id = self.kwargs.get('pk')
        tournament = Tournament.objects.get(id=id)
        tournament.delete()
        return Response({'OK':'Match set as finished'}, status=status.HTTP_200_OK)
