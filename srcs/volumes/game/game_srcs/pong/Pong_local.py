# coding: utf-8
from .Const import Const
import time
import threading
import copy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .Frame import Frame
from .Config import Config

allowed_movement = ["UP", "DOWN", "NONE"]
	
class PongLocalEngine(threading.Thread):
	def __init__(self, game_id, **kwargs):
		super().__init__(daemon=True)
		self.game_id = game_id
		self.channel_layer = get_channel_layer()
		self.frame = copy.deepcopy(Frame())
		self.config = copy.deepcopy(Config(player_1_pos=self.frame.player_1.top_left(),
			player_2_pos=self.frame.player_2.top_left(),
			player_1_username=self.frame.player_1.username,
			player_2_username=self.frame.player_2.username,
			ball_pos=self.frame.board.ball.position))
		self.frame_rate = 1 / 60
		self.movement_lock = threading.Lock()
		self.start_lock = threading.Lock()
		self.running = False
		self.end_lock = threading.Lock()
		self.end = False
		self.surrender = "None"
		self.surrender_lock = threading.Lock()
		self.winner = "None"
  
  
	def wait_start(self):
		print("PongLocalEngine : Waiting game  " + self.game_id + " to start")
		while True:
			with self.start_lock:
				if self.running == True:
					break
			with self.end_lock:
				if self.end == True:
					break
			time.sleep(self.frame_rate)

	def start_game(self):
		with self.start_lock:
			if self.running == False:
				print("PongLocalEngine : Starting game instance " + self.game_id)
				self.running = True
 
	def run(self) -> None:
		self.wait_start()
		while True:
			with self.end_lock:
				if self.end == True:
					break
			self.frame = self.get_next_frame()
			self.send_frame()
			if self.frame.end == True or self.check_surrender() == True:
				self.send_end_state(self.frame)
				break
			time.sleep(self.frame_rate)
			self.check_pause()
		self.join_thread()
		print("PongLocalEngine : End of run function for thread " + self.game_id)

	def join_thread(self):
		try:
			async_to_sync(self.channel_layer.send)("pong_local_engine", {
				"type": "join.thread",
				"game_id": self.game_id
			})
		except:
			print("PongLocalEngine : Can not send join thread to pong_local_engine from game " + self.game_id)					
		
	def receive_movement(self, player : str, direction : str):
		with self.start_lock:
			if self.running == False:
				return
		try:
			with self.movement_lock:
				if player == "player_1":
					self.frame.player_1.movement = direction
				if player == "player_2":
					self.frame.player_2.movement = direction
		except ValueError:
			return
   
	def receive_pause(self, action : str):
		with self.start_lock:
			if action == "start" and self.running == False:
				self.running = True
				self.send_pause("start")
			elif action == "stop" and self.running == True:
				self.running = False
				self.send_pause("stop")
	
	def receive_surrend(self, surrender : str) -> None:
		with self.surrender_lock:
			if (surrender == "player_1" or surrender == "player_2") and self.surrender == "None":
				self.surrender = surrender
					 
	def move_players(self, frame : Frame) -> Frame:
		frame.player_1.move()
		frame.player_2.move()
		return frame

	def move_ball(self, frame : Frame) -> Frame:
		if frame.board.ball.direction.dx < 0:
			frame.board.ball.move(frame.player_1)
		else:
			frame.board.ball.move(frame.player_2)
		return frame
 
	def check_goal(self, frame : Frame) -> Frame:
		if frame.board.ball.position.x <= 0:
			frame.player_2.score += 1
			frame.board.ball.reset("left")
			frame.reset = True
		elif frame.board.ball.position.x >= Const["BOARD_LEN"].value:
			frame.player_1.score += 1
			frame.board.ball.reset()
			frame.reset = True
		if frame.player_1.score == Const["MAX_SCORE"].value:
			frame.end = True
			self.winner = "player_1"
		elif frame.player_2.score == Const["MAX_SCORE"].value:
			frame.end = True
			self.winner = "player_2"
		return frame

	def check_pause(self) -> None :
		while True:
			with self.start_lock:
				if self.running == True:
					break
			with self.end_lock:
				if self.end == True:
					break
			time.sleep(self.frame_rate)
	   
	def check_surrender(self) -> bool:
		with self.surrender_lock:
			if self.surrender == "player_1" or self.surrender == "player_2":
				self.winner = "player_1" if self.surrender == "player_2" else "player_2"
				return True
		return False

	def get_next_frame(self) -> Frame:
		new_frame = self.frame
		new_frame = self.check_goal(new_frame)
		if new_frame.reset == True:
			new_frame.reset = False
			return new_frame
		with self.movement_lock:
			new_frame = self.move_players(new_frame)
		new_frame = self.move_ball(new_frame)
		return new_frame
 
	def end_thread(self) -> None:
		with self.end_lock:
			self.end = True
   
	def send_frame(self) -> None:
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type": "send.frame",
				"Frame": self.frame.render(),
			})
		except Exception:
			print("PongLocalEngine : Can not send frame to group channel " + self.game_id)
		
	def send_config(self) -> None:
		conf = self.config.render()
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type": "send.config",
				"Config": conf,
			})
		except Exception:
			print("PongLocalEngine : Can not send config to group channel " + self.game_id)
  

	def send_pause(self, action : str) -> None:
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type": "send.pause",
				"Pause": action
			})
		except Exception:
			print("PongLocalEngine : Can not send pause to group channel " + self.game_id)
		
	def send_end_state(self, last_frame) -> None:
		data = {"winner" : self.winner,
		  "score_1" : last_frame.player_1.score,
		  "score_2" : last_frame.player_2.score,
		}
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type" : "send.end.state",
				"End_state" : data,
			})
		except Exception:
			print("PongLocalEngine : Can not send end state to group channel " + self.game_id)