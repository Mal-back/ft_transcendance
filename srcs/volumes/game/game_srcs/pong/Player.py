from .Const import Const
from .Coord import Coordinates, Direction
from attrs import define, field, validators

allowed_movement = ["UP", "DOWN", "NONE"]

@define
class Player:
    username: str = field(validator=validators.instance_of(str), default="default_name")
    position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Coordinates(50,50))
    direction: Direction = field(validator=validators.instance_of(Direction), default=Direction(0,0))
    score: int = field(validator=validators.instance_of(int), default=0)
    len: int = field(validator=validators.instance_of(int), default=Const["PAD_LEN"].value)
    height: int = field(validator=validators.instance_of(int), default=Const["PAD_HEIGHT"].value)
    speed: int = field(validator=validators.instance_of(int), default=Const["PAD_SPEED"].value)
    movement: str = field(validator=[validators.instance_of(str), validators.in_(allowed_movement),], default="NONE")


    def render(self) -> dict:
        return { "position": self.top_left().render(),
            "score": self.score,
        }


    def top_left(self) -> Coordinates:
        return Coordinates(self.position.x - self.len, self.position.y - self.height)


    def top(self) -> int:
        return self.position.y - self.height


    def bot(self) -> int:
        return self.position.y + self.height


    def front(self) -> int:
        if self.position.x < Const["CENTER"].value.x:
            return self.position.x + self.len
        else:
            return self.position.x - self.len


    def back(self) -> int:
        if self.position.x < Const["CENTER"].value.x:
            return self.position.x - self.len
        else:
            return self.position.x + self.len


    def correct_direction(self) -> Direction:
        new_dy = self.direction.dy
        if self.bot() + self.direction.dy > Const["BOARD_HEIGHT"].value:
            new_dy = Const["BOARD_HEIGHT"].value - self.bot()
        elif self.top() + self.direction.dy < 0:
            new_dy = -self.top()
        return Direction(self.direction.dx, new_dy)


    def reset_direction(self) -> None:
        self.direction = Direction(0, 0)
        self.movement = "NONE"


    def read_movement(self) -> Direction:
        if self.movement == "UP":
            return Direction(0, -self.speed)
        elif self.movement == "DOWN":
            return Direction(0, +self.speed)
        else:
            return self.direction

    
    def move(self) -> None:
        self.direction = self.read_movement()
        self.direction = self.correct_direction()
        self.position = self.position.move(self.direction)
        self.reset_direction()