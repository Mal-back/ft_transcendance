from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import SyncConsumer
from game_srcs.pong.Pong_local import PongLocalEngine
from json import dumps, loads
import logging
from asgiref.sync import async_to_sync, sync_to_async
from .models import PongLocalGame
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
class PongLocalPlayerConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		try:
			self.group_name = str(uuid.uuid4())
			game = await sync_to_async(PongLocalGame.objects.create)(game_id=self.group_name)
			await sync_to_async(game.save)()
			await self.channel_layer.group_add(self.group_name, self.channel_name)
			log.info("Local Player added to room " + self.group_name)
			await self.accept()
			self.delete = True
			self.game_ended = False
	   
		except Exception:
			log.info("Local game already exists")
			self.delete = False
			await self.close()	

	async def clean_game(self):
		log.info("Cleaning game " + str(self.group_name))
		try:
			game = await sync_to_async(PongLocalGame.objects.get)(game_id=self.group_name)
			await sync_to_async(game.delete)()
		except Exception:
			log.info("Cannot delet game model id " + self.group_name)
		if self.game_ended == False:
			try:
				await self.channel_layer.send("pong_local_engine", {
					"type": "end.thread",
					"game_id": self.group_name,
				})
			except:
				log.info("Error sending end_thread to PongLocalEngine")
		try:
			await self.channel_layer.group_discard(self.group_name, self.channel_name)
		except:
			log.info("Can not discard channel " + self.channel_name + " from group " + self.group_name) 
	 
	async def disconnect(self, code):
		log.info("Local Player disconnected")
		if self.delete == True:
			await self.clean_game()
	
	async def init_game(self):
		try:
			await self.channel_layer.send("pong_local_engine", {
				"type": "init.game",
				"game_id": self.group_name,
			})
		except:
			log.info("Error sending init_game to PongLocalEngine")
			await self.close()
		
	async def get_config(self):
		try:
			await self.channel_layer.send("pong_local_engine", {
				"type": "get.config",
				"game_id": self.group_name,
			})
		except:
			log.info("Error sending get_config to PongLocalEngine")
			await self.close()

	async def start_game(self):
		try:
			await self.channel_layer.send("pong_local_engine", {
				"type": "start.game",
				"game_id": self.group_name,
			})
		except:
			log.info("Error sending start_game to PongLocalEngine")
			await self.close()   

	async def move(self, content):
		try:
			player = content["player"]
			direction = content["direction"]
		except KeyError:
			log.error("Key error in PongLocalPlayerConsumer.move()")
			return
		try:
			await self.channel_layer.send("pong_local_engine", {
				"type" : "move",
				"game_id": self.group_name,
				"player" : player,
				"direction": direction
			})
		except:
			log.info("Error sending move to PongLocalEngine")
			await self.close()
		
	async def pause(self, content):
		try:
			action = content["action"]
		except KeyError:
			log.error("Key error in PongLocalPlayerConsumer.pause()")
			return
		try:
			await self.channel_layer.send("pong_local_engine", {
				"type" : "pause",
				"game_id" : self.group_name,
				"action" : action,
			})
		except:
			log.info("Error sending pause to PongLocalEngine")
			await self.close()
  
	async def surrend(self, content):
		try:
			surrender = content["surrender"]
		except KeyError:
			log.error("Key error in PongLocalPlayerConsumer.pause()")
			return
		try:
			await self.channel_layer.send("pong_local_engine", {
				"type" : "surrend",
				"game_id" : self.group_name,
				"surrender": surrender,
			})
		except:
			log.info("Error sending surrend to PongLocalEngine")
			await self.close()

	async def send_error(self, event):
		data = {"type" : "error"}
		data.update({"error_msg" : event["Error"]})
		try:
			await self.send(dumps(data))
		except:
			log.info("Can not send on closed websocket")
		if event["close"] == "true":
			await self.close()

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
  
	async def send_pong(self):
		data = {"type" : "pong"}
		try:
			await self.send(dumps(data))
		except:
			log.info("Can not send on closed websocket")
	
	async def receive(self, text_data=None, bytes_data=None):
		content = loads(text_data)
		try:
			type = content["type"]
		except KeyError:
			log.error("Key error in PongLocalPlayerConsumer.receive()")
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
		elif type == "surrend":
			await self.surrend(content)
		elif type == "ping":
			await self.send_pong()
		else:
			log.info("Wrong type receive in PongLocalPlayerConsumer : " + type)

class PongLocalGameConsumer(SyncConsumer):
	def __init__(self, *args, **kwargs):
		print("PongLocalGameConsumer created")
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
			self.game_instances[game_id] = PongLocalEngine(game_id=game_id)
			self.game_instances[game_id].start()
		except Exception:
			self.error("can not init the game", game_id,  "true")

	def start_game(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].start_game()
		except Exception:
			print("Game thread for room " + str(game_id) + " can not start because not initialized")
  
	def pause(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].receive_pause(event["action"])
		except Exception:
			print("Game thread for room " + str(game_id) + " can not pause because not initialized")
		
	def get_config(self, event):
		game_id = event["game_id"]
		try:
			self.game_instances[game_id].send_config()
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
