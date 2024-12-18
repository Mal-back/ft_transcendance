from django.core.serializers.base import SerializationError
from django.forms import ValidationError
from django.utils import choices
from rest_framework import serializers
from .models import MatchUser, Match, InQueueUser, Tournament, TournamentUser
from .trad import translate

class MatchUserSerializer(serializers.ModelSerializer):
    class Meta :
        model = MatchUser
        fields = ['username']

class MatchUserDetailSerializer(serializers.ModelSerializer):
    class Meta :
        model = MatchUser
        fields = ['username', 'pong_match_won', 'pong_match_lost',
                  'c4_match_won', 'c4_match_lost', 'pong_win_rate',
                  'c4_win_rate']

class MatchSerializer(serializers.ModelSerializer):
    class Meta :
        model = Match
        fields = ['player2', 'game_type',]
        def validate_player2(self, value):            
            if not MatchUser.objects.filter(username=value).exists():
                lang = request.headers.get('lang')
                message = translate(lang, "invited_player_error")
                raise ValidationError(message)
            return value

class PendingInviteSerializer(serializers.ModelSerializer):
    accept_invite = serializers.SerializerMethodField()
    decline_invite = serializers.SerializerMethodField()
    player1_profile = serializers.SerializerMethodField()
    player2_profile = serializers.SerializerMethodField()
    class Meta :
        model = Match
        fields = ['id', 'player1', 'player2', 'matchId', 'status', 'game_type', 'created_at',
                  'accept_invite', 'decline_invite', 'player1_profile', 'player2_profile']
        extra_kwargs = {
                    'matchId': {'read_only': True},
                    'status': {'read_only': True},
                    'created_at': {'read_only': True},
                    'id': {'read_only': True},
                }
    def get_accept_invite(self, obj):
        match_id = obj.id
        return(f"/api/matchmaking/match/{match_id}/accept/")
    
    def get_decline_invite(self, obj):
        match_id = obj.id
        return(f"/api/matchmaking/match/{match_id}/decline/")

    def get_player1_profile(self, obj):
        player1 = obj.player1.username
        return(f"/api/users/{player1}")

    def get_player2_profile(self, obj):
        player2 = obj.player2.username
        return(f"/api/users/{player2}")

class InviteSerializer(serializers.ModelSerializer):
    accept_invite = serializers.SerializerMethodField()
    decline_invite = serializers.SerializerMethodField()
    delete_invite = serializers.SerializerMethodField()
    player1_profile = serializers.SerializerMethodField()
    player2_profile = serializers.SerializerMethodField()
    class Meta :
        model = Match
        fields = ['id', 'player1', 'player2', 'matchId', 'status', 'game_type', 'created_at',
                  'accept_invite', 'decline_invite', 'delete_invite','player1_profile', 'player2_profile']
        extra_kwargs = {
                    'matchId': {'read_only': True},
                    'status': {'read_only': True},
                    'created_at': {'read_only': True},
                    'id': {'read_only': True},
                }
    def get_accept_invite(self, obj):
        request = self.context.get('request')
        user = request.user
        if obj.player2 == user:
            match_id = obj.id
            return(f"/api/matchmaking/match/{match_id}/accept/")
        return None
    
    def get_decline_invite(self, obj):
        request = self.context.get('request')
        user = request.user
        if obj.player2 == user:
            match_id = obj.id
            return(f"/api/matchmaking/match/{match_id}/decline/")
        return None

    def get_delete_invite(self, obj):
        request = self.context.get('request')
        user = request.user
        if obj.player1 == user:
            match_id = obj.id
            return(f"/api/matchmaking/match/{match_id}/delete/")
        return None

    def get_player1_profile(self, obj):
        player1 = obj.player1.username
        return(f"/api/users/{player1}")

    def get_player2_profile(self, obj):
        player2 = obj.player2.username
        return(f"/api/users/{player2}")


class AcceptedMatchSerializer(serializers.ModelSerializer):
    player1_profile = serializers.SerializerMethodField()
    player2_profile = serializers.SerializerMethodField()
    is_tournament_match = serializers.SerializerMethodField()
    class Meta :
        model = Match
        fields = ['player1', 'player2', 'matchId', 'player1_profile', 'player2_profile', 'is_tournament_match', 'game_type']

    def get_player1_profile(self, obj):
        player1 = obj.player1.username
        return(f"/api/users/{player1}")

    def get_player2_profile(self, obj):
        player2 = obj.player2.username
        return(f"/api/users/{player2}")

    def get_is_tournament_match(self, obj):
        return obj.tournament is not None

class SentInviteSerializer(serializers.ModelSerializer):
    delete_invite = serializers.SerializerMethodField()
    player1_profile = serializers.SerializerMethodField()
    player2_profile = serializers.SerializerMethodField()
    class Meta :
        model = Match
        fields = ['id', 'player1', 'player2', 'matchId', 'status', 'game_type', 'created_at',
                  'delete_invite', 'player1_profile', 'player2_profile']
        extra_kwargs = {
                    'matchId': {'read_only': True},
                    'status': {'read_only': True},
                    'created_at': {'read_only': True},
                    'id': {'read_only': True},
                }
    def get_delete_invite(self, obj):
        match_id = obj.id
        return(f"/api/matchmaking/match/{match_id}/delete/")

    def get_player1_profile(self, obj):
        player1 = obj.player1.username
        return(f"/api/users/{player1}")

    def get_player2_profile(self, obj):
        player2 = obj.player2.username
        return(f"/api/users/{player2}")

GAME_TYPE = [('pong', 'Pong'),
             ('c4', 'Connect Four'),
             ]

class MatchResultSerializer(serializers.Serializer):
    winner = serializers.CharField(required=True)
    looser = serializers.CharField(required=True)
    winner_points = serializers.IntegerField(required=True)
    looser_points = serializers.IntegerField(required=True)
    game_type = serializers.ChoiceField(choices=GAME_TYPE)

class MatchMakingQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = InQueueUser
        fields = ['game_type']

class TournamentSerializer(serializers.ModelSerializer):
    invited_players = serializers.ListField(
            child=serializers.CharField(),
            write_only=True,
            required=False
        )

    class Meta:
        model = Tournament
        fields = ['invited_players', 'game_type']

    def validate_invited_players(self, value):
        request = self.context.get('request')
        print("HERE MATE",request)
        lang = request.headers.get('lang')
        if len(value) != len(set(value)):
            message = translate(lang, "invite_duplicates_error")
            raise serializers.ValidationError(message)

        for user in value:
            q = MatchUser.objects.filter(username=user)
            if not q.exists():
                message = translate(lang, "invalid_username_error", [user])
                raise serializers.ValidationError(message)
        
        return value

    def create(self, validated_data):
        invited_usernames = validated_data.pop('invited_players', [])
        
        tournament = super().create(validated_data)
        
        invited_users = MatchUser.objects.filter(username__in=invited_usernames)
        tournament.invited_players.set(invited_users)
        
        return tournament

class TournamentAddPlayersSerializer(serializers.ModelSerializer):
    invited_players = serializers.ListField(
        child=serializers.CharField(),
        write_only=True
    )

    class Meta:
        model = Tournament
        fields = ['invited_players']

    def validate_invited_players(self, value):
        request = self.context['request']
        owner = request.user
        existing_invites = set(self.instance.invited_players.values_list('username', flat=True))
        confirmed = set(self.instance.confirmed_players.values_list('user__username', flat=True))
        existing_usernames = existing_invites | confirmed
        lang = request.headers.get('lang')

        new_users = []
        for username in value:
            if username == owner.username:
                message = translate(lang, "invite_self_error")
                raise serializers.ValidationError(message)
            try:
                user = MatchUser.objects.get(username=username)
                if username in existing_usernames:
                    message = translate(lang, "user", [username, "already_invited"])
                    raise serializers.ValidationError(message)
                new_users.append(user)
            except MatchUser.DoesNotExist:
                message = translate(lang, "user", [username, "does_not_exist"])
                raise serializers.ValidationError(message)

        return new_users

    def update(self, instance, validated_data):
        new_players = validated_data.get('invited_players', [])
        instance.invited_players.add(*new_players)
        return instance

class TournamentRemovePlayersSerializer(serializers.ModelSerializer):
    invited_players = serializers.ListField(
        child=serializers.CharField(),
        write_only=True
    )

    class Meta:
        model = Tournament
        fields = ['invited_players']

    def validate_invited_players(self, value):
        existing_invites = set(self.instance.invited_players.values_list('username', flat=True))
        confirmed = set(self.instance.confirmed_players.values_list('user__username', flat=True))
        existing_usernames = existing_invites | confirmed
        users_to_remove = []
        request = self.context.get('request')
        lang = request.headers.get('lang')
        for username in value:
            if username not in existing_usernames:
                message = translate(lang, "user",[username, "not_part_of_tournament"])
                raise serializers.ValidationError(message)
            try:
                user = MatchUser.objects.get(username=username)
                users_to_remove.append(user)
            except MatchUser.DoesNotExist:
                message = translate(lang, "user",[username, "does_not_exist"])
                raise serializers.ValidationError(message)

        return users_to_remove

    def update(self, instance, validated_data):
        players_to_remove = validated_data.get('invited_players', [])
        
        for player in players_to_remove:
            try:
                confirmed_player = instance.confirmed_players.get(user=player)
                confirmed_player.delete()
            except TournamentUser.DoesNotExist:
                pass

        instance.invited_players.remove(*players_to_remove)
        return instance

class TournamentConciseSerializer(serializers.ModelSerializer):
    accept_invite = serializers.SerializerMethodField()
    decline_invite = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    delete_tournament = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['game_type', 'status', 'accept_invite', 'decline_invite', 'owner_name', 'delete_tournament']

    def get_accept_invite(self, obj):
        request = self.context.get('request')
        user = request.user
        if user in obj.invited_players.all() and obj.status == 'pending': 
            return(f'/api/matchmaking/tournament/{obj.id}/accept/')
        return None

    def get_decline_invite(self, obj):
        request = self.context.get('request')
        user = request.user
        if user in obj.invited_players.all() and obj.status == 'pending': 
            return(f'/api/matchmaking/tournament/{obj.id}/decline/')
        return None

    def get_delete_tournament(self, obj):
        request = self.context.get('request')
        user = request.user
        if obj.owner == user and obj.status == 'pending': 
            return(f'/api/matchmaking/tournament/delete/')
        return None

    def get_owner_name(self, obj):
        return obj.owner.username

class TournamentDetailSerializer(serializers.ModelSerializer):
    player_type = serializers.SerializerMethodField()
    leave_tournament = serializers.SerializerMethodField()
    delete_tournament = serializers.SerializerMethodField()
    round_number = serializers.SerializerMethodField()
    invited_players_profiles = serializers.SerializerMethodField()
    confirmed_players_profiles = serializers.SerializerMethodField()
    players_order = serializers.SerializerMethodField()
    owner_profile = serializers.SerializerMethodField()
    invite_players = serializers.SerializerMethodField()
    remove_players = serializers.SerializerMethodField()
    launch_tournament = serializers.SerializerMethodField()
    launch_next_round = serializers.SerializerMethodField()
    rounds_schedule = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['game_type', 'status', 'player_type', 'leave_tournament', 'delete_tournament',
                  'round_number', 'invited_players_profiles', 'confirmed_players_profiles',
                  'owner_profile', 'invite_players', 'remove_players',
                  'launch_tournament', 'players_order', 'launch_next_round', 'rounds_schedule']

    def get_player_type(self, obj):
        request = self.context.get('request')
        user = request.user
        if user in obj.invited_players.all(): 
            return('Invited Player')
        elif user in obj.confirmed_players.values_list('user', flat=True): 
            return ('Confirmed Player')
        elif user == obj.owner:
            return('Owner')
        return None

    def get_leave_tournament(self, obj):
        request = self.context.get('request')
        user = request.user
        if user.username in obj.confirmed_players.values_list('user', flat=True) and obj.status == 'pending' and user != obj.owner: 
            return(f'/api/matchmaking/tournament/{obj.id}/leave/')
        return None

    def get_delete_tournament(self, obj):
        request = self.context.get('request')
        user = request.user
        if obj.owner == user and obj.status == 'pending': 
            return(f'/api/matchmaking/tournament/delete/')
        return None

    def get_round_number(self, obj):
        if obj.status == 'in_progress': 
            return obj.current_round
        return None

    def get_round_number(self, obj):
        if obj.status == 'in_progress': 
            return obj.current_round
        return None

    def get_invited_players_profiles(self, obj):
        if obj.status == 'pending':
            links = []
            for user in  obj.invited_players.all():
                profile_url = f'/api/users/{user.username}/'
                links.append({'username': user.username, 'profile':profile_url})
            return links
        return None

    def get_confirmed_players_profiles(self, obj):
        if obj.status == 'pending':
            links = []
            for username in  obj.confirmed_players.values_list('user__username', flat=True):
                profile_url = f'/api/users/{username}/'
                links.append({'username': username, 'profile':profile_url})
            return links
        return None

    def get_owner_profile(self, obj):
        return f'/api/users/{obj.owner.username}/'

    def get_invite_players(self, obj):
        request = self.context.get('request')
        user = request.user
        if obj.owner == user:
            return '/api/matchmaking/tournament/add_players/'
        return None

    def get_remove_players(self, obj):
        request = self.context.get('request')
        user = request.user
        if obj.owner == user:
            return '/api/matchmaking/tournament/remove_players/'
        return None

    def get_launch_tournament(self, obj):
        request = self.context.get('request')
        user = request.user
        if obj.owner == user and obj.confirmed_players.count() > 2:
            return '/api/matchmaking/tournament/launch/'
        return None

    def get_launch_next_round(self, obj):
        if obj.status == 'in_progress' and not Match.objects.filter(tournament=obj).exists():
            return('/api/matchmaking/tournament/next_round/')
        return None

    def get_players_order(self, obj):
        if obj.status == 'in_progress':
            sorted_participants = obj.confirmed_players.order_by('-matches_won')
            return TournamentUserSerializer(sorted_participants, many=True).data
        return None

    def get_rounds_schedule(self, obj):
        if obj.status == 'in_progress':
            return obj.round_schedule
        return None

class TournamentToHistorySerializer(serializers.ModelSerializer):
    final_ranking = serializers.SerializerMethodField()
    class Meta:
        model = Tournament
        fields = ['game_type', 'final_ranking']

    def get_final_ranking(self, obj):
        sorted_participants = obj.confirmed_players.order_by('-matches_won')
        return TournamentUserSerializer(sorted_participants, many=True).data

class TournamentUserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    user_profile = serializers.SerializerMethodField()
    games_played = serializers.SerializerMethodField()
    class Meta:
        model = TournamentUser
        fields = ['username', 'matches_won', 'matches_lost', 'user_profile', 'games_played']

    def get_username(self, obj):
        return obj.user.username

    def get_user_profile(self, obj):
        return(f'/api/users/{obj.user.username}')

    def get_games_played(self, obj):
        return obj.matches_won + obj.matches_lost
