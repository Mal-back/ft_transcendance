from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer, AsyncConsumer
from game_app.game_srcs.Pong import LocalEngine
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
import django
django.setup()
import threading
from game_app.models import LocalGame


log = logging.getLogger(__name__)

class LocalPlayerConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		path = self.scope["path"]
		self.group_name = path.rsplit('/', 1)[1]
		self.username = "Random Player"
		game_object = await sync_to_async(LocalGame.objects.filter)(game_id=self.group_name)
		game_exists = await sync_to_async(game_object.exists)()
		if not game_exists:
			await self.channel_layer.group_add(self.group_name, self.channel_name)
			log.info("Player added to room " + self.group_name)
			game = await sync_to_async(LocalGame.objects.create)(game_creator=self.username, game_id=self.group_name)
			await sync_to_async(game.save)()
			await self.accept()
			self.delete = True
		else:
			log.info("Local game already exists")
			self.delete = False
			await self.close()

	async def clean_game(self):
		log.info("Cleaning game " + str(self.group_name))
		game = await sync_to_async(LocalGame.objects.get)(game_id=self.group_name)
		await sync_to_async(game.delete)()
		await self.channel_layer.send("local_engine", {
			"type": "end.thread",
			"game_id": self.group_name,
		})
		await self.channel_layer.group_discard(self.group_name, self.channel_name)        
	 
	async def disconnect(self, code):
		log.info("Player " + self.username + " disconnected")
		if self.delete == True:
			await self.clean_game()
	
	async def init_game(self):
		await self.channel_layer.send("local_engine", {
			"type": "init.game",
			"game_id": self.group_name,
		})
		
	async def get_config(self):
		await self.channel_layer.send("local_engine", {
			"type": "get.config",
			"game_id": self.group_name,
		})

	async def start_game(self):
		await self.channel_layer.send("local_engine", {
			"type": "start.game",
			"game_id": self.group_name,
		})

	async def move(self, content):
		try:
			player = content["player"]
			direction = content["direction"]
		except KeyError:
			log.error("Key error in LocalPlayerConsumer.move()")
			return
		await self.channel_layer.send("local_engine", {
			"type" : "move",
			"game_id": self.group_name,
			"player" : player,
			"direction": direction
		})
		
	async def pause(self, content):
		try:
			action = content["action"]
		except KeyError:
			log.error("Key error in LocalPlayerConsumer.pause()")
			return
		await self.channel_layer.send("local_engine", {
			"type" : "pause",
			"game_id" : self.group_name,
			"action" : action,
   		})

	async def send_error(self, event):
		data = {"type" : "error"}
		data.update(event["Error"])
		await self.send(dumps(data))

	async def send_frame(self, event):
		data = {"type" : "frame"}
		data.update(event["Frame"])
		await self.send(dumps(data))
  
	async def send_config(self, event):
		data = {"type" : "config"}
		data.update(event["Config"])
		await self.send(dumps(data))
		
	async def send_end_state(self, event):
		data = {"type" : "end_state"}
		data.update(event["End_state"])
		await self.send(dumps(data))
  
	async def end_game(self, event):
		log.info("End game function called in WebsocketConsumer " + self.group_name)
		self.delete = True
		await self.close()
	
	async def receive(self, text_data=None, bytes_data=None):
		content = loads(text_data)
		try:
			type = content["type"]
		except KeyError:
			log.error("Key error in LocalPlayerConsumer.receive()")
			return
		if type == "init_game":
			await self.init_game()
		elif type == "get_config":
			await self.get_config()
		elif type == "start_game":
			await self.start_game()
		elif type == "move":
			await self.move(content)
		elif type == "pause":
			await self.pause(content)
		else:
			log.info("Wrong type receive in LocalPlayerConsumer : " + type)
		
class LocalGameConsumer(SyncConsumer):
	def __init__(self, *args, **kwargs):
		print("LocalGameConsumer created")
		self.game_instances = {}
	
	def error(self, error_msg, game_id):
		async_to_sync(self.channel_layer.group_send)(game_id,
			{"type": "send.error", "Error" : error_msg})
		
	def init_game(self, event):
		print("Nb thread = " + str(threading.active_count()))
		print("Entering init_game() in LocalGameConsumer")
		game_id = event["game_id"]
		if game_id in self.game_instances:
			print("Game thread for room " + str(game_id) + " is already initialized")
			self.error("Game already initialized", game_id)
			return
		self.game_instances[game_id] =  LocalEngine(game_id=game_id)
		self.game_instances[game_id].start()
		print("Nb thread = " + str(threading.active_count()))

	def start_game(self, event):
		print("Entering start_game() in LocalGameConsumer")
		game_id = event["game_id"]
		if game_id not in self.game_instances:
			print("Game thread for room " + str(game_id) + " not initialized")
			self.error("Game not initialized", game_id)
			return
		self.game_instances[game_id].start_game()
  
	def pause(self, event):
		print("Entering pause_game() in LocalConsumer")
		game_id = event["game_id"]
		if game_id not in self.game_instances:
			print("Game thread for room " + str(game_id) + " not initialized")
			self.error("Game not initialized", game_id)
			return
		self.game_instances[game_id].receive_pause(event["action"])
		
	def get_config(self, event):
		print("Entering get_config() in LocalGameConsumer")
		game_id = event["game_id"]
		if game_id not in self.game_instances:
			print("Game thread " + str(game_id) + " can not send config because not initialized")
			self.error("Game not initialized", game_id)
			return
		self.game_instances[game_id].send_config()
  
	def move(self, event):
		self.game_instances[event["game_id"]].receive_movement(event["player"], event["direction"])
		
	def end_thread(self, event):
		game_id = event["game_id"]
		print("Ending thread " + game_id)
		print("Nb thread = " + str(threading.active_count()))
		self.game_instances[game_id].end_thread()
		print("Waiting for thread to end")
		self.game_instances[game_id].join()
		self.game_instances.pop(game_id)
		print("Thread waited !")
		print("Nb thread = " + str(threading.active_count()))