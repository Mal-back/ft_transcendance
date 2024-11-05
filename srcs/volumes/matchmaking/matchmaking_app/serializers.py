from django.core.serializers.base import SerializationError
from django.forms import ValidationError
from django.utils import choices
from rest_framework import serializers
from .models import MatchUser, Match, InQueueUser, Tournament

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


class AcceptedMatchSerializer(serializers.ModelSerializer):
    player1_profile = serializers.SerializerMethodField()
    player2_profile = serializers.SerializerMethodField()
    is_tournament_match = serializers.SerializerMethodField()
    class Meta :
        model = Match
        fields = ['player1', 'player2', 'matchId', 'player1_profile', 'player2_profile', 'is_tournament_match']

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
             ('connect_four', 'Connect Four'),
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

class TournamentSerializer(serializers.ModelField):
    class Meta:
        model = Tournament
        fields = ['invited_players', 'game_type']

    def validate_invited_players(self, value):
        if len(value) != len(set(value)):
            raise SerializationError('Duplicates are not allowed')
        return value

class TournamentAddPlayersSerializer(serializers.ModelField):
    class Meta:
        model = Tournament
        fields = ['invited_players', 'game_type']

    def validate_invited_players(self, value):
        request = self.context['request']
        owner = request.user
        existing = set(self.instance.invited_players.values_list('username', flat=True))
        new = set([user.username for user in value])

        cross = existing.intersection(new)
        if cross:
            raise SerializationError(f'Users {list(cross)} are already invited')
        if owner in value:
            raise SerializationError(f'You can\'t invite yourself')


    def validate(self, instance, validated_data):
        new_players = validated_data.get('invited_players', None)

        if new_players:
            instance.invited_players.add(*new_players)
