from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from game_srcs.c4.C4_local import C4LocalEngine
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from .models import C4LocalGame
import uuid

log = logging.getLogger(__name__)

class C4LocalPlayerConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		try:
			self.group_name = str(uuid.uuid4())
			game = await sync_to_async(C4LocalGame.objects.create)(game_id=self.group_name)
			await sync_to_async(game.save)()
			await self.channel_layer.group_add(self.group_name, self.channel_name)
			log.info("C4LocalPlayerConsumer : Local player added to room " + self.group_name)
			await self.accept()
			self.delete = True
			self.game_ended = False
		except Exception:
			log.info("C4LocalPlayerConsumer : Local game " + self.group_name + " already exists")
			self.delete = False
			await self.close()	


	async def clean_game(self):
		log.info("C4LocalPlayerConsumer : Cleaning game " + str(self.group_name))
		try:
			game = await sync_to_async(C4LocalGame.objects.get)(game_id=self.group_name)
			await sync_to_async(game.delete)()
		except Exception:
			log.info("C4LocalPlayerConsumer : Cannot delet game model id " + self.group_name)
		if self.game_ended == False:
			try:
				await self.channel_layer.send("c4_local_engine", {
					"type": "end.thread",
					"game_id": self.group_name,
				})
			except:
				log.info("C4LocalPlayerConsumer : Error sending end_thread to C4LocalEngine")
		try:
			await self.channel_layer.group_discard(self.group_name, self.channel_name)
		except:
			log.info("C4LocalPlayerConsumer : Can not discard channel " + self.channel_name + " from group " + self.group_name) 
  
  
	async def disconnect(self, code):
		log.info("C4LocalPlayerConsumer : Local Player disconnected")
		if self.delete == True:
			await self.clean_game()
	
 
	async def init_game(self):
		try:
			await self.channel_layer.send("c4_local_engine", {
				"type": "init.game",
				"game_id": self.group_name,
			})
		except:
			log.info("C4LocalPlayerConsumer : Error sending init_game to C4LocalEngine")
			await self.close()
 

	async def start_game(self):
		try:
			await self.channel_layer.send("c4_local_engine", {
				"type": "start.game",
				"game_id": self.group_name,
			})
		except:
			log.info("C4LocalPlayerConsumer : Error sending start_game to C4LocalEngine")
			await self.close()   


	async def get_config(self):
		try:
			await self.channel_layer.send("c4_local_engine", {
				"type": "get.config",
				"game_id": self.group_name,
			})
		except:
			log.info("C4LocalPlayerConsumer : Error sending get_config to C4LocalEngine")
			await self.close()
   

	async def put(self, content):
		try:
			player = content["player"]
			column = content["column"]
		except KeyError:
			log.error("C4LocalPlayerConsumer : Key error in put()")
			return
		try:
			await self.channel_layer.send("c4_local_engine", {
				"type" : "put",
				"game_id": self.group_name,
				"player" : player,
				"column": column
			})
		except:
			log.info("C4LocalPlayerConsumer : Error sending put to C4LocalEngine")
			await self.close()


	async def surrend(self, content):
		try:
			surrender = content["surrender"]
		except KeyError:
			log.error("C4LocalPlayerConsumer : Key error in surrend()")
			return
		try:
			await self.channel_layer.send("c4_local_engine", {
				"type" : "surrend",
				"game_id" : self.group_name,
				"surrender": surrender,
			})
		except:
			log.info("C4LocalPlayerConsumer : Error sending surrend to PongLocalEngine")
			await self.close()


	async def send_error(self, event):
		data = {"type" : "error"}
		data.update({"error_msg" : event["Error"]})
		try:
			await self.send(dumps(data))
		except:
			log.info("C4LocalPlayerConsumer : Can not send on closed websocket")
		if event["close"] == "true":
			await self.close()


	async def send_frame(self, event):
		data = {"type" : "frame"}
		data.update(event["Frame"])
		try:
			await self.send(dumps(data))
		except:
			log.info("C4LocalPlayerConsumer : Can not send on closed websocket")


	async def send_config(self, event):
		data = {"type" : "config"}
		data.update(event["Config"])
		try:
			await self.send(dumps(data))
		except:
			log.info("C4LocalPlayerConsumer : Can not send on closed websocket")

		
	async def send_end_state(self, event):
		data = {"type" : "end_state"}
		data.update(event["End_state"])
		try:
			await self.send(dumps(data))
		except:
			log.info("C4LocalPlayerConsumer : Can not send on closed websocket")
		self.game_ended = True
		await self.close()


	async def send_pong(self):
		data = {"type" : "pong"}
		try:
			await self.send(dumps(data))
		except:
			log.info("C4LocalPlayerConsumer : Can not send on closed websocket")


	async def receive(self, text_data=None, bytes_data=None):
		content = loads(text_data)
		try:
			type = content["type"]
		except KeyError:
			log.error("C4LocalPlayerConsumer : Key error in receive()")
			return
		if type == "init_game":
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
			log.info("C4LocalPlayerConsumer : Wrong type receive " + type)
	
 
class C4LocalGameConsumer(SyncConsumer):
	def __init__(self, *args, **kwargs):
		print("C4LocalGameConsumer created")
		self.game_instances = {}

	
	def error(self, error_msg, game_id, close):
		try:
			async_to_sync(self.channel_layer.group_send)(game_id,
				{"type": "send.error", "Error" : error_msg,  "close" : close})
		except Exception:
			log.info("C4LocalGameConsumer : Can not send error to group channel" + game_id)
	
 	
	def init_game(self, event):
		game_id = event["game_id"]		
		if game_id in self.game_instances:
			print("C4LocalGameConsumer : Game thread for room " + str(game_id) + " is already initialized")
			return
		try:
			self.game_instances[game_id] = C4LocalEngine(game_id=game_id)
			self.game_instances[game_id].start()
		except Exception:
			self.error("can not init the game", game_id, "true")


	def start_game(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].start_game()
		except Exception:
			print("C4LocalGameConsumer : Game thread for room " + str(game_id) + " can not start because not initialized")

		
	def get_config(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].send_config()
		except Exception:
			print("C4LocalGameConsumer : Game thread " + str(game_id) + " can not send config because not initialized")

  
	def put(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_input(event["player"], event["column"])
		except Exception:
			print("C4LocalGameConsumer : Game thread " + str(game_id) + " can not put because not initialized")

			
	def surrend(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_surrend(event["surrender"])
		except Exception:
			print("C4LocalGameConsumer : Game thread " + str(game_id) + " can not surrend because not initialized")


	def end_thread(self, event):
		game_id = event["game_id"]
		try :
			print("Ending thread " + game_id)
			self.game_instances[game_id].end_thread()
		except Exception:
			print("C4LocalGameConsumer : Can not end thread " + str(game_id))

   
	def join_thread(self, event):
		game_id = event["game_id"]
		try:
			print("C4LocalGameConsumer : Joining thread " + game_id)
			self.game_instances[game_id].join()
			self.game_instances.pop(game_id)
			print("C4LocalGameConsumer : Thread waited !")
		except Exception:
			print("C4LocalGameConsumer : Can not join thread " + str(game_id))
