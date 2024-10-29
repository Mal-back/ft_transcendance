from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from .models import PongRemoteGame
from game_srcs.pong.Pong_remote import PongRemoteEngine
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
class PongRemotePlayerConsumer(AsyncWebsocketConsumer):
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
			await self.channel_layer.send("pong_remote_engine", {
				"type": "init.game",
				"game_id": self.group_name,
				"player_1_username": self.player_1_username,
				"player_2_username": self.player_2_username,
				"sender" : self.channel_name
			})
		except:
			log.info("Error sending init_game to LocalEngine")
			self.close()
		
	async def get_config(self):
		try:
			await self.channel_layer.send("pong_remote_engine", {
				"type": "get.config",
				"game_id": self.group_name,
				"sender": self.channel_name,
			})
		except:
			log.info("Error sending get_config to LocalEngine")
			self.close()

	async def start_game(self):
		try:
			await self.channel_layer.send("pong_remote_engine", {
				"type": "start.game",
				"game_id": self.group_name,
				"player": self.player,
				"sender": self.channel_name,
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
			await self.channel_layer.send("pong_remote_engine", {
				"type" : "move",
				"game_id": self.group_name,
				"player" : self.player,
				"direction": direction,
				"sender": self.channel_name,
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
			await self.channel_layer.send("pong_remote_engine", {
				"type" : "pause",
				"game_id" : self.group_name,
				"player" : self.player,
				"action" : action,
				"sender" : self.channel_name,
			})
		except:
			log.info("Error sending pause to LocalEngine")
			self.close()
  
	async def surrend(self, content):
		try:
			await self.channel_layer.send("pong_remote_engine", {
				"type" : "surrend",
				"game_id" : self.group_name,
				"surrender": self.player,
				"sender": self.channel_name,
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
			log.error("Key error in PongRemotePlayerConsumer.receive()")
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
			game_instance = await sync_to_async(PongRemoteGame.objects.get)(game_id=self.group_name)
			if self.player == "player_1":
				game_instance.player_1_connected = False
			elif self.player == "player_2":
				game_instance.player_2_connected = False
			await game_instance.asave()
			self.channel_layer.group_discard(self.group_name, self.channel_name)
		except Exception:
			log.info("Problem leaving game " + self.group_name + " for player " + self.username)
		await self.pause({"action" : "stop"})
 
	async def auth(self, game_instance : PongRemoteGame) -> bool:
		# Uncomment bellow to activate user authentication
		# try :
		# 	clear_token = jwt.decode(self.auth_key,
        #                     settings.SIMPLE_JWT['VERIFYING_KEY'],
        #                     settings.SIMPLE_JWT['ALGORITHM'] 
		# 	)
		# except jwt.ExpiredSignatureError:
		# 	log.info("ExpiredSignatureError from authenticate user")
		# 	return False
		# except jwt.InvalidTokenError:
		# 	log.info("InvalidTokenError from authenticate user")
		# 	return False
		# self.username = clear_token.get('username')
  
		self.username = self.auth_key
  
		if self.username == game_instance.player_1_name and game_instance.player_1_connected == False: #Need to auth there
			self.player = "player_1"
			game_instance.player_1_connected = True
		elif self.username == game_instance.player_2_name and game_instance.player_2_connected == False: #Need to auth there
			self.player = "player_2"
			game_instance.player_2_connected = True
		else:
			return False
		self.player_1_username = game_instance.player_1_name
		self.player_2_username = game_instance.player_2_name
		try:
			await game_instance.asave(force_update=True)
			await self.channel_layer.group_add(self.group_name, self.channel_name)
		except Exception:
			log.info("Problem in auth() PongRemotePlayerConsumer " + self.username + " for game " + self.group_name)
			await self.close()
		log.info("Player " + self.username + " connected to game " + str(game_instance.game_id) + " as " + self.player)  
		return True
	
	async def join_game(self, content):
		try:
			self.group_name = content["game_id"]
			self.auth_key = content["auth_key"]
		except:
			log.error("Key error in PongRemotePlayerConsumer.join_game()")
			return
		try:
			game = await sync_to_async(PongRemoteGame.objects.get)(game_id=self.group_name)
		except Exception:
			log.info("Game instance " + self.group_name + " does not exist")
			await self.close()
			return
		if await self.auth(game) == False:
			log.info("Can not auth player " + self.username + " to game " + self.group_name)
			await self.close()

class PongRemoteGameConsumer(SyncConsumer):
	def __init__(self, *args, **kwargs):
		print("PongRemoteGameConsumer created")
		self.game_instances = {}
	
	def error(self, error_msg, game_id, close):
		try:
			async_to_sync(self.channel_layer.group_send)(game_id,
				{"type": "send.error", "Error" : error_msg,  "close" : close})
		except Exception:
			log.info("Can not send error to group channel")
		
	def init_game(self, event):
		game_id = event["game_id"]		
		if game_id in self.game_instances:
			print("Game thread for room " + str(game_id) + " is already initialized")
			return
		try:
			self.game_instances[game_id] = PongRemoteEngine(game_id=game_id, player_1_username=event["player_1_username"], player_2_username=event["player_2_username"])
			self.game_instances[game_id].start()
		except Exception:
			self.error("can not init the game", "true")

	def start_game(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].start_game(event["player"])
		except Exception:
			print("Game thread for room " + str(game_id) + " can not start because not initialized")
  
	def pause(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_pause(event["player"], event["action"])
		except Exception:
			print("Game thread for room " + str(game_id) + " can not pause because not initialized")
		
	def get_config(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].send_config(event["sender"])
		except Exception:
			print("Game thread " + str(game_id) + " can not send config because not initialized")
  
	def move(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_movement(event["player"], event["direction"])
		except Exception:
			print("Game thread " + str(game_id) + " can not move because not initialized")
			
	def surrend(self, event):
		print("Surrend function in PongLocalGameConsumer")
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_surrend(event["surrender"])
		except Exception:
			print("Game thread " + str(game_id) + " can not surrend because not initialized")

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
   
	def clean_game(self, event):
		game_id = event["game_id"]
		try:
			game_instance = PongRemoteGame.objects.get(game_id=game_id)
			game_instance.delete()
			print("Cleaning game " + str(game_id))
		except:
			print("Can not delete game " + str(game_id))

	def send_result(self, event):
		url = f'http://matchmaking:8443/api/matchmaking/match/' + event["game_id"] + '/finished/'
		print("Sending result to url : " + url)
		print("End state = " + str(event["End_state"]))
		try: 
			sender = MicroServiceClient()
			sender.send_requests(
				urls=[url,],
				method='post',
				expected_status=[200],
				body=event["End_state"],
			)
		except RequestsFailed:
	   	 print("Error sending result to matchmaking application for game " + event["game_id"])