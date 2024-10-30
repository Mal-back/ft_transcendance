from .Const import Const
from .Coord import Coordinates
from attrs import define, field, validators
from .Ball import Ball

@define
class Board:
    ball: Ball = field(validator=validators.instance_of(Ball), default=Ball())
    dimension : Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["DIMENSION"].value)
    
    def render(self) -> dict:
        return { "Ball" : self.ball.render(),
                "Dimensions" : self.dimension.render(),
        }