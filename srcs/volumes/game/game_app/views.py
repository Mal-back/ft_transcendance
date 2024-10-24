from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RemoteGameSerializer
import logging

log = logging.getLogger(__name__)

class RemoteGameCreate(APIView):
	def post(self, request):
		serializer = RemoteGameSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			log.info("Model created")
			return Response(serializer.data, status=201)
		log.info("Model not created")
		return Response(serializer.errors, status=400)