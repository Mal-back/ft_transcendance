from .Const import Const

class Ball():
	def __init__(self, pos_x : int = 0, pos_y : int = 0, dx : int = -10, dy : int = 10):
		self.x = int(pos_x)
		self.y = int(pos_y)
		self.dx = int(dx)
		self.dy = int(dy)
	
	@property
	def x(self):
		return self._x
	
	@x.setter
	def x(self, value : int):
		if value >= Const.MAX_X.value:
			self._x = Const.MAX_X.value			
		elif value <= Const.MIN_X.value:
			self._x = Const.MIN_X.value
		else:
			self._x = value
	
	@property
	def y(self):
		return self._y
	
	@y.setter
	def y(self, value : int):
		if value >= Const.MAX_Y.value:
			value = Const.MAX_Y.value
			self.hitWall()
		elif value <= Const.MIN_Y.value:
			value = Const.MIN_Y.value
			self.hitWall()
		self._y = value
  
	@property
	def dx(self):
		return self._dx

	@dx.setter
	def dx(self, value : int):
		self._dx = value
  
	@property
	def dy(self):
		return self._dy

	@dy.setter
	def dy(self, value : int):
		self._dy = value

	def move(self):
		self.x += self.dx
		self.y += self.dy
  
	def hitWall(self):
		self.dy *= -1
  
	def hitPad(self):
		self.dx *= -1