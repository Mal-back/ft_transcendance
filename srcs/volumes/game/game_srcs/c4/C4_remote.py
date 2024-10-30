import time
import copy
import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging

log = logging.getLogger(__name__)

class C4RemoteEngine(threading.Thread):
	def __init__(self, game_id, player_1_username, player_2_username, **kwargs):
		return

	def run(self):
		return