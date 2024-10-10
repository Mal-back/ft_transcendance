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
     
    async def disconnect(self, code):
        log.info("Player " + self.username + " disconnected")
        if self.delete == True:
            game = await sync_to_async(LocalGame.objects.get)(game_id=self.group_name)
            await sync_to_async(game.delete)()
            await self.channel_layer.send("local_engine", {
                "type": "end.thread",
                "game_id": self.group_name,
            })
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
    
    async def init_game(self):
        await self.channel_layer.send("local_engine", {
            "type": "init.game",
            "game_id": self.group_name,
        })

    async def start_game(self):
        await self.channel_layer.send("local_engine", {
            "type": "start.game",
            "game_id": self.group_name,
        })

    async def move(self, content):
        await self.channel_layer.send("local_engine", {
            "type" : "move",
            "game_id": self.group_name,
            "player" : content["player"],
            "direction": content["direction"]
        })

    async def send_state(self, event):
        await self.send(dumps(event["Frame"]))
  
    async def send_config(self, event):
        await self.send(dumps(event["Config"]))
  
    async def end_game(self, event):
        log.info("End game function called in WebsocketConsumer " + self.group_name)
        self.delete = True
        await self.close()
  
    async def channel_msg(self, event):
        log.info("channel_msg triggered in LocalPlayerConsumer")
        await self.send(event["msg"])
    
    async def receive(self, text_data=None, bytes_data=None):
        content = loads(text_data)
        type = content["type"]
        if type == "start_game":
            await self.start_game()
        elif type == "init_game":
            await self.init_game()
        elif type == "move":
            await self.move(content)
        else:
            log.info("Wrong type receive in LocalPlayerConsumer : " + type)
        
class LocalGameConsumer(SyncConsumer):
    def __init__(self, *args, **kwargs):
        print("LocalGameConsumer created")
        self.game_instances = {}
        
    def init_game(self, event):
        print("Entering start_game() in LocalGameConsumer")
        game_id = event["game_id"]
        self.game_instances[game_id] =  LocalEngine(game_id=game_id)
        self.game_instances[game_id].start()

    def start_game(self, event):
        game_id = event["game_id"]
        self.game_instances[game_id].start_game()
  
    def move(self, event):
        self.game_instances[event["game_id"]].receive_movement(event["player"], event["direction"])
        
    def end_thread(self, event):
        game_id = event["game_id"]
        print("Ending thread " + game_id)
        self.game_instances[game_id].end_thread()
        print("Waiting for thread to end")
        self.game_instances[game_id].join()
        self.game_instances.pop(game_id)
        print("Thread waited !")