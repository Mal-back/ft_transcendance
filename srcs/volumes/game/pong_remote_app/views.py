from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import PongRemoteGameSerializer
import logging
from game.permissions import MatchmakingAuthenticated

log = logging.getLogger(__name__)

class PongRemoteGameCreate(APIView):
    # Uncomment bellow to activate matchmaking application authentication
    # permission_classes = [MatchmakingAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = PongRemoteGameSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            log.info("Created model PongRemoteGame with id " + str(serializer.instance.game_id))
            return Response(serializer.instance.game_id, status=201)
        log.info("Model not created")
        return Response(serializer.errors, status=400)