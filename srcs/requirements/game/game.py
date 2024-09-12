# coding: utf-8

from enum import Enum

class Player():

	def __init__(self, number):
		self.number = number

# class Game():


# class Ball():

class CoordLimits(Enum):
	MAX_X = 500
	MIN_X = 0
	MAX_Y = 250
	MIN_Y = -250

class Pad():

	def __init__(self, pos_x : int, pos_y : int):
		if not pos_x in range(CoordLimits.MIN_X.value, CoordLimits.MAX_X.value):
			raise ValueError("x out of range")
		self._x = pos_x
		self._y = pos_y
	
	def get_x(self):
		return self._x
	
	def set_x(self, new_x):
		self._x = new_x
	
	def get_y(self):
		return self._y
	
	def set_y(self, new_y):
		self._y = new_Y
		

myPad = Pad(15, 2)
print(myPad._x)

