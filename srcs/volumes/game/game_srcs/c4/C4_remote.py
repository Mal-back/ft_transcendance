from .Board import Board
import threading
import copy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import time 

class C4LocalEngine(threading.Thread):
	def __init__(self, game_id, **kwargs):
		super().__init__(daemon=True)
		self.board = copy.deepcopy(Board("player_1", "player_2"))
		self.conf = self.board.getConfig()
		self.tick = 0
		self.winner = "None"
		self.surrender = "None"
		self.surrender_lock = threading.Lock()
		self.game_id = game_id
		self.channel_layer = get_channel_layer()
		self.end = False
		self.end_lock = threading.Lock()
		self.start_lock= threading.Lock()
		self.running = False
		self.sleep = 0.01
		self.input_lock = threading.Lock()
		self.input_receive = False
		self.input_player = "None"
		self.input_column = "None"


	def wait_start(self):
		print("Waiting for C4 Local Game Instance " + self.game_id + " to start")
		while True:
			with self.start_lock:
				if self.running == True:
					break
			with self.end_lock:
				if self.end == True:
					break
			time.sleep(self.sleep)
   
   
	def start_game(self):
		with self.start_lock:
			if self.running == True:
				print("C4 Local Game instance " + self.game_id + "is already running, this function returns without doing anything")
			else:
				print("Starting C4 Local Game instance " + self.game_id)
				self.running = True
