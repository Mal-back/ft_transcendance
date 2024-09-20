from .Const import Const

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
		if value > Const.MAX_Y.value - int(Const.PAD_HEIGHT.value / 2):
			value = Const.MAX_Y.value - int(Const.PAD_HEIGHT.value / 2)
		elif value < Const.MIN_Y.value + int(Const.PAD_HEIGHT.value / 2):
			value = Const.MIN_Y.value + int(Const.PAD_HEIGHT.value / 2)
		self._y = int(value)
  
	def frontRange(self):
		return range(self.y - int(Const.PAD_HEIGHT.value / 2),
            self.y + int(Const.PAD_HEIGHT.value / 2) + 1)
  
	def sideRange(self):
		return range(self.x - int(Const.PAD_WIDTH.value / 2),
               self.x + int(Const.PAD_WIDTH.value / 2) + 1)

	def moveUp(self):
		self.y += 10
  
	def moveDown(self):
		self.y -= 10