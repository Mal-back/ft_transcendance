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
from .Math import CollisionCircleSegment, ImpactProjection
		
@define
class Player:
	username: str = field(validator=validators.instance_of(str), default="default_name")
	position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Coordinates(50,50))
	direction: Direction = field(validator=validators.instance_of(Direction), default=Direction(0,-23))
	score: int = field(validator=validators.instance_of(int), default=0)
	len: int = field(validator=validators.instance_of(int), default=Const["PAD_LEN"].value)
	height: int = field(validator=validators.instance_of(int), default=Const["PAD_HEIGHT"].value)
 
	def render(self) -> dict:
		return { "username": self.username,
			"position": self.position.render(),
			"score": self.score,
		}
	
	def top(self) -> int:
		return self.position.y + self.height

	def bot(self) -> int:
		return self.position.y - self.height

	def front(self) -> int:
		if self.position.x < Const["CENTER"].value.x:
			return self.position.x + self.len.x
		else:
			return self.position.x - self.len.x

	def back(self) -> int:
		if self.position.x < Const["CENTER"].value.x:
			return self.position.x - self.len.x
		else:
			return self.position.x + self.len.x     

	def correct_direction(self) -> Direction:
		new_dy = self.direction.dy
		if self.top() + self.direction.dy > Const["BOARD_HEIGHT"].value:
			new_dy = Const["BOARD_HEIGHT"].value - self.top()
		elif self.bot() + self.direction.dy < 0:
			new_dy = -self.bot()
		return Direction(self.direction.dx, new_dy)

	def reset_direction(self) -> None:
		self.direction = Direction(0, 0)
  
	def move(self) -> None:
		self.direction = self.correct_direction()
		self.position = self.position.move(self.direction)
	
@define
class Ball:
	position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["CENTER"].value)
	direction: Direction = field(validator=validators.instance_of(Direction), default=Const["BALL_DIR"].value)
	size: int = field(validator=validators.instance_of(int), default=Const["BALL_SIZE"].value)

	def top(self) -> int:
		return self.position.y + Const["BALL_SIZE"].value

	def bot(self) -> int:
		return self.position.y - Const["BALL_SIZE"].value

	def front(self) -> int:
		if self.direction.x < 0:
			return self.position.x - Const["BALL_SIZE"].value
		else:
			return self.position.x + Const["BALL_SIZE"].value

	def back(self) -> int:
		if self.direction.x < 0:
			return self.position.x + Const["BALL_SIZE"].value
		else:
			return self.position.x - Const["BALL_SIZE"].value		

	def move(self, player : Player) -> None:
		new_pos = Coordinates(self.position.x + self.direction.dx, self.position.y + self.direction.dy)
		if CollisionCircleSegment(Coordinates(player.front(), player.top()), Coordinates(player.front(), player.bot()), Ball(new_pos, size=self.size)):
			impact = ImpactProjection(Coordinates(player.front(), player.top()), Coordinates(player.front(), player.bot()), Ball.position)
			sign_dx = 1 if self.direction.dx > 0 else -1
			new_pos = Coordinates(-sign_dx * self.size + impact.x , impact.y)
			

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
 
	def get_next_frame(self) -> Frame:
		new_frame = self.frame
		new_frame = self.move_players(new_frame)
		# move_ball() ==> besoin des positions joueurs pour connaitre collision
		# 

		return new_frame
 
	def end_thread(self) -> None:
		with self.end_lock:
			self.end = True
			print("End function called")
   
	def send_frame(self) -> None:
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			"type": "send.state",
			"Frame": self.frame.render(),
		})