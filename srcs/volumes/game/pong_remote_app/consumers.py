from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from .models import PongRemoteGame
from game_srcs.pong.Pong_remote import PongRemoteEngine
import jwt
from django.conf import settings

log = logging.getLogger(__name__)


class PongRemotePlayerConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.player = "None"
		self.game_ended = False
		await self.accept()		
		log.info("PongRemotePlayerConsumer : Remote player connected")
  
  
	async def disconnect(self, code):
		log.info("PongRemotePlayerConsumer : Remote Player disconnected")
		if self.player != "None" and self.game_ended != True:
			await self.leave_game()
		try:
			await self.channel_layer.group_discard(self.group_name, self.channel_name)
		except:
			log.info("PongRemotePlayerConsumer : Can not discard channel " + str(self.channel_name) + " from group " + str(self.group_name))
   
   
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
			log.info("PongRemotePlayerConsumer : Error sending init_game to PongRemoteEngine")
			await self.close()
		
  
	async def get_config(self):
		try:
			await self.channel_layer.send("pong_remote_engine", {
				"type": "get.config",
				"game_id": self.group_name,
				"sender": self.channel_name,
			})
		except:
			log.info("PongRemotePlayerConsumer : Error sending get_config to PongRemoteEngine")
			await self.close()


	async def start_game(self):
		try:
			await self.channel_layer.send("pong_remote_engine", {
				"type": "start.game",
				"game_id": self.group_name,
				"player": self.player,
				"sender": self.channel_name,
			})
		except:
			log.info("PongRemotePlayerConsumer : Error sending start_game to PongRemoteEngine")
			await self.close()   


	async def move(self, content):
		try:
			direction = content["direction"]
		except KeyError:
			log.error("PongRemotePlayerConsumer : Key error in move()")
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
			log.info("PongRemotePlayerConsumer : Error sending move to PongRemoteEngine")
			await self.close()
		
  
	async def pause(self, content):
		try:
			action = content["action"]
		except KeyError:
			log.error("PongRemotePlayerConsumer : Key error in pause()")
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
			log.info("PongRemotePlayerConsumer : Error sending pause to PongRemoteEngine")
			await self.close()
  
  
	async def surrend(self, content):
		try:
			await self.channel_layer.send("pong_remote_engine", {
				"type" : "surrend",
				"game_id" : self.group_name,
				"surrender": self.player,
				"sender": self.channel_name,
			})
		except:
			log.info("PongRemotePlayerConsumer : Error sending surrend to PongRemoteEngine")
			await self.close()


	async def send_error(self, event):
		data = {"type" : "error"}
		data.update({"error_msg" : event["Error"]})
		try:
			await self.send(dumps(data))
		except:
			log.info("PongRemotePlayerConsumer : Can not send on closed websocket")


	async def send_frame(self, event):
		data = {"type" : "frame"}
		data.update(event["Frame"])
		try:
			await self.send(dumps(data))
		except:
			log.info("PongRemotePlayerConsumer : Can not send on closed websocket")


	async def send_pause(self, event):
		data = {"type" : "pause"}
		data.update({"action" : event["Pause"]})
		try:
			await self.send(dumps(data))
		except:
			log.info("PongRemotePlayerConsumer : Can not send on closed websocket")


	async def send_config(self, event):
		data = {"type" : "config"}
		data.update(event["Config"])
		try:
			await self.send(dumps(data))
		except:
			log.info("PongRemotePlayerConsumer : Can not send on closed websocket")
		
  
	async def send_wait_opponent(self, event):
		data = {"type" : "wait"}
		try:
			await self.send(dumps(data))
		except:
			log.info("PongRemotePlayerConsumer : Can not send on closed websocket")
  
  
	async def send_end_state(self, event):
		data = {"type" : "end_state"}
		data.update(event["End_state"])
		try:
			await self.send(dumps(data))
		except:
			log.info("PongRemotePlayerConsumer : Can not send on closed websocket")
		self.game_ended = True
		await self.close()
  
  
	async def send_pong(self):
		data = {"type" : "pong"}
		try:
			await self.send(dumps(data))
		except:
			log.info("PongRemotePlayerConsumer : Can not send on closed websocket")


	async def receive(self, text_data=None, bytes_data=None):
		content = loads(text_data)
		try:
			type = content["type"]
		except KeyError:
			log.error("PongRemotePlayerConsumer : Key error in receive()")
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
		elif type == "ping":
			await self.send_pong()
		else:
			log.info("PongRemotePlayerConsumer : Wrong type receive " + type)
 
 
	async def leave_game(self):
		try:
			game_instance = await sync_to_async(PongRemoteGame.objects.get)(game_id=self.group_name)
			if self.player == "player_1":
				game_instance.player_1_connected = False
			elif self.player == "player_2":
				game_instance.player_2_connected = False
			await game_instance.asave()
		except Exception:
			log.info("PongRemotePlayerConsumer : Player can not leave " + self.group_name + " for player " + self.username)
		await self.pause({"action" : "stop"})
 
 
	async def auth(self, game_instance : PongRemoteGame) -> bool:
		try :
			clear_token = jwt.decode(self.auth_key,
                            settings.SIMPLE_JWT['VERIFYING_KEY'],
                            settings.SIMPLE_JWT['ALGORITHM'] 
			)
		except jwt.ExpiredSignatureError:
			log.info("ExpiredSignatureError from authenticate user")
			return False
		except jwt.InvalidTokenError:
			log.info("InvalidTokenError from authenticate user")
			return False
		self.username = clear_token.get('username') 
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
			log.info("PongRemotePlayerConsumer : Problem model save or add to group channel for " + self.username + " in game " + self.group_name)
			await self.close()
		log.info("PongRemotePlayerConsumer : Player " + self.username + " connected to game " + str(game_instance.game_id) + " as " + self.player)  
		return True
	
 
	async def join_game(self, content):
		try:
			self.group_name = content["game_id"]
			self.auth_key = content["auth_key"]
		except:
			log.error("PongRemotePlayerConsumer : Key error in join_game()")
			return
		try:
			game = await sync_to_async(PongRemoteGame.objects.get)(game_id=self.group_name)
		except Exception:
			log.info("PongRemotePlayerConsumer : Game instance " + self.group_name + " does not exist")
			await self.close()
			return
		if await self.auth(game) == False:
			log.info("PongRemotePlayerConsumer : Can not auth player to game " + self.group_name)
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
			log.info("PongRemoteGameConsumer : Can not send error to group channel")
		
  
	def init_game(self, event):
		game_id = event["game_id"]		
		if game_id in self.game_instances:
			print("PongRemoteGameConsumer : Game thread for room " + str(game_id) + " is already initialized")
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
			print("PongRemoteGameConsumer : Game thread for room " + str(game_id) + " can not start because not initialized")
  
  
	def pause(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_pause(event["player"], event["action"])
		except Exception:
			print("PongRemoteGameConsumer : Game thread for room " + str(game_id) + " can not pause because not initialized")
		
  
	def get_config(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].send_config(event["sender"])
		except Exception:
			print("PongRemoteGameConsumer : Game thread " + str(game_id) + " can not send config because not initialized")
  
  
	def move(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_movement(event["player"], event["direction"])
		except Exception:
			print("PongRemoteGameConsumer : Game thread " + str(game_id) + " can not move because not initialized")
		
  	
	def surrend(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_surrend(event["surrender"])
		except Exception:
			print("PongRemoteGameConsumer : Game thread " + str(game_id) + " can not surrend because not initialized")
   
   
	def join_thread(self, event):
		game_id = event["game_id"]
		try:
			print("PongRemoteGameConsumer : Joining thread " + game_id)
			self.game_instances[game_id].join()
			self.game_instances.pop(game_id)
			print("PongRemoteGameConsumer : Thread waited !")
		except Exception:
			print("PongRemoteGameConsumer : Error: Can not join thread " + str(game_id))