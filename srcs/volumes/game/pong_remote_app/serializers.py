from rest_framework import serializers
from .models import RemoteGame

class RemoteGameSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RemoteGame
        fields = ['player_1_name',
                  'player_2_name',]