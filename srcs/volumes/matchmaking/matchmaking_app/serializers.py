from rest_framework import serializers
from .models import MatchUser

class MatchUserSerializer(serializers.ModelSerializer):
    class Meta :
        model = MatchUser
        fields = ['username']
