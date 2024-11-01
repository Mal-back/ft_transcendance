from rest_framework import serializers
from .models import PongRemoteGame

class PongRemoteGameSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PongRemoteGame
        fields = ['player_1_name',
                'player_2_name',]