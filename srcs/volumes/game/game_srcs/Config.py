from .Const import Const
from .Coord import Coordinates
from attrs import define, field, validators

@define
class Config:
    player_1_pos : Coordinates = field(validator=validators.instance_of(Coordinates))
    player_2_pos : Coordinates = field(validator=validators.instance_of(Coordinates))
    player_1_username : str = field(validator=validators.instance_of(str))
    player_2_username : str = field(validator=validators.instance_of(str))
    ball_pos : Coordinates = field(validator=validators.instance_of(Coordinates))
    board_len : int = field(validator=validators.instance_of(int), default=Const["BOARD_LEN"].value)
    board_height : int = field(validator=validators.instance_of(int), default=Const["BOARD_HEIGHT"].value)
    ball_size : int = field(validator=validators.instance_of(int), default=Const["BALL_SIZE"].value)
    pad_len : int = field(validator=validators.instance_of(int), default=Const["PAD_LEN"].value)
    pad_height : int = field(validator=validators.instance_of(int), default=Const["PAD_HEIGHT"].value)
    pad_offset : int = field(validator=validators.instance_of(int), default=Const["PAD_OFFSET"].value)
    
    def render(self) -> dict:
        return { "board_len" : self.board_len,
                "board_height" : self.board_height,
                "ball_size" : self.ball_size,
                "pad_len" : self.pad_len * 2,
                "pad_height" : self.pad_height * 2,
                "player_1" : {"pos" : self.player_1_pos.render(), "username" : self.player_1_username},
                "player_2" : {"pos" : self.player_2_pos.render(), "username" : self.player_2_username},
                "ball": self.ball_pos.render(),
        }