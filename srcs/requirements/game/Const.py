from enum import Enum

class Const(Enum):
	MAX_X = 300
	MIN_X = -300
	MAX_Y = 200
	MIN_Y = -200
	MAX_PLAYER = 2
	MAX_SCORE = 3
	PAD_WIDTH = 1
	PAD_HEIGHT = 140
	PAD_DISTANCE = 60
	LEFT_PAD_FRONT_X = MIN_X + PAD_DISTANCE + PAD_WIDTH
	RIGHT_PAD_FRONT_X = MAX_X - PAD_DISTANCE - PAD_WIDTH