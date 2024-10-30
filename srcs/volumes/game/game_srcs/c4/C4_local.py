import threading
import copy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging

log = logging.getLogger(__name__)

class C4LocalEngine(threading.Thread):
    def __init__(self, game_id, **kwargs):
        return
    
    def run(self):
        return