from django.core.serializers.base import SerializationError
from django.forms import ValidationError
from django.utils import choices
from rest_framework import serializers
from .models import MatchUser, Match, InQueueUser, Tournament, TournamentUser

class MatchUserSerializer(serializers.ModelSerializer):
    class Meta :
        model = MatchUser
        fields = ['username']

class MatchSerializer(serializers.ModelSerializer):
    class Meta :
        model = Match
        fields = ['player2', 'game_type',]
        def validate_player2(self, value):            
            if not MatchUser.objects.filter(username=value).exists():
                raise ValidationError('Invited Player does not exists')
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
            write_only=True
        )

    class Meta:
        model = Tournament
        fields = ['invited_players', 'game_type']

    def validate_invited_players(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError('Duplicates are not allowed')

        for user in value:
            q = MatchUser.objects.filter(username=user)
            if not q.exists():
                raise serializers.ValidationError(f"Invalid username: {user}")
        
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
        confirmed = set(self.instance.confirmed_players.values_list('user__username'), flat=True)
        existing_usernames = existing_invites | confirmed

        new_users = []
        for username in value:
            if username == owner.username:
                raise serializers.ValidationError("You can't invite yourself.")
            try:
                user = MatchUser.objects.get(username=username)
                if username in existing_usernames:
                    raise serializers.ValidationError(f'User {username} is already invited')
                new_users.append(user)
            except MatchUser.DoesNotExist:
                raise serializers.ValidationError(f'User {username} does not exist')

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

        for username in value:
            if username not in existing_usernames:
                raise serializers.ValidationError(f'User {username} is not part of the tournament.')
            try:
                user = MatchUser.objects.get(username=username)
                users_to_remove.append(user)
            except MatchUser.DoesNotExist:
                raise serializers.ValidationError(f'User {username} does not exist')

        return users_to_remove

    def update(self, instance, validated_data):
        players_to_remove = validated_data.get('invited_players', [])
        
        for player in players_to_remove:
            try:
                confirmed_player = instance.confirmed_players.get(user=player)
                instance.confirmed_players.remove(confirmed_player)
                confirmed_player.delete()
            except TournamentUser.DoesNotExist:
                pass

        instance.invited_players.remove(*players_to_remove)
        return instance

class TournamentInviteSerializer(serializers.ModelSerializer):
    accept_invite = serializers.SerializerMethodField()
    decline_invite = serializers.SerializerMethodField()
    leave_tournament = serializers.SerializerMethodField()
    delete_tournament = serializers.SerializerMethodField()
    round_number = serializers.SerializerMethodField()
    invited_players_profiles = serializers.SerializerMethodField()
    confirmed_players_profiles = serializers.SerializerMethodField()
    owner_profile = serializers.SerializerMethodField()
    invite_players = serializers.SerializerMethodField()
    remove_players = serializers.SerializerMethodField()
    launch_tournament = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['game_type', 'confirmed_players', 'status', 'accept_invite', 'decline_invite',
                  'leave_tournament', 'delete_tournament', 'round_number', 'invited_players_profiles',
                  'confirmed_players_profiles', 'owner_profile', 'invite_players', 'remove_players',
                  'launch_tournament',]

        def get_accept_invite(self, obj):
            request = self.context.get('request')
            user = request.user
            if user in obj.invited_players: 
                return(f'api/matchmaking/tournament/{obj.id}/accept/')
            return None

        def get_decline_invite(self, obj):
            request = self.context.get('request')
            user = request.user
            if user in obj.invited_players: 
                return(f'api/matchmaking/tournament/{obj.id}/decline/')
            return None

        def get_leave_tournament(self, obj):
            request = self.context.get('request')
            user = request.user
            if user in obj.confirmed_players.values_list('user', flat=True): 
                return(f'api/matchmaking/tournament/{obj.id}/leave/')
            return None
