from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from .models import RemoteGame
from game_srcs.Pong_remote import PongRemoteEngine

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
		log.info("channel_name = " + self.channel_name)
  
	async def disconnect(self, code):
		log.info("Remote Player Consumer disconnected")
		if self.player != "None":
			await self.leave_game()
   
	async def init_game(self):
		try:
			await self.channel_layer.send("remote_engine", {
				"type": "init.game",
				"game_id": self.group_name,
			})
		except:
			log.info("Error sending init_game to LocalEngine")
			self.close()
		
	async def get_config(self):
		try:
			await self.channel_layer.send("remote_engine", {
				"type": "get.config",
				"game_id": self.group_name,
				"channel_name": self.channel_name,
			})
		except:
			log.info("Error sending get_config to LocalEngine")
			self.close()

	async def start_game(self):
		try:
			await self.channel_layer.send("remote_engine", {
				"type": "start.game",
				"game_id": self.group_name,
				"player": self.player,
			})
		except:
			log.info("Error sending start_game to LocalEngine")
			self.close()   

	async def move(self, content):
		try:
			direction = content["direction"]
		except KeyError:
			log.error("Key error in LocalPlayerConsumer.move()")
			return
		try:
			await self.channel_layer.send("remote_engine", {
				"type" : "move",
				"game_id": self.group_name,
				"player" : self.player,
				"direction": direction
			})
		except:
			log.info("Error sending move to LocalEngine")
			self.close()
		
	async def pause(self, content):
		try:
			action = content["action"]
		except KeyError:
			log.error("Key error in LocalPlayerConsumer.pause()")
			return
		try:
			await self.channel_layer.send("remote_engine", {
				"type" : "pause",
				"game_id" : self.group_name,
				"player" : self.player,
				"action" : action,
			})
		except:
			log.info("Error sending pause to LocalEngine")
			self.close()
  
	async def surrend(self, content):
		try:
			await self.channel_layer.send("remote_engine", {
				"type" : "surrend",
				"game_id" : self.group_name,
				"surrender": self.player,
			})
		except:
			log.info("Error sending surrend to LocalEngine")
			self.close()

	async def send_error(self, event):
		data = {"type" : "error"}
		data.update({"error_msg" : event["Error"]})
		try:
			await self.send(dumps(data))
		except:
			log.info("Can not send on closed websocket")

	async def send_frame(self, event):
		data = {"type" : "frame"}
		data.update(event["Frame"])
		try:
			await self.send(dumps(data))
		except:
			log.info("Can not send on closed websocket")

	async def send_pause(self, event):
		data = {"type" : "pause"}
		data.update({"action" : event["Pause"]})
		try:
			await self.send(dumps(data))
		except:
			log.info("Can not send on closed websocket")

	async def send_config(self, event):
		data = {"type" : "config"}
		data.update(event["Config"])
		try:
			await self.send(dumps(data))
		except:
			log.info("Can not send on closed websocket")
		
	async def send_end_state(self, event):
		data = {"type" : "end_state"}
		data.update(event["End_state"])
		try:
			await self.send(dumps(data))
		except:
			log.info("Can not send on closed websocket")
		self.game_ended = True
		await self.close()
  
	async def end_game(self, event):
		log.info("End game function called in WebsocketConsumer " + self.group_name)
		self.delete = True
		await self.close()

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
		elif type == "init_game":
			await self.init_game()
		elif type == "get_config":
			await self.get_config()
		elif type == "start_game":
			await self.start_game()
		elif type == "move":
			await self.move(content)
		elif type == "pause":
			await self.pause(content)
		elif type == "surrend":
			await self.surrend(content)
		else:
			log.info("Wrong type receive in LocalPlayerConsumer : " + type)
 
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
		log.info("Player " + self.username + " connected to game " + str(game_instance.game_id) + " as " + self.player)  
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
	
	def error(self, error_msg, game_id):
		try:
			async_to_sync(self.channel_layer.group_send)(game_id,
				{"type": "send.error", "Error" : error_msg})
		except Exception:
			log.info("Can not send error to group channel")
		
	def init_game(self, event):
		game_id = event["game_id"]		
		if game_id in self.game_instances:
			print("Game thread for room " + str(game_id) + " is already initialized")
			self.error("init_game : game already initialized", game_id)
			return
		self.game_instances[game_id] = PongRemoteEngine(game_id=game_id)
		self.game_instances[game_id].start()

	def start_game(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].start_game(event["player"])
		except Exception:
			print("Game thread for room " + str(game_id) + " can not start because not initialized")
			self.error("start_game : game not initialized", game_id)
  
	def pause(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_pause(event["player"], event["action"])
		except Exception:
			print("Game thread for room " + str(game_id) + " can not pause because not initialized")
			self.error("pause: game not initialized", game_id)
		
	def get_config(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].send_config(event["channel_name"])
		except Exception:
			print("Game thread " + str(game_id) + " can not send config because not initialized")
			self.error("get_config: game not initialized", game_id)
  
	def move(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_movement(event["player"], event["direction"])
		except Exception:
			print("Game thread " + str(game_id) + " can not move because not initialized")
			self.error("move: game not initialized", game_id)
			
	def surrend(self, event):
		print("Surrend function in LocalGameConsumer")
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_surrend(event["surrender"])
		except Exception:
			print("Game thread " + str(game_id) + " can not surrend because not initialized")
			self.error("surrend: game not initialized", game_id) 

	def end_thread(self, event):
		game_id = event["game_id"]
		try :
			print("Ending thread " + game_id)
			self.game_instances[game_id].end_thread()
		except Exception:
			print("Error: Can not end thread " + str(game_id))
   
	def join_thread(self, event):
		game_id = event["game_id"]
		try:
			print("Joining thread " + game_id)
			self.game_instances[game_id].join()
			self.game_instances.pop(game_id)
			print("Thread waited !")
		except Exception:
			print("Error: Can not join thread " + str(game_id))