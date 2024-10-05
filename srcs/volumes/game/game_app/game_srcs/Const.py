from enum import Enum
from .Coord import Coordinates, Direction

class Const(Enum):
    BOARD_LEN = 1000
    BOARD_HEIGHT = 500
    DIMENSION = Coordinates(BOARD_LEN,BOARD_HEIGHT)
    CENTER = Coordinates(int(BOARD_LEN / 2), int(BOARD_HEIGHT / 2))
    BALL_DIR = Direction(1, 5)
    PAD_LEN = int(BOARD_LEN * 5 / 100 )
    PAD_HEIGHT = int(BOARD_HEIGHT * 30 / 100)
    BALL_SIZE = int((BOARD_HEIGHT + BOARD_LEN) * 2 / 100)
    MAX_SCORE = 3