from rest_framework import serializers
from .models import PublicUser

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicUser
        fields = ['__all__', 'overall_wins', 'tournament_win_rate', 'single_games_win_rate']
