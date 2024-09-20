from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework import status
from .serializers import GameDetailSerializer, GameListSerializer
from .models import Game
from .game_srcs.Const import Const
from rest_framework.renderers import JSONRenderer
from django.http import JsonResponse



class GameCreate(generics.CreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameDetailSerializer
    
def SendConstJson(request):
    data = [{'max_x': Const.MAX_X.value},
            {'min_x': Const.MIN_X.value},
            {'max_y': Const.MIN_Y.value},
            {'min_y': Const.MAX_Y.value},
            {'pad_width': Const.PAD_WIDTH.value},
            {'pad_height': Const.PAD_HEIGHT.value},
            {'pad_distance': Const.PAD_DISTANCE.value},]
    return JsonResponse(data, safe=False)

class GameList(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameListSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        allowed_order_fields = [ 'id', 'player1_username', 'player2_username', 'player1_score', 'player2_score', ]
        order_by = self.request.query_params.get('order_by')
        if order_by in allowed_order_fields:
            return Game.objects.all().order_by(order_by)
        return queryset
		
class GameRetrieveDetail(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameDetailSerializer
    lookup_field = 'id'