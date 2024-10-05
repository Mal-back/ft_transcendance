from attrs import frozen, define, field, validators
from typing import Tuple

@frozen
class Direction:
    dx: int = field(validator=[validators.instance_of(int),])
    dy: int = field(validator=validators.instance_of(int))
    
@frozen()
class Coordinates:
    x: int = field(validator=validators.instance_of(int))
    y: int = field(validator=validators.instance_of(int))
    
    def move(self, direction : Direction) -> 'Coordinates':
        return Coordinates(self.x + direction.dx, self.y + direction.dy)
    
    def render(self) -> Tuple[int, int]:
        return (self.x, self.y)