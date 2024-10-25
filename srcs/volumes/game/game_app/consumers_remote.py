from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from game_app.models import RemoteGame
import uuid

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
class RemotePlayerConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		path = self.scope["path"]
		self.scope
		log.info("Remote Player Consumer created")

  
	async def disconnect(self, code):
		log.info("Remote Player Consumer disconnected")
  
	async def receive(self, text_data=None, bytes_data=None):
		content = loads(text_data)


class RemoteGameConsumer(SyncConsumer):
    def __init__(self, *args, **kwargs):
        print("RemoteGameConsumer created")
        self.game_instances = {}
        
    def test(self, event):
        print("msg receives in Remote Engine")
        
    

