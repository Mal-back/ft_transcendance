# coding: utf-8
from .Const import Const
import time
import copy
import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .Frame import Frame
from .Config import Config

allowed_movement = ["UP", "DOWN", "NONE"]
	
class PongRemoteEngine(threading.Thread):

	def __init__(self, game_id, player_1_username, player_2_username, **kwargs):
		super().__init__(daemon=True)
		self.game_id = game_id
		self.player_1_username = player_1_username
		self.player_2_username = player_2_username
		self.channel_layer = get_channel_layer()
		self.frame = copy.deepcopy(Frame())
		self.config = copy.deepcopy(Config(player_1_pos=self.frame.player_1.top_left(),
			player_2_pos=self.frame.player_2.top_left(),
			player_1_username=self.player_1_username,
			player_2_username=self.player_2_username,
			ball_pos=self.frame.board.ball.position))
		self.frame_rate = 1 / 60
		self.movement_lock = threading.Lock()
		self.start_lock = threading.Lock()
		self.runing_player_1 = "stop"
		self.runing_player_2 = "stop"
		self.surrender = "None"
		self.surrender_lock = threading.Lock()
		self.winner = "None"
		
	def wait_start(self):
		print("Waiting for pong remote game instance " + self.game_id + " to start | player_1_start = " + self.runing_player_1 + " | player_2_start = " + self.runing_player_2)
		waiting_opponent = 0
		while True:
			with self.start_lock:
				if self.runing_player_1 == "start" and self.runing_player_2 == "start":
					break
				if self.runing_player_1 == "start" or self.runing_player_2 == "start":
					if waiting_opponent == 0:
						self.send_wait_opponent()
					waiting_opponent += 1
			if waiting_opponent * self.frame_rate >= 30:
				with self.start_lock:
					with self.surrender_lock:
						self.surrender = "player_1" if self.runing_player_1 == "stop" else "player_2"
				break
			time.sleep(self.frame_rate)
		print("player_1_start = " + self.runing_player_1 + " | player_2_start = " + self.runing_player_2)

	def send_wait_opponent(self):
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type": "send.wait.opponent",
			})
		except Exception:
			print("Can not send frame to group channel " + self.game_id)

	def start_game(self, player : str):
		with self.start_lock:
			if player == "player_1":
				self.runing_player_1 = "start"
			elif player == "player_2":
				self.runing_player_2 = "start"
 
	def run(self) -> None:
		self.wait_start()
		self.send_pause("start");
		while True:
			self.frame = self.get_next_frame()
			self.send_frame()
			if self.frame.end == True or self.check_surrender() == True:
				self.send_end_state(self.frame)
				break
			time.sleep(self.frame_rate)
			self.check_pause()
		self.clean_game()
		self.join_thread()
		print("End of run function for thread " + self.game_id)
							
	def join_thread(self):
		try:
			async_to_sync(self.channel_layer.send)("pong_remote_engine", {
				"type": "join.thread",
				"game_id": self.game_id
			})
		except:
			print("Can not send join thread to pong_remote_engine from thread num " + self.game_id)
   
	def clean_game(self):
		try:
			async_to_sync(self.channel_layer.send)("pong_remote_engine", {
				"type": "clean.game",
				"game_id": self.game_id
			})
		except:
			print("Can not send clean game to pong_remote_engine from thread num " + self.game_id)     
				   
	def receive_movement(self, player : str, direction : str):
		with self.start_lock:
			if self.runing_player_1 == "stop" or self.runing_player_2 == "stop":
				return
		try:
			with self.movement_lock:
				if player == "player_1":
					self.frame.player_1.movement = direction
				if player == "player_2":
					self.frame.player_2.movement = direction
		except ValueError:
			return
   
	def receive_pause(self, player : str, action : str):
		if action != "start" and action != "stop":
			return
		with self.start_lock:
			if player == "player_1":
				self.runing_player_1 = action
			else:
				self.runing_player_2 = action
			print("Received pause in remote engine from " + player + " action = " + action)
	
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
			frame.board.ball.reset()
			frame.reset = True
		elif frame.board.ball.position.x >= Const["BOARD_LEN"].value:
			frame.player_1.score += 1
			frame.board.ball.reset()
			frame.reset = True
		if frame.player_1.score == Const["MAX_SCORE"].value:
			frame.end = True
			self.winner = self.player_1_username
			self.looser = self.player_2_username
		elif frame.player_2.score == Const["MAX_SCORE"].value:
			frame.end = True
			self.winner = self.player_2_username
			self.looser = self.player_1_username
		return frame

	def check_pause(self) -> None :
		with self.start_lock:
			if self.runing_player_1 == "start" and self.runing_player_2 == "start":
				return
			else:
				self.runing_player_1 = "stop"
				self.runing_player_2 = "stop"
				self.send_pause("stop")
		count = 0
		while True:
			with self.start_lock:
				if self.runing_player_1 == "start" and self.runing_player_2 == "start":
					break
				if count * self.frame_rate >= 30:
					self.runing_player_1 = "start"
					self.runing_player_2 = "start"
			# with self.end_lock:
			# 	if self.end == True:
			# 		break
			count += 1
			time.sleep(self.frame_rate)
		self.send_pause("start" )

	   
	def check_surrender(self) -> bool:
		with self.surrender_lock:
			if self.surrender == "player_1" or self.surrender == "player_2":
				self.winner = self.player_1_username if self.surrender == "player_2" else self.player_2_username
				self.looser = self.player_1_username if self.surrender == "player_1" else self.player_2_username
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
 

	def send_frame_channel(self, channel : str):
		try:
			async_to_sync(self.channel_layer.send)(channel, {
				"type": "send.frame",
				"Frame": self.frame.render(),
			})
		except Exception:
			print("Can not send frame to group channel " + self.game_id)

	def send_frame(self) -> None:
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type": "send.frame",
				"Frame": self.frame.render(),
			})
		except Exception:
			print("Can not send frame to group channel " + self.game_id)
		
	def send_config(self, channel_name : str) -> None:
		conf = self.config.render()
		try:
			async_to_sync(self.channel_layer.send)(channel_name, {
				"type": "send.config",
				"Config": conf,
			})
			self.send_frame_channel(channel_name)
			with self.start_lock:
				if self.runing_player_1 == "stop" or self.runing_player_2 == "stop":
					self.send_pause_channel("stop", channel_name)
				else:
					self.send_pause_channel("start", channel_name)
		except Exception:
			print("Can not send config to group channel " + self.game_id)
  
  
	def send_pause_channel(self, action : str, channel : str) -> None:
		try:
			async_to_sync(self.channel_layer.send)(channel, {
				"type": "send.pause",
				"Pause": action
			})
		except Exception:
			print("Can not send pause to group channel " + self.game_id)


	def send_pause(self, action : str) -> None:
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type": "send.pause",
				"Pause": action
			})
		except Exception:
			print("Can not send pause to group channel " + self.game_id)

		
	def send_end_state(self, last_frame) -> None:
		winner_points = last_frame.player_1.score if self.winner == self.player_1_username else last_frame.player_2.score
		looser_points = last_frame.player_1.score if self.winner == self.player_2_username else last_frame.player_2.score
		data = {"winner" : self.winner,
			"looser" : self.looser,
		  "winner_points" : winner_points,
		  "looser_points" : looser_points,
		}
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type" : "send.end.state",
				"End_state" : data,
			})
		except Exception:
			print("Can not send end state to group channel " + self.game_id)
		try:
			async_to_sync(self.channel_layer.send)("pong_remote_engine", {
				"type" : "send.result",
				"End_state" : data,
				"game_id" : self.game_id,
			})
		except Exception:
			print("Can not send end state to group channel " + self.game_id)
			
