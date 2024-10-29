from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from .models import PongRemoteGame
from game_srcs.c4.C4_remote import C4RemoteEngine
from ms_client.ms_client import MicroServiceClient, RequestsFailed

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken
import jwt
from django.conf import settings

log = logging.getLogger(__name__)

######### WARNING #####
# CODE COPIE COLLE POUR DEBUG UTILISATION
from functools import wraps
from inspect import iscoroutinefunction
from logging import getLogger

from channels.exceptions import AcceptConnection, DenyConnection, StopConsumer, ChannelFull

logger = getLogger()

def apply_wrappers(consumer_class):
	for method_name, method in list(consumer_class.__dict__.items()):
		if iscoroutinefunction(method):  # an async method
			# wrap the method with a decorator that propagate exceptions
			setattr(consumer_class, method_name, propagate_exceptions(method))
	return consumer_class


def propagate_exceptions(func):
	async def wrapper(*args, **kwargs):  # we're wrapping an async function
		try:
			return await func(*args, **kwargs)
		except (AcceptConnection, DenyConnection, StopConsumer, ChannelFull):  # these are handled by channels
			raise
		except Exception as exception:  # any other exception
			# avoid logging the same exception multiple times
			if not getattr(exception, "caught", False):
				setattr(exception, "caught", True)
				logger.error(
					"Exception occurred in {}:".format(func.__qualname__),
					exc_info=exception,
				)
			raise  # propagate the exception
	return wraps(func)(wrapper)
####### WARNING #####

@apply_wrappers
class C4RemotePlayerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        return
    
    async def disconnect(self):
        return
    
    async def receive(self, text_data=None, bytes_data=None):
        return
    
class C4RemoteGameConsumer(SyncConsumer):
	def __init__(self, *args, **kwargs):
		print("C4RemoteGameConsumer created")
		self.game_instances = {}    
    


