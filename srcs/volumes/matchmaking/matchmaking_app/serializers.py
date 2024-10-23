from rest_framework import serializers
from .models import MatchUser, Match

class MatchUserSerializer(serializers.ModelSerializer):
    class Meta :
        model = MatchUser
        fields = ['username']

class MatchSerializer(serializers.ModelSerializer):
    class Meta :
        model = Match
        fields = ['id', 'player1', 'player2', 'status', 'created_at']





        POST 
        palyer1 : fvdgfd
        
