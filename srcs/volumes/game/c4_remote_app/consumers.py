from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from .models import C4RemoteGame
from game_srcs.c4.C4_remote import C4RemoteEngine
import jwt
from django.conf import settings

log = logging.getLogger(__name__)

class C4RemotePlayerConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.player = "None"
		await self.accept()		
		self.game_ended = False
  
  
	async def disconnect(self, code):
		log.info("C4RemotePlayerConsumer : Remote player disconnected")
		if self.player != "None" and self.game_ended == False:
			await self.leave_game()
		try:
			await self.channel_layer.group_discard(self.group_name, self.channel_name)
		except:
			log.info("C4ReotePlayerConsumer : Can not discard channel " + str(self.channel_name) + " from group " + str(self.group_name))
   
   
	async def init_game(self):
		try:
			await self.channel_layer.send("c4_remote_engine", {
				"type": "init.game",
				"game_id": self.group_name,
				"player_1_username": self.player_1_username,
				"player_2_username": self.player_2_username,
				"sender" : self.channel_name
			})
		except:
			log.info("C4RemotePlayerConsumer : Error sending init_game to C4RemoteEngine")
			await self.close()
		
  
	async def get_config(self):
		try:
			await self.channel_layer.send("c4_remote_engine", {
				"type": "get.config",
				"game_id": self.group_name,
				"sender": self.channel_name,
			})
		except:
			log.info("C4RemotePlayerConsumer : Error sending get_config to C4RemoteEngine")
			await self.close()


	async def start_game(self):
		try:
			await self.channel_layer.send("c4_remote_engine", {
				"type": "start.game",
				"game_id": self.group_name,
				"player": self.player,
				"sender": self.channel_name,
			})
		except:
			log.info("C4RemotePlayerConsumer : Error sending start_game to C4RemoteEngine")
			await self.close()   


	async def put(self, content):
		try:
			column = content["column"]
		except KeyError:
			log.error("C4RemotePlayerConsumer : Key error put()")
			return
		try:
			await self.channel_layer.send("c4_remote_engine", {
				"type" : "put",
				"game_id": self.group_name,
				"player" : self.player,
				"column": column,
				"sender": self.channel_name,
			})
		except:
			log.info("C4RemotePlayerConsumer : Error sending put to C4RemoteEngine")
			await self.close()


	async def surrend(self, content):
		try:
			await self.channel_layer.send("c4_remote_engine", {
				"type" : "surrend",
				"game_id" : self.group_name,
				"surrender": self.player,
				"sender": self.channel_name,
			})
		except:
			log.info("C4RemotePlayerConsumer : Error sending surrend to C4RemoteEngine")
			await self.close()


	async def send_error(self, event):
		data = {"type" : "error"}
		data.update({"error_msg" : event["Error"]})
		try:
			await self.send(dumps(data))
		except:
			log.info("C4RemotePlayerConsumer : Can not send on closed websocket")
   
   
	async def send_frame(self, event):
		data = {"type" : "frame"}
		data.update(event["Frame"])
		try:
			await self.send(dumps(data))
		except:
			log.info("C4RemotePlayerConsumer : Can not send on closed websocket")


	async def send_config(self, event):
		data = {"type" : "config"}
		data.update(event["Config"])
		try:
			await self.send(dumps(data))
		except:
			log.info("C4RemotePlayerConsumer : Can not send on closed websocket")
		
  
	async def send_wait_opponent(self, event):
		data = {"type" : "wait"}
		try:
			await self.send(dumps(data))
		except:
			log.info("C4RemotePlayerConsumer : Can not send on closed websocket")
  
  
	async def send_end_state(self, event):
		data = {"type" : "end_state"}
		data.update(event["End_state"])
		try:
			await self.send(dumps(data))
		except:
			log.info("C4RemotePlayerConsumer : Can not send on closed websocket")
		self.game_ended = True
		await self.close()
  
  
	async def send_pong(self):
		data = {"type" : "pong"}
		try:
			await self.send(dumps(data))
		except:
			log.info("C4RemotePlayerConsumer : Can not send on closed websocket")
   
   
	async def send_timer(self, event):
		data = {"type" : "timer"}
		data.update(event["Timer"])
		try:
			await self.send(dumps(data))
		except:
			log.info("C4RemotePlayerConsumer : Can not send on closed websocket")

   
	async def receive(self, text_data=None, bytes_data=None):
		content = loads(text_data)
		try:
			type = content["type"]
		except KeyError:
			log.error("C4RemotePlayerConsumer : Key error in receive()")
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
		elif type == "put":
			await self.put(content)
		elif type == "surrend":
			await self.surrend(content)
		elif type == "ping":
			await self.send_pong()
		else:
			log.info("C4RemotePlayerConsumer : Wrong type receive : " + type)
	

	async def leave_game(self):
		try:
			game_instance = await sync_to_async(C4RemoteGame.objects.get)(game_id=self.group_name)
			if self.player == "player_1":
				game_instance.player_1_connected = False
			elif self.player == "player_2":
				game_instance.player_2_connected = False
			await game_instance.asave()
		except Exception:
			log.info("C4RemotePlayerConsumer : Problem leaving game " + self.group_name + " for player " + self.username)

	
	async def auth(self, game_instance : C4RemoteGame) -> bool:
		try :
			clear_token = jwt.decode(self.auth_key,
                            settings.SIMPLE_JWT['VERIFYING_KEY'],
                            settings.SIMPLE_JWT['ALGORITHM'] 
			)
		except jwt.ExpiredSignatureError:
			log.info("C4RemotePlayerConsumer : ExpiredSignatureError from authenticate user")
			return False
		except jwt.InvalidTokenError:
			log.info("C4RemotePlayerConsumer : InvalidTokenError from authenticate user")
			return False
		self.username = clear_token.get('username')
		if self.username == game_instance.player_1_name and game_instance.player_1_connected == False: #Need to auth there
			self.player = "player_1"
			game_instance.player_1_connected = True
		elif self.username == game_instance.player_2_name and game_instance.player_2_connected == False: #Need to auth there
			self.player = "player_2"
			game_instance.player_2_connected = True
		else:
			log.info("C4RemotePlayerConsumer : Problem in auth() for " + self.username + " in game " + self.group_name)
			return False
		self.player_1_username = game_instance.player_1_name
		self.player_2_username = game_instance.player_2_name
		try:
			await game_instance.asave(force_update=True)
			await self.channel_layer.group_add(self.group_name, self.channel_name)
		except Exception:
			log.info("C4RemotePlayerConsumer : Problem in auth() for " + self.username + " in game " + self.group_name)
			await self.close()
		log.info("C4RemotePlayerConsumer : Player " + self.username + " connected to game " + str(game_instance.game_id) + " as " + self.player)  
		return True
	
 
	async def join_game(self, content):
		try:
			self.group_name = content["game_id"]
			self.auth_key = content["auth_key"]
		except:
			log.error("C4RemotePlayerConsumer : Key error in join_game()")
			return
		try:
			game = await sync_to_async(C4RemoteGame.objects.get)(game_id=self.group_name)
		except Exception:
			log.info("C4RemotePlayerConsumer : Game instance " + self.group_name + " does not exist")
			await self.close()
			return
		if await self.auth(game) == False:
			log.info("C4RemotePlayerConsumer : Can not auth player to game " + self.group_name)
			await self.close()    
	
	
class C4RemoteGameConsumer(SyncConsumer):
	def __init__(self, *args, **kwargs):
		self.game_instances = {}
	

	def error(self, error_msg, game_id, close):
		try:
			async_to_sync(self.channel_layer.group_send)(game_id,
				{"type": "send.error", "Error" : error_msg,  "close" : close})
		except Exception:
			log.info("C4RemoteGameConsumer : Can not send error to group channel")
		
  
	def init_game(self, event):
		game_id = event["game_id"]		
		if game_id in self.game_instances:
			print("C4RemoteGameConsumer : Game thread for room " + str(game_id) + " is already initialized")
			return
		try:
			self.game_instances[game_id] = C4RemoteEngine(game_id=game_id, player_1_username=event["player_1_username"], player_2_username=event["player_2_username"])
			self.game_instances[game_id].start()
		except Exception:
			self.error("can not init the game", "true")


	def start_game(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].start_game(event["player"])
		except Exception:
			print("C4RemoteGameConsumer : Game thread for room " + str(game_id) + " can not start because not initialized")

  
	def get_config(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].send_config(event["sender"])
		except Exception:
			print("C4RemoteGameConsumer : Game thread " + str(game_id) + " can not send config because not initialized")

 
	def put(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_input(event["player"], event["column"])
		except Exception:
			print("C4RemoteGameConsumer : Game thread " + str(game_id) + " can not put because not initialized")
		
	  
	def surrend(self, event):
		print("Surrend function in PongLocalGameConsumer")
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_surrend(event["surrender"])
		except Exception:
			print("C4RemoteGameConsumer : Game thread " + str(game_id) + " can not surrend because not initialized")

   
	def join_thread(self, event):
		game_id = event["game_id"]
		try:
			print("C4RemoteGameConsumer : Joining thread " + game_id)
			self.game_instances[game_id].join()
			self.game_instances.pop(game_id)
			print("C4RemoteGameConsumer : Thread waited !")
		except Exception:
			print("C4RemoteGameConsumer : Can not join thread " + str(game_id))