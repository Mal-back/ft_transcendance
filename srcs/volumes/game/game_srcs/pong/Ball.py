from .Const import Const
from .Coord import Coordinates, Direction
from attrs import define, field, validators
from .Math import CollisionCircleSegment, ImpactProjection, Circle, GetBounceDir, GetNormal
from .Player import Player

@define
class Ball:
    position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["CENTER"].value)
    direction: Direction = field(validator=validators.instance_of(Direction), default=Const["BALL_DIR"].value)
    size: int = field(validator=validators.instance_of(int), default=Const["BALL_SIZE"].value)


    def top(self) -> int:
        return self.position.y - self.size


    def bot(self) -> int:
        return self.position.y + self.size


    def front(self) -> int:
        if self.direction.dx < 0:
            return self.position.x - self.size
        else:
            return self.position.x + self.size


    def back(self) -> int:
        if self.direction.dx < 0:
            return self.position.x + self.size
        else:
            return self.position.x - self.size


    def check_player_collision(self, player : Player) -> bool:
        new_pos = Coordinates(self.position.x + self.direction.dx, self.position.y + self.direction.dy)
        if CollisionCircleSegment(Coordinates(player.front(), player.top()), Coordinates(player.front(), player.bot()), Circle(new_pos, self.size)):
            return True
        else:
            return False


    def handle_player_collision(self, player : Player) -> None:
        impact = ImpactProjection(Coordinates(player.front(), player.top()), Coordinates(player.front(), player.bot()), self.position)
        sign_dx = 1 if self.direction.dx > 0 else -1
        new_pos = Coordinates(-sign_dx * self.size + impact.x , impact.y)
        self.position = new_pos
        self.direction = GetBounceDir(self.direction, GetNormal(Coordinates(player.front(), player.top()), Coordinates(player.front(), player.bot()), self.position))
  
  
    def check_wall_collision(self) -> bool:
        y_wall = 0 if self.direction.dy < 0 else Const["BOARD_HEIGHT"].value
        new_pos = Coordinates(self.position.x + self.direction.dx, self.position.y + self.direction.dy)
        if CollisionCircleSegment(Coordinates(0, y_wall), Coordinates(Const["BOARD_LEN"].value, y_wall), Circle(new_pos, self.size)) == True:
            return True
        else:
            return False


    def handle_wall_collision(self) -> None:
        y_wall = 0 if self.direction.dy < 0 else Const["BOARD_HEIGHT"].value
        impact = ImpactProjection(Coordinates(0, y_wall), Coordinates(Const["BOARD_LEN"].value, y_wall), self.position)
        sign_dy = 1 if self.direction.dy >= 0 else -1
        new_pos = Coordinates(impact.x, -sign_dy * self.size + impact.y)
        self.position = new_pos
        self.direction = GetBounceDir(self.direction, GetNormal(Coordinates(0, y_wall), Coordinates(Const["BOARD_LEN"].value, y_wall), self.position))		


    def move(self, player : Player) -> None:
        if self.check_player_collision(player) == True:
            self.handle_player_collision(player)
        elif self.check_wall_collision() == True:
            self.handle_wall_collision()
        else:
            self.position = self.position.move(self.direction)
    
    
    def reset(self, dir : str = "right") -> None:
        dy = Const["BALL_DIR"].value.dy
        dx = Const["BALL_DIR"].value.dx if dir == "right" else (- Const["BALL_DIR"].value.dx)
        self.position = Const["CENTER"].value
        self.direction = Direction(dx, dy)

    
    def render(self) -> dict:
        return { "position": self.position.render(),
        }
