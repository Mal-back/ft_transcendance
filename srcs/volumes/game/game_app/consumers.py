from channels.generic.websocket import AsyncWebsocketConsumer, SyncConsumer
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
        await self.send("Channel name : " + self.channel_name)
        await self.send("Room name : " + self.room_name)
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        log.info("Player disconnected")
        
    async def chat_message(self, event):
        await self.send(text_data=event["message"])
        
    async def join(self, msg):
        await self.channel_layer.send("game_engine", {})
        
    
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        content = json.loads(text_data)
        type = content["type"]
        msg = content["content"]
        name = content["name"]
        if type == "message":
            await self.channel_layer.group_send(self.room_name,
			{
				"type": "chat.message",
				"message": name + " : " + msg,
			})
        elif type == "join":
            self.join("test")
        else:
            log.warn("unknown type message from websocket")
            
class GameConsumer(SyncConsumer):
    def __init__(self, *args, **kwargs):
        log.info("Game Consumer: %s %s", args, kwargs)
        super().__init__(*args, **kwargs)
        self.groupe_name = ""