from rest_framework import serializers
from .models import RemoteGame

class RemoteGameSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RemoteGame
        fields = ['game_id',
                  'player_1_name',
                  'player_2_name',
                  'player_1_connected',
                  'player_2_connected',]
        
        
    
        
