from channels.generic.websocket import AsyncWebsocketConsumer, SyncConsumer
# from game_app.models import LocalGameRoom
from game_app.game_srcs.Pong import testThread
import json
import logging
import re

log = logging.getLogger(__name__)

class PlayerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.name = None
        self.game = None
        self.group_name = None
        path = self.scope["path"]
        self.room_name = path.rsplit('/', 1)[1]
        await self.accept()
        # self.send("Channel name : " + self.channel_name)
        # self.send("Room name : " + self.room_name)
        # await self.channel_layer.group_add(self.room_name, self.channel_name)
        

    async def disconnect(self, close_code):
        # await self.channel_layer.group_discard(self.room_name, self.channel_name)
        log.info("Player disconnected")
        
    async def chat_message(self, event):
        log.info("chat_message function PlayerCOnsumer")
        # await self.send(text_data=event["message"])

    async def join(self, msg: dict):
        log.info("Join function PlayerCOnsumer")
        # await self.channel_layer.send("game_engine", {"type": "test","name": " Jack"})
        
    
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        content = json.loads(text_data)
        type = content["type"]
        msg = content["content"]
        name = content["name"]
        if type == "message":
            return
            # await self.channel_layer.group_send(self.room_name,
			# {
			# 	"type": "chat.message",
			# 	"message": name + " : " + msg,
			# })
        elif type == "join":
            self.join({"name" : "Jack",})
        else:
            log.warn("unknown type message from websocket")
            
            
class GameConsumer(SyncConsumer):
    def __init__(self, *args, **kwargs):
        """
        Created on demand when the first player joins.
        """
        log.info("Test GameConsumer init")
        super().__init__(*args, **kwargs)
        self.group_name = "985"
        # self.engine = testThread(self.group_name)
        
        
    def test(self, event):
        log.info("Test GameConsumer")