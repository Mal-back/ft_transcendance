from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

log = logging.getLogger(__name__)

class PlayerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        log.info("Player Connected")
        await self.send("Connection accepted")

    
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        log.info(text_data)
        if text_data == 'PING':
            await self.send('PONG')
        else:
            await self.send('Command unknown')