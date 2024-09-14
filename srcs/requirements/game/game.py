# coding: utf-8

from enum import Enum

class Const(Enum):
	MAX_X = 500
	MIN_X = 0
	MAX_Y = 250
	MIN_Y = -250
	MAX_PLAYER = 2

class Pad():
	def __init__(self, pos_x : int, pos_y : int):
		self.x = pos_x
		self.y = pos_y
	
	@property
	def x(self):
		return self._x
	
	@x.setter
	def x(self, value):
		if not value in range(Const.MIN_X.value, Const.MAX_X.value):
			raise ValueError("x Pad out of range")
		self._x = value
	
	@property
	def y(self):
		return self._y
	
	@y.setter
	def y(self, value):
		if not value in range(Const.MIN_Y.value, Const.MAX_Y.value):
			raise ValueError("y Pad out of range")
		self._y = value

class Ball():
	def __init__(self, pos_x : int, pos_y : int):
		self.x = pos_x
		self.y = pos_y
	
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
	def __init__(self, number : int, name : str, score : int = 0):
		self.pad = Pad(0, 0)
		self.score = score
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
  
class Game():
    def __init__(self, player1 : Player, player2 : Player):
        self.player1 = player1
        self.player2 = player2
        self.ball = Ball(50, 50)
        
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
        print("Player 1 :\n\tName : " + self.player1.name)


bob = Player(1, "Bob")
patrick = Player(2, "Patrick")
game = Game(bob, patrick)
game.printInfo()

