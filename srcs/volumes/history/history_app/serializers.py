from django.forms import ValidationError
from django.utils import choices
from rest_framework import serializers
from .models import MatchUser, Match

class MatchUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchUser
        fields = ['username']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['winner', 'looser', 'winner_points', 'looser_points', 'game_type', 'played_at']

class MatchGetSerializer(serializers.ModelSerializer):
    winner_profile = serializers.SerializerMethodField()
    looser_profile = serializers.SerializerMethodField()
    class Meta:
        model = Match
        fields = ['winner', 'winner_profile', 'looser', 'looser_profile', 'winner_points', 'looser_points', 'game_type', 'played_at']

    def get_winner_profile(self, obj):
        winner = obj.winner.username
        return(f"/api/users/{winner}")

    def get_looser_profile(self, obj):
        looser = obj.looser.username
        return(f"/api/users/{looser}")
