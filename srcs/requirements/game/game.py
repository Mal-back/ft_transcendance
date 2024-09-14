# coding: utf-8

from enum import Enum
import turtle
import time

class Const(Enum):
	MAX_X = 300
	MIN_X = -300
	MAX_Y = 200
	MIN_Y = -200
	MAX_PLAYER = 2
	MAX_SCORE = 10
	PAD_wIDTH = 30
	PAD_HEIGHT = 80
	PAD_DISTANCE = 60

class Pad():
	def __init__(self, pos_x : int, pos_y : int):
		self.x = int(pos_x)
		self.y = int(pos_y)
	
	@property
	def x(self):
		return self._x
	
	@x.setter
	def x(self, value : int):
		if not value in range(Const.MIN_X.value, Const.MAX_X.value):
			raise ValueError("x Pad out of range")
		self._x = int(value)
	
	@property
	def y(self):
		return self._y
	
	@y.setter
	def y(self, value : int):
		if not value in range(Const.MIN_Y.value, Const.MAX_Y.value):
			raise ValueError("y Pad out of range")
		self._y = int(value)

class Ball():
	def __init__(self, pos_x : int, pos_y : int):
		self.x = int(pos_x)
		self.y = int(pos_y)
	
	@property
	def x(self):
		return self._x
	
	@x.setter
	def x(self, value):
		if not value in range(Const.MIN_X.value, Const.MAX_X.value):
			raise ValueError("x Ball out of range")
		self._x = value
	
	@property
	def y(self):
		return self._y
	
	@y.setter
	def y(self, value):
		if not value in range(Const.MIN_Y.value, Const.MAX_Y.value):
			raise ValueError("y Ball out of range")
		self._y = value

class Player():
	def __init__(self, number : int, name : str, score : int = 0, pad : Pad = Pad(0, 0)):
		self.pad = pad
		self.score = int(score)
		print(type(score), type(self.score))
		self.number = number
		self.name = str(name)
	
	@property
	def number(self):
		return self._number
	
	@number.setter
	def number(self, value : int):
		if not value in range(1, Const.MAX_PLAYER.value + 1):
			raise ValueError("exced max player value")
		self._number = value

	@property
	def name(self):
		return self._name
	
	@name.setter
	def name(self, value : str):
		self._name = str(value)

	@property
	def score(self):
		return self._score

	@score.setter
	def score(self, value : int):
		self._score = value
  
	@property
	def pad(self):
		return self._pad

	@pad.setter
	def pad(self, newPad : Pad):
		self._pad = newPad
  
class Game():
    def __init__(self, player1 : Player, player2 : Player):
        self.player1 = player1
        self.player2 = player2
        self.ball = Ball(0, "salut")
        
    @property
    def player1(self):
        return self._player1
    
    @player1.setter
    def player1(self, newPlayer1 : Player):
        self._player1 = newPlayer1

    @property
    def player2(self):
        return self._player2
    
    @player2.setter
    def player2(self, newPlayer2 : Player):
        self._player2 = newPlayer2
        
    @property
    def ball(self):
        return self._ball
    
    @ball.setter
    def ball(self, newBall : Ball):
        self._ball = newBall
    
    def printInfo(self):
        print("Player 1 :\n\tName : " + self.player1.name
              + "\n\tScore : " + str(self.player1.score)
              + "\n\tX Pad : " + str(self.player1.pad.x)
              + "\n\tY Pad : " + str(self.player1.pad.y))
        print("Player 2 :\n\tName : " + self.player2.name
              + "\n\tScore : " + str(self.player2.score)
              + "\n\tX Pad : " + str(self.player2.pad.x)
              + "\n\tY Pad : " + str(self.player2.pad.y))
        print("Ball : \n\tX Ball : " + str(self.ball.x)
              + "\n\tY Ball : " + str(self.ball.y))
        
    def resetBallPosition(self):
        self.ball.x = 0
        self.ball.y = 0
        
    def start(self):
        while True:
            continue

bob = Player(1, "Bob", 0, Pad(Const.MIN_X.value + Const.PAD_DISTANCE.value, 0))
patrick = Player(2, "Patrick", 0, Pad(Const.MAX_X.value - Const.PAD_DISTANCE.value, 0))
game = Game(bob, patrick)
game.printInfo()

ball = turtle.Turtle()
ball.dx = -1
print(ball.dx)

