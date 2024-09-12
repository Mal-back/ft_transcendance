# coding: utf-8

from enum import Enum

class Const(Enum):
	MAX_X = 500
	MIN_X = 0
	MAX_Y = 250
	MIN_Y = -250
	MAX_PLAYER = 2

class Player():
	def __init__(self, number : int, score : int = 0):
		self.pad = Pad(0, 0)
		self.score = score
		self.number = number
	
	@property
	def number(self):
		return self._number
	
	@number.setter
	def number(self, value):
		if not value in range (1, Const.MAX_PLAYER.value):
			raise ValueError("exced max player value")
		self._number = value

	@property
	def score(self):
		return self._score

	@score.setter
	def score(self, value):
		self._score = value

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


leo = Player(1)
print(leo.score)
leo.score += 1
print(leo.score)
