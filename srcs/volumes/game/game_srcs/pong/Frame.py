from .Const import Const
from attrs import define, field, validators
from .Player import Player
from .Board import Board
from .Coord import Coordinates

@define
class Frame:
    board: Board = field(validator=validators.instance_of(Board), default=Board())
    player_1 : Player = field(validator=validators.instance_of(Player), default=Player(username="player_1", position=Coordinates(Const["X_PLAYER_1"].value, Const["Y_PLAYER"].value)))
    player_2 : Player = field(validator=validators.instance_of(Player), default=Player(username="player_2", position=Coordinates(Const["X_PLAYER_2"].value, Const["Y_PLAYER"].value)))
    reset : bool = field(validator=validators.instance_of(bool), default=False)
    end : bool = field(validator=validators.instance_of(bool), default=False)


    def render(self) -> dict:
        return { "ball" : self.board.ball.render(),
                "player_1" : self.player_1.render(),
                "player_2" : self.player_2.render(),    
        }