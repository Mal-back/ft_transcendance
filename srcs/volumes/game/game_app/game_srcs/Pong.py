# coding: utf-8
from .Const import Const
# from .Pad import Pad
# from .Player import Player
# from .Ball import Ball
import time
import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging
from .Coord import Coordinates, Direction

log = logging.getLogger(__name__)
  
# class Pong():
# 	def __init__(self, player1 : Player, player2 : Player):
# 		self.player1 = player1
# 		self.player2 = player2
# 		self.ball = Ball(0, 0)
        
# 	@property
# 	def player1(self):
# 		return self._player1
    
# 	@player1.setter
# 	def player1(self, newPlayer1 : Player):
# 		self._player1 = newPlayer1

# 	@property
# 	def player2(self):
# 		return self._player2
    
# 	@player2.setter
# 	def player2(self, newPlayer2 : Player):
# 		self._player2 = newPlayer2
        
# 	@property
# 	def ball(self):
# 		return self._ball
    
# 	@ball.setter
# 	def ball(self, newBall : Ball):
# 		self._ball = newBall
    
# 	def printInfo(self):
# 		print("Player 1 :\n\tName : " + self.player1.name
# 			  + "\n\tScore : " + str(self.player1.score)
# 			  + "\n\tX Pad : " + str(self.player1.pad.x)
# 			  + "\n\tY Pad : " + str(self.player1.pad.y))
# 		print("Player 2 :\n\tName : " + self.player2.name
# 			  + "\n\tScore : " + str(self.player2.score)
# 			  + "\n\tX Pad : " + str(self.player2.pad.x)
# 			  + "\n\tY Pad : " + str(self.player2.pad.y))
# 		print("Ball : \n\tX Ball : " + str(self.ball.x)
# 			  + "\n\tY Ball : " + str(self.ball.y)
# 			  + "\n\tDx Ball : " + str(self.ball.dx)
# 			  + "\n\tDy Ball : " + str(self.ball.dy))
        
    
# 	def resetBallPosition(self):
# 		self.ball.x = 0
# 		self.ball.y = 0
        
# 	def checkPoint(self):
# 		if self.ball.x == Const.MIN_X.value:
# 			self.player2.score += 1
# 			self.resetBallPosition()
# 			return True
# 		elif self.ball.x == Const.MAX_X.value:
# 			self.player1.score += 1
# 			self.resetBallPosition()
# 			return True
# 		if (self.player1.score == Const.MAX_SCORE.value or
# 		self.player2.score == Const.MAX_SCORE.value):
# 			return False
    
# 	def checkHitFrontPad(self):
# 		if (self.ball.x == Const.LEFT_PAD_FRONT_X.value and
# 		self.ball.y in self.player1.pad.frontRange()):
# 			self.ball.hitPad()
# 		elif (self.ball.x == Const.RIGHT_PAD_FRONT_X.value and
# 		self.ball.y in self.player2.pad.frontRange()):
# 			self.ball.hitPad()
            
# 	def checkHitSidePad(self):
# 		if ((self.ball.y == self.player1.pad.y + int(Const.PAD_HEIGHT.value / 2) and self.ball.x in self.player1.pad.sideRange())
# 		or (self.ball.y == self.player1.pad.y - int(Const.PAD_HEIGHT.value / 2) and self.ball.x in self.player1.pad.sideRange())):
# 			self.ball.hitPad()
            
            
# 	def checkCollisions(self):
# 		self.checkHitFrontPad()
# 		# self.checkHitSidePad()
# 		return self.checkPoint()
    
# 	def start(self):
# 		while True:
# 			time.sleep(1/60.0)
# 			self.ball.move()
# 			if self.checkCollisions() == False:
# 				break

from attrs import frozen, define, field, validators
from typing import Tuple
from json import dumps
        
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
        
    def reset_direction(self) -> None:
        self.direction = Direction(0, 0)
        
    def move(self) -> None:
        self.position = self.position.move(self.direction)
        self.reset_direction()
    
@define
class Ball:
    position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["CENTER"].value)
    direction: Direction = field(validator=validators.instance_of(Direction), default=Const["BALL_DIR"].value)
    size: int = field(validator=validators.instance_of(int), default=Const["BALL_SIZE"].value)
    
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
class State:
    board: Board = field(validator=validators.instance_of(Board), default=Board())
    player_1 : Player = field(validator=validators.instance_of(Player), default=Player(username="player_1", position=Coordinates(Const["X_PLAYER_1"].value, Const["Y_PLAYER"].value)))
    player_2 : Player = field(validator=validators.instance_of(Player), default=Player(username="player_2", position=Coordinates(Const["X_PLAYER_2"].value, Const["Y_PLAYER"].value)))
    def render(self) -> dict:
        return { "Board" : self.board.render(),
                "Player 1" : self.player_1.render(),
                "Player 2" : self.player_2.render(),    
        }
        
    def perform_movements(self) -> None:
        self.player_1.move()
        self.player_2.move()
        self.board.ball.move()
        
    def update(self) -> None:
        self.perform_movements()
    
class LocalEngine(threading.Thread):
    def __init__(self, game_id, **kwargs):
        super(LocalEngine, self).__init__(daemon=True, name=game_id, **kwargs)
        self.game_id = game_id
        self.channel_layer = get_channel_layer()
        self.end_lock = threading.Lock()
        self.end = False
        self.state = State()
        self.state_rate = 1 / 60
        
    def run(self) -> None:
        print("starting game instance for game " + self.game_id)
        while True:
            self.state.update()
            async_to_sync(self.channel_layer.group_send)(self.game_id, {
                "type" : "send_state",
                "State" : self.state.render(),
            })
            with self.end_lock:
                if self.end == True:
                    break
                time.sleep(self.state_rate)
        async_to_sync(self.channel_layer.group_send)(self.game_id, {
            "type": "end.game"
        })
    
    def end_thread(self) -> None:
        with self.end_lock:
            self.end = True
            print("End function called")
   
    def send_state(self) -> None:
        return