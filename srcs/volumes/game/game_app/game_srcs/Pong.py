# coding: utf-8
from .Const import Const
import time
import copy
import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging
from .Coord import Coordinates, Direction
log = logging.getLogger(__name__)
from attrs import define, field, validators
from .Math import CollisionCircleSegment, ImpactProjection, Circle, GetBounceDir, GetNormal

allowed_movement = ["UP", "DOWN", "NONE"]
allowed_pause = ["stop", "start"]
		
@define
class Player:
	username: str = field(validator=validators.instance_of(str), default="default_name")
	position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Coordinates(50,50))
	direction: Direction = field(validator=validators.instance_of(Direction), default=Direction(0,0))
	score: int = field(validator=validators.instance_of(int), default=0)
	len: int = field(validator=validators.instance_of(int), default=Const["PAD_LEN"].value)
	height: int = field(validator=validators.instance_of(int), default=Const["PAD_HEIGHT"].value)
	speed: int = field(validator=validators.instance_of(int), default=Const["PAD_SPEED"].value)
	movement: str = field(validator=[validators.instance_of(str), validators.in_(allowed_movement),], default="NONE")
 
	def render(self) -> dict:
		return { "username": self.username,
			"position": self.top_left().render(),
			"score": self.score,
		}
	
	def top_left(self) -> Coordinates:
		return Coordinates(self.position.x - self.len, self.position.y - self.height)

	def top(self) -> int:
		return self.position.y - self.height

	def bot(self) -> int:
		return self.position.y + self.height

	def front(self) -> int:
		if self.position.x < Const["CENTER"].value.x:
			return self.position.x + self.len
		else:
			return self.position.x - self.len

	def back(self) -> int:
		if self.position.x < Const["CENTER"].value.x:
			return self.position.x - self.len
		else:
			return self.position.x + self.len

	def correct_direction(self) -> Direction:
		new_dy = self.direction.dy
		if self.bot() + self.direction.dy > Const["BOARD_HEIGHT"].value:
			new_dy = Const["BOARD_HEIGHT"].value - self.bot()
		elif self.top() + self.direction.dy < 0:
			new_dy = -self.top()
		return Direction(self.direction.dx, new_dy)

	def reset_direction(self) -> None:
		self.direction = Direction(0, 0)
		self.movement = "NONE"
		
	def read_movement(self) -> Direction:
		if self.movement == "UP":
			return Direction(0, -self.speed)
		elif self.movement == "DOWN":
			return Direction(0, +self.speed)
		else:
			return self.direction
	
	def move(self) -> None:
		self.direction = self.read_movement()
		self.direction = self.correct_direction()
		self.position = self.position.move(self.direction)
		self.reset_direction()
 
@define
class Ball:
	position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["CENTER"].value)
	direction: Direction = field(validator=validators.instance_of(Direction), default=Const["BALL_DIR"].value)
	size: int = field(validator=validators.instance_of(int), default=Const["BALL_SIZE"].value)

	def top(self) -> int:
		return self.position.y - self.size

	def bot(self) -> int:
		return self.position.y + self.size

	def front(self) -> int:
		if self.direction.dx < 0:
			return self.position.x - self.size
		else:
			return self.position.x + self.size

	def back(self) -> int:
		if self.direction.dx < 0:
			return self.position.x + self.size
		else:
			return self.position.x - self.size

	def check_player_collision(self, player : Player) -> bool:
		new_pos = Coordinates(self.position.x + self.direction.dx, self.position.y + self.direction.dy)
		if CollisionCircleSegment(Coordinates(player.front(), player.top()), Coordinates(player.front(), player.bot()), Circle(new_pos, self.size)):
			return True
		else:
			return False

	def handle_player_collision(self, player : Player) -> None:
		impact = ImpactProjection(Coordinates(player.front(), player.top()), Coordinates(player.front(), player.bot()), self.position)
		sign_dx = 1 if self.direction.dx > 0 else -1
		new_pos = Coordinates(-sign_dx * self.size + impact.x , impact.y)
		self.position = new_pos
		self.direction = GetBounceDir(self.direction, GetNormal(Coordinates(player.front(), player.top()), Coordinates(player.front(), player.bot()), self.position))
  
	def check_wall_collision(self) -> bool:
		y_wall = 0 if self.direction.dy < 0 else Const["BOARD_HEIGHT"].value
		new_pos = Coordinates(self.position.x + self.direction.dx, self.position.y + self.direction.dy)
		if CollisionCircleSegment(Coordinates(0, y_wall), Coordinates(Const["BOARD_LEN"].value, y_wall), Circle(new_pos, self.size)) == True:
			return True
		else:
			return False

	def handle_wall_collision(self) -> None:
		y_wall = 0 if self.direction.dy < 0 else Const["BOARD_HEIGHT"].value
		impact = ImpactProjection(Coordinates(0, y_wall), Coordinates(Const["BOARD_LEN"].value, y_wall), self.position)
		sign_dy = 1 if self.direction.dy >= 0 else -1
		new_pos = Coordinates(impact.x, -sign_dy * self.size + impact.y)
		self.position = new_pos
		self.direction = GetBounceDir(self.direction, GetNormal(Coordinates(0, y_wall), Coordinates(Const["BOARD_LEN"].value, y_wall), self.position))		

	def move(self, player : Player) -> None:
		if self.check_player_collision(player) == True:
			self.handle_player_collision(player)
		elif self.check_wall_collision() == True:
			self.handle_wall_collision()
		else:
			self.position = self.position.move(self.direction)
	
	def reset(self) -> None:
		self.position = Const["CENTER"].value
		self.direction = Const["BALL_DIR"].value
	
	def render(self) -> dict:
		return { "position": self.position.render(),
		}
	
@define
class Board:
	ball: Ball = field(validator=validators.instance_of(Ball), default=Ball())
	dimension : Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["DIMENSION"].value)
	
	def render(self) -> dict:
		return { "Ball" : self.ball.render(),
				"Dimensions" : self.dimension.render(),
		}
	
@define
class Frame:
	board: Board = field(validator=validators.instance_of(Board), default=Board())
	player_1 : Player = field(validator=validators.instance_of(Player), default=Player(username="player_1", position=Coordinates(Const["X_PLAYER_1"].value, Const["Y_PLAYER"].value)))
	player_2 : Player = field(validator=validators.instance_of(Player), default=Player(username="player_2", position=Coordinates(Const["X_PLAYER_2"].value, Const["Y_PLAYER"].value)))
	
	reset : bool = False
	end : bool = False
 
	def render(self) -> dict:
		return { "ball" : self.board.ball.render(),
				"player_1" : self.player_1.render(),
				"player_2" : self.player_2.render(),    
		}
		
@define
class Config:
	player_1_pos : Coordinates = field(validator=validators.instance_of(Coordinates))
	player_2_pos : Coordinates = field(validator=validators.instance_of(Coordinates))
	ball_pos : Coordinates = field(validator=validators.instance_of(Coordinates))
	board_len : int = field(validator=validators.instance_of(int), default=Const["BOARD_LEN"].value)
	board_height : int = field(validator=validators.instance_of(int), default=Const["BOARD_HEIGHT"].value)
	ball_size : int = field(validator=validators.instance_of(int), default=Const["BALL_SIZE"].value)
	pad_len : int = field(validator=validators.instance_of(int), default=Const["PAD_LEN"].value)
	pad_height : int = field(validator=validators.instance_of(int), default=Const["PAD_HEIGHT"].value)
	pad_offset : int = field(validator=validators.instance_of(int), default=Const["PAD_OFFSET"].value)
	
	def render(self) -> dict:
		return { "board_len" : self.board_len,
				"board_height" : self.board_height,
				"ball_size" : self.ball_size,
				"pad_len" : self.pad_len * 2,
				"pad_height" : self.pad_height * 2,
				"player_1" : self.player_1_pos.render(),
				"player_2" : self.player_2_pos.render(),
				"ball": self.ball_pos.render(),
		}
	
class LocalEngine(threading.Thread):
	def __init__(self, game_id, **kwargs):
		super().__init__(daemon=True)
		self.game_id = game_id
		self.channel_layer = get_channel_layer()
		self.frame = copy.deepcopy(Frame())
		self.config = copy.deepcopy(Config(player_1_pos=self.frame.player_1.top_left(),
			player_2_pos=self.frame.player_2.top_left(),
			ball_pos=self.frame.board.ball.position))
		self.frame_rate = 1 / 60
		self.movement_lock = threading.Lock()
		self.start_lock = threading.Lock()
		self.runing = False
		self.end_lock = threading.Lock()
		self.end = False
		self.surrender = "None"
		self.surrender_lock = threading.Lock()
		self.winner = "None"
		
	def wait_start(self):
		print("Waiting for game instance " + self.game_id + " to start")
		while True:
			with self.start_lock:
				if self.runing == True:
					break
			with self.end_lock:
				if self.end == True:
					break
			time.sleep(1/60)

	def start_game(self):
		with self.start_lock:
			if self.runing == True:
				print("Game instance " + self.game_id + "is already runing, this function returns without doing anything")
			else:
				print("Starting game instance " + self.game_id)
				self.runing = True

	def run(self) -> None:
		self.wait_start()
		while True:
			with self.end_lock:
				if self.end == True:
					break
			self.frame = self.get_next_frame()
			self.send_frame()
			if self.frame.end == True:
				break;
			time.sleep(self.frame_rate)
			self.check_pause()
			if self.check_surrender() == True:
				break
		self.send_end_state(self.frame)
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			"type": "end.game"
		})
		print("End of run function for thread " + self.game_id)
		
	def receive_movement(self, player : str, direction : str):
		with self.start_lock:
			if self.runing == False:
				return
		try:
			with self.movement_lock:
				if player == "player_1":
					self.frame.player_1.movement = direction
				if player == "player_2":
					self.frame.player_2.movement = direction
		except ValueError:
			print("Invalid movement received from " + player)
   
	def receive_pause(self, action : str):
		with self.start_lock:
			if action == "start" and self.runing == False:
				print("Unpausing game instance " + str(self.game_id))
				self.runing = True
			elif action == "stop" and self.runing == True:
				print("Pausing game instance " + str(self.game_id))
				self.runing = False
	
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
			self.winner = "player_1"
		elif frame.player_2.score == Const["MAX_SCORE"].value:
			frame.end = True
			self.winner = "player_2"
		return frame

	def check_pause(self) -> None :
		while True:
			with self.start_lock:
				if self.runing == True:
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
			print("End function called in thread" + self.game_id)
   
	def send_frame(self) -> None:
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			"type": "send.frame",
			"Frame": self.frame.render(),
		})
		
	def send_config(self) -> None:
		conf = self.config.render()
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			"type": "send.config",
			"Config": conf,
		})
  
	def send_end_state(self, last_frame) -> None:
		data = {"winner" : self.winner,
		  "score_1" : last_frame.player_1.score,
		  "score_2" : last_frame.player_2.score,
		}
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			"type" : "send.end.state",
			"End_state" : data,
		})