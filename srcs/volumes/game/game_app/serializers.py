from rest_framework import serializers
from rest_framework.renderers import JSONRenderer
from .models import Game

class GameDetailSerializer(serializers.ModelSerializer):
    # uuid = serializers.UUIDField()
    # uuid = serializers.CharField()
    name = serializers.SerializerMethodField()
    # player1 = serializers.CharField()
    # player2 = serializers.CharField()
    # score1 = serializers.IntegerField()
    # score2 = serializers.IntegerField()
    class Meta:
        model = Game
        fields = [ 'name', ]
        
    # def getPlayer1Name(self, obj):
    #     return obj.player1
    
    # def getPlayer1Name(self, obj):
    #     return obj.player2
    
    # def getScore1(self, obj):
    #     return obj.score1
    
    # def getScore2(self, obj):
    #     return obj.score2
    
class GameListSerializer(serializers.ModelSerializer):
    # uuid = serializers.CharField()
    name = serializers.SerializerMethodField()
    class Meta:
        model = Game
        fields = ['name',]
    
    