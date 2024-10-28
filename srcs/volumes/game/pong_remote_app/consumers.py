from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from .models import RemoteGame

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
		self.player = "None"
		await self.accept()		
		log.info("Remote Player Consumer created")	
  
	async def disconnect(self, code):
		log.info("Remote Player Consumer disconnected")
		if self.player != "None":
			await self.leave_game()

	async def receive(self, text_data=None, bytes_data=None):
		content = loads(text_data)
		try:
			type = content["type"]
		except KeyError:
			log.error("Key error in RemotePlayerConsumer.receive()")
			return
		if type == "join_game":
			await self.join_game(content)
		elif self.player == "None":
			await self.close()
 
	async def leave_game(self):
		try:
			game_instance = await sync_to_async(RemoteGame.objects.get)(game_id=self.group_name)
			if self.player == "player_1":
				game_instance.player_1_connected = False
			elif self.player == "player_2":
				game_instance.player_2_connected = False
			await game_instance.asave()
			self.channel_layer.group_discard(self.group_name, self.channel_name)
		except Exception:
			log.info("Problem leaving game " + self.group_name + " for player " + self.username)
 
	async def auth(self, game_instance : RemoteGame) -> bool:
		if self.username == game_instance.player_1_name and game_instance.player_1_connected == False: #Need to auth there
			self.player = "player_1"
			game_instance.player_1_connected = True
		elif self.username == game_instance.player_2_name and game_instance.player_2_connected == False: #Need to auth there
			self.player = "player_2"
			game_instance.player_2_connected = True
		else:
			return False
		try:
			await game_instance.asave(force_update=True)
			await self.channel_layer.group_add(self.group_name, self.channel_name)
		except Exception:
			log.info("Problem in auth() RemotePlayerConsumer " + self.username + " for game " + self.group_name)
			await self.close()
		log.info("Player " + self.username + " connected to game " + game_instance.game_id + " as " + self.player)  
		return True
	
	async def join_game(self, content):
		try:
			self.group_name = content["game_id"]
			self.username = content["username"]
			self.auth_key = content["auth_key"]
		except:
			log.error("Key error in RemotePlayerConsumer.join_game()")
			return
		try:
			game = await sync_to_async(RemoteGame.objects.get)(game_id=self.group_name)
		except Exception:
			log.info("Game instance " + self.group_name + " does not exist")
			await self.close()
			return
		if await self.auth(game) == False:
			log.info("Can not auth player " + self.username + " to game " + self.group_name)
			await self.close()


class RemoteGameConsumer(SyncConsumer):
	def __init__(self, *args, **kwargs):
		print("RemoteGameConsumer created")
		self.game_instances = {}
		
	def test(self, event):
		print("msg receives in Remote Engine")
		
	

