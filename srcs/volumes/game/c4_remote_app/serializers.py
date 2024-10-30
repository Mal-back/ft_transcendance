from rest_framework import serializers
from .models import C4RemoteGame

class C4RemoteGameSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = C4RemoteGame
        fields = ['player_1_name',
                 'player_2_name',]