from django.forms import ValidationError
from django.utils import choices
from rest_framework import serializers
from .models import MatchUser, Match, Tournament, TournamentUser

class MatchUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchUser
        fields = ['username']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['winner', 'looser', 'winner_points', 'looser_points', 'game_type',]

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

class TournamentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentUser
        fields = ['username', 'matches_won', 'matches_lost', 'user_profile', 'games_played']

class TournamentSerializer(serializers.ModelSerializer):
    final_ranking = TournamentUserSerializer(many=True)
    class Meta:
        model = Tournament
        fields = ['game_type', 'final_ranking']

    def create(self, validated_data):
        final_ranking = validated_data.pop('final_ranking')
        tournament = Tournament.objects.create(**validated_data)
        for user in final_ranking:
            TournamentUser.objects.create(tournament=tournament, **user)
        return tournament
