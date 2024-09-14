from Const import Const

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