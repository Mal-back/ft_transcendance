# coding: utf-8
from .Const import Const
import time
import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging
from .Coord import Coordinates, Direction
log = logging.getLogger(__name__)
from attrs import define, field, validators
from .Math import CollisionCircleSegment, ImpactProjection, Circle, GetBounceDir, GetNormal
        
@define
class Player:
    username: str = field(validator=validators.instance_of(str), default="default_name")
    position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Coordinates(50,50))
    direction: Direction = field(validator=validators.instance_of(Direction), default=Direction(0,0))
    score: int = field(validator=validators.instance_of(int), default=0)
    len: int = field(validator=validators.instance_of(int), default=Const["PAD_LEN"].value)
    height: int = field(validator=validators.instance_of(int), default=Const["PAD_HEIGHT"].value)
    speed: int = field(validator=validators.instance_of(int), default=Const["PAD_SPEED"].value)
 
    def render(self) -> dict:
        return { "username": self.username,
            "position": self.position.render(),
            "top": self.top(),
              "bot": self.bot(),
              "front": self.front(),
              "back": self.back(),
            "score": self.score,
        }
    
    def top(self) -> int:
        return self.position.y + self.height

    def bot(self) -> int:
        return self.position.y - self.height

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
        
    def go_up(self) -> None:
        self.direction = Direction(0, self.speed)
    
    def go_down(self) -> None:
        self.direction = Direction(0, -self.speed)

    def correct_direction(self) -> Direction:
        new_dy = self.direction.dy
        if self.top() + self.direction.dy > Const["BOARD_HEIGHT"].value:
            new_dy = Const["BOARD_HEIGHT"].value - self.top()
        elif self.bot() + self.direction.dy < 0:
            new_dy = -self.bot()
        return Direction(self.direction.dx, new_dy)

    def reset_direction(self) -> None:
        self.direction = Direction(0, 0)
  
    def move(self) -> None:
        self.direction = self.correct_direction()
        self.position = self.position.move(self.direction)
    
@define
class Ball:
    position: Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["CENTER"].value)
    direction: Direction = field(validator=validators.instance_of(Direction), default=Const["BALL_DIR"].value)
    size: int = field(validator=validators.instance_of(int), default=Const["BALL_SIZE"].value)

    def top(self) -> int:
        return self.position.y + self.size

    def bot(self) -> int:
        return self.position.y - self.size

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
        sign_dy = 1 if self.direction.dy > 0 else -1
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
    
    def reset(self) -> None:
        self.position = Const["CENTER"].value
        self.direction = Const["BALL_DIR"].value
    
    def render(self) -> dict:
        return { "position": self.position.render(),
          "top": self.top(),
          "bot": self.bot(),
          "front": self.front(),
          "back": self.back(),
        }
    
@define
class Board:
    ball: Ball = field(validator=validators.instance_of(Ball), default=Ball())
    dimension : Coordinates = field(validator=validators.instance_of(Coordinates), default=Const["DIMENSION"].value)
    
    def render(self) -> dict:
        return { "Ball" : self.ball.render(),
                "Dimensions" : self.dimension.render(),
        }
    
@define
class Frame:
    board: Board = field(validator=validators.instance_of(Board), default=Board())
    player_1 : Player = field(validator=validators.instance_of(Player), default=Player(username="player_1", position=Coordinates(Const["X_PLAYER_1"].value, Const["Y_PLAYER"].value)))
    player_2 : Player = field(validator=validators.instance_of(Player), default=Player(username="player_2", position=Coordinates(Const["X_PLAYER_2"].value, Const["Y_PLAYER"].value)))
    
    reset : bool = False
    end : bool = False
 
    def render(self) -> dict:
        return { "Board" : self.board.render(),
                "Player 1" : self.player_1.render(),
                "Player 2" : self.player_2.render(),    
        }
        
@define
class Config:
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
                "pad_len" : self.pad_len,
                "pad_height" : self.pad_height,
                "pad_offset" : self.pad_offset,
        }
    
    
class LocalEngine(threading.Thread):
    def __init__(self, game_id, **kwargs):
        super(LocalEngine, self).__init__(daemon=True, name=game_id, **kwargs)
        self.config = Config()
        self.game_id = game_id
        self.channel_layer = get_channel_layer()
        self.end_lock = threading.Lock()
        self.end = False
        self.frame = Frame()
        self.state_rate = 1 / 60
        self.frame_lock = threading.Lock()
        
    def run(self) -> None:
        print("starting game instance for game " + self.game_id)
        self.send_config()
        while True:
            self.frame = self.get_next_frame()
            with self.frame_lock:
                self.send_frame()
            if self.frame.end == True:
                break;
            with self.end_lock:
                if self.end == True:
                    break
            time.sleep(self.state_rate)
        async_to_sync(self.channel_layer.group_send)(self.game_id, {
            "type": "end.game"
        })
        
    def receive_movement(self, player : str, movement : str):
        with self.frame_lock:
            if player == "player_1":
                if movement == "UP":
                    print("Movement up for player 1")
                    self.frame.player_1.go_up()
                elif movement == "DOWN":
                    print("Movement down for player 1")
                    self.frame.player_1.go_down()
            if player == "player_2":
                if movement == "UP":
                    print("Movement up for player 2")
                    self.frame.player_2.go_up()
                elif movement == "DOWN":
                    print("Movement down for player 2")
                    self.frame.player_2.go_down()
                     
    def move_players(self, frame : Frame) -> Frame:
        frame.player_1.move()
        frame.player_2.move()
        return frame

    def move_ball(self, frame : Frame) -> Frame:
        if frame.board.ball.direction.dx < 0:
            frame.board.ball.move(frame.player_1)
        else:
            frame.board.ball.move(frame.player_2)
        return frame
 
    def check_goal(self, frame : Frame) -> Frame:
        if frame.board.ball.position.x <= 0:
            frame.player_2.score += 1
            frame.board.ball.reset()
            frame.reset = True
      
        elif frame.board.ball.position.x >= Const["BOARD_LEN"].value:
            frame.player_1.score += 1
            frame.board.ball.reset()
            frame.reset = True
        
        if frame.player_1.score == Const["MAX_SCORE"].value or frame.player_2.score == Const["MAX_SCORE"].value:
            frame.end = True
        return frame

    def get_next_frame(self) -> Frame:
        new_frame = self.frame
        new_frame = self.check_goal(new_frame)
        if new_frame.reset == True:
            new_frame.reset = False
            return new_frame
        new_frame = self.move_players(new_frame)
        new_frame = self.move_ball(new_frame)
        return new_frame
 
    def end_thread(self) -> None:
        with self.end_lock:
            self.end = True
            print("End function called")
   
    def send_frame(self) -> None:
        async_to_sync(self.channel_layer.group_send)(self.game_id, {
            "type": "send.state",
            "Frame": self.frame.render(),
        })
        
    def send_config(self) -> None:
        async_to_sync(self.channel_layer.group_send)(self.game_id, {
            "type": "send.config",
            "Config": self.config.render(),
        })       