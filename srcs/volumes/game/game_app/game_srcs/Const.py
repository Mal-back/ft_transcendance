from enum import Enum
from .Coord import Coordinates, Direction

class Const(Enum):
    BOARD_LEN = 500
    BOARD_HEIGHT = 500
    DIMENSION = Coordinates(BOARD_LEN,BOARD_HEIGHT)
    CENTER = Coordinates(int(BOARD_LEN / 2), int(BOARD_HEIGHT / 2))
    BALL_DIR = Direction(3, 0)
    PAD_LEN = int(BOARD_LEN * 5 / 100 / 2)
    PAD_HEIGHT = int(BOARD_HEIGHT * 30 / 100 / 2)
    PAD_SPEED = int(BOARD_HEIGHT / 100)
    BALL_SIZE = int((BOARD_HEIGHT + BOARD_LEN) / 100)
    MAX_SCORE = 3
    PAD_OFFSET = int(BOARD_LEN * 5 / 100)
    X_PLAYER_1 = PAD_OFFSET
    X_PLAYER_2 = BOARD_LEN - PAD_OFFSET
    Y_PLAYER = int(BOARD_HEIGHT / 2)