from django.forms import ValidationError
from django.utils import choices
from rest_framework import serializers
from .models import MatchUser, Match

class MatchUserSerializer(serializers.ModelSerializer):
    class Meta :
        model = MatchUser
        fields = ['username']

class MatchSerializer(serializers.ModelSerializer):
    class Meta :
        model = Match
        fields = ['id', 'player1', 'player2', 'matchId', 'status', 'game_type', 'created_at']
        extra_kwargs = {
                    'matchId': {'read_only': True},
                    'status': {'read_only': True},
                    'created_at': {'read_only': True},
                    'id': {'read_only': True},
                }
        def validate_player2(self, value):
            if not MatchUser.objects.filter(username=value).exists():
                raise ValidationError('Invited Player does not exists')
            return value

class MatchSerializer(serializers.ModelSerializer):
    class Meta :
        model = Match
        fields = ['id', 'player1', 'player2', 'matchId', 'status', 'game_type', 'created_at']
        extra_kwargs = {
                    'matchId': {'read_only': True},
                    'status': {'read_only': True},
                    'created_at': {'read_only': True},
                    'id': {'read_only': True},
                }

class PendingInviteSerializer(serializers.ModelSerializer):
    accept_invite = serializers.SerializerMethodField
    decline_invite = serializers.SerializerMethodField
    class Meta :
        model = Match
        fields = ['id', 'player1', 'player2', 'matchId', 'status', 'game_type', 'created_at',
                  'accept_invite', 'decline_invite']
        extra_kwargs = {
                    'matchId': {'read_only': True},
                    'status': {'read_only': True},
                    'created_at': {'read_only': True},
                    'id': {'read_only': True},
                }
        def get_accept_invite(self, obj):
            match_id = obj.id
            return(f"http://localhost:8080/api/matchmaking/match/{match_id}/accept/")
        
        def get_decline_invite(self, obj):
            match_id = obj.id
            return(f"http://localhost:8080/api/matchmaking/match/{match_id}/decline/")

class SentInviteSerializer(serializers.ModelSerializer):
    delete_invite = serializers.SerializerMethodField
    class Meta :
        model = Match
        fields = ['id', 'player1', 'player2', 'matchId', 'status', 'game_type', 'created_at',
                  'accept_invite', 'decline_invite']
        extra_kwargs = {
                    'matchId': {'read_only': True},
                    'status': {'read_only': True},
                    'created_at': {'read_only': True},
                    'id': {'read_only': True},
                }
        def get_delete_invite(self, obj):
            match_id = obj.id
            return(f"http://localhost:8080/api/matchmaking/match/{match_id}/delete/")

GAME_TYPE = [('pong', 'Pong'),
             ('connect_four', 'Connect Four'),
             ]

class MatchResultSerializer(serializers.Serializer):
    winner = serializers.CharField(required=True)
    looser = serializers.CharField(required=True)
    winner_points = serializers.IntegerField(required=True)
    looser_points = serializers.IntegerField(required=True)
    game_type = serializers.ChoiceField(choices=GAME_TYPE)
