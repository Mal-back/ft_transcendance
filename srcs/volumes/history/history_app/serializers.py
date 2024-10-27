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
