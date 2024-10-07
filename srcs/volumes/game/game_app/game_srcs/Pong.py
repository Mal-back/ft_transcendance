# coding: utf-8
from .Const import Const
import time
import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging
from .Coord import Coordinates, Direction
log = logging.getLogger(__name__)
from attrs import define, field, validators
		
@define
class Player:
	username: str = field(validator=validators.instance_of(str), default="default_name")
	position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Coordinates(50,50))
	direction: Direction = field(validator=validators.instance_of(Direction), default=Direction(0,1))
	score: int = field(validator=validators.instance_of(int), default=0)
	len: int = field(validator=validators.instance_of(int), default=Const["PAD_LEN"].value)
	height: int = field(validator=validators.instance_of(int), default=Const["PAD_HEIGHT"].value)
 
	def render(self) -> dict:
		return { "username": self.username,
			"position": self.position.render(),
			"score": self.score,
		}
	
	def top(self) -> int:
		return self.position.y + Const["PAD_HEIGHT"].value

	def bot(self) -> int:
		return self.position.y - Const["PAD_HEIGHT"].value

	def left(self) -> int:
		return self.position.x - Const["PAD_LEN"].value

	def right(self)
		
 	
	def reset_direction(self) -> None:
		self.direction = Direction(0, 0)
		
	def correct_direction(self) -> None:
		bot = self.position.y - Const["PAD_LEN"] / 2
		top = self.position.y + Const["PAD_LEN"] / 2
		if self.direction.dy + bot < 0:
			self.direction.dy = -bo

  
	def move(self) -> None:
		self.correct_direction()
		self.position = self.position.move(self.direction)
		self.reset_direction()
	
@define
class Ball:
	position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["CENTER"].value)
	direction: Direction = field(validator=validators.instance_of(Direction), default=Const["BALL_DIR"].value)
	size: int = field(validator=validators.instance_of(int), default=Const["BALL_SIZE"].value)
	
	def correct_direction(self) -> None:
		if self.direction.dy + self.position.y < 0:
			self.direction.dy = self.position.y
		elif self.direction.dy + self.position.y > Const["BOARD_HEIGHT"].value:
			self.direction.dy = Const["BOARD_HEIGHT"].value - self.position.y
 
	def move(self) -> None:
		self.position = self.position.move(self.direction)
	
	def reset_position(self) -> None:
		self.position = Const["CENTER"].value
	
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
	def render(self) -> dict:
		return { "Board" : self.board.render(),
				"Player 1" : self.player_1.render(),
				"Player 2" : self.player_2.render(),    
		}
	
class LocalEngine(threading.Thread):
	def __init__(self, game_id, **kwargs):
		super(LocalEngine, self).__init__(daemon=True, name=game_id, **kwargs)
		self.game_id = game_id
		self.channel_layer = get_channel_layer()
		self.end_lock = threading.Lock()
		self.end = False
		self.frame = Frame()
		self.state_rate = 1 / 60
		
	def run(self) -> None:
		print("starting game instance for game " + self.game_id)
		while True:
			self.frame = self.get_next_frame()
			self.send_frame()
			with self.end_lock:
				if self.end == True:
					break
			time.sleep(self.state_rate)
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			"type": "end.game"
		})

	def correct_direction(self, frame : Frame) -> Frame:
		return
	
	def perform_movement(self, frame : Frame) -> Frame:
		frame.player_1.move()
		frame.player_2.move()
		frame.board.ball.move()
		return frame
 
	def get_next_frame(self) -> Frame:
		new_frame = self.frame
		return new_frame
 
	def end_thread(self) -> None:
		with self.end_lock:
			self.end = True
			print("End function called")
   
	def send_frame(self) -> None:
		async_to_sync(self.channel_layer.group_send(self.game_id, {
			"type": "send.frame",
			"Frame": self.frame.render(),
		}))