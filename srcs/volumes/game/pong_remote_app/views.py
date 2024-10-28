from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import RemoteGameSerializer
import logging
import uuid

log = logging.getLogger(__name__)

class RemoteGameCreate(APIView):
	def post(self, request, *args, **kwargs):
		serializer = RemoteGameSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			log.info("Model created")
			log.info("Created model RemoteGame with id " + str(serializer.instance.game_id))
			return Response(serializer.instance.game_id, status=201)
		log.info("Model not created")
		return Response(serializer.errors, status=400)