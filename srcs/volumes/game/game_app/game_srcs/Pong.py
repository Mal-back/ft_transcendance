# coding: utf-8

from .Const import Const
from .Pad import Pad
from .Player import Player
from .Ball import Ball
import time
import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging
from attrs import frozen
import attr


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

@frozen
class Coordinates:
	x = attr.ib

class LocalEngine(threading.Thread):
	def __init__(self, game_id, **kwargs):
		super(LocalEngine, self).__init__(daemon=True, name=game_id, **kwargs)
		self.game_id = game_id
		self.channel_layer = get_channel_layer()
		self.end_lock = threading.Lock()
		self.end = False
		
	def run(self) -> None:
		print("starting game instance for game " + self.game_id)
		i = 1
		while (i != 5):
			i = i +1
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type": "channel.msg",
				"msg": "i = " + str(i),
			})
			print("i = " + str(i))
			with self.end_lock:
				if self.end == True:
					return
			time.sleep(3)
		async_to_sync(self.channel_layer.group_send)(self.game_id, {
			"type": "end.game"
		})
	
	def end_thread(self) -> None:
		with self.end_lock:
			self.end = True
			print("End function called")
   
	def send_state(self) -> None:
		return