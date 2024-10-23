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
