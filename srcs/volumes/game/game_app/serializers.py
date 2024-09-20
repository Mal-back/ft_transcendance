from rest_framework import serializers
from rest_framework.renderers import JSONRenderer
from .models import Game

class GameDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [ 'id', 'player1_username', 'player2_username', 'player1_score', 'player2_score', ]
    
class GameListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [ 'id', 'player1_username', 'player2_username', 'player1_score', 'player2_score', ]
    
    