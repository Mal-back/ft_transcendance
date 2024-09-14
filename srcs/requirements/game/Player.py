from Const import Const
from Pad import Pad

class Player():
	def __init__(self, number : int, name : str, score : int = 0, pad : Pad = Pad(0, 0)):
		self.pad = pad
		self.score = int(score)
		self.number = int(number)
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