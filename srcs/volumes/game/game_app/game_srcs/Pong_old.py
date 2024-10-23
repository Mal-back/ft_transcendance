# coding: utf-8
from .Const import Const
import time
import copy
import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging
from .Coord import Coordinates, Direction
log = logging.getLogger(__name__)
from attrs import define, field, validators
from .Math import CollisionCircleSegment, ImpactProjection, Circle, GetBounceDir, GetNormal

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
        return { "username": self.username,
            "position": self.top_left().render(),
            "score": self.score,
        }
    
    def top_left(self) -> Coordinates:
        return Coordinates(self.position.x - self.len, self.position.y + self.height)

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

    def correct_direction(self) -> Direction:
        new_dy = self.direction.dy
        if self.top() + self.direction.dy > Const["BOARD_HEIGHT"].value:
            new_dy = Const["BOARD_HEIGHT"].value - self.top()
        elif self.bot() + self.direction.dy < 0:
            new_dy = -self.bot()
        return Direction(self.direction.dx, new_dy)

    def reset_direction(self) -> None:
        self.direction = Direction(0, 0)
        self.movement = "NONE"
        
    def read_movement(self) -> Direction:
        if self.movement == "UP":
            return Direction(0, self.speed)
        elif self.movement == "DOWN":
            return Direction(0, -self.speed)
        else:
            return self.direction
    
    def move(self) -> None:
        self.direction = self.read_movement()
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
        super().__init__(daemon=True)
        self.config = copy.deepcopy(Config())
        self.game_id = game_id
        self.channel_layer = get_channel_layer()
        self.end_lock = threading.Lock()
        self.end = False
        self.frame = copy.deepcopy(Frame())
        self.frame_rate = 1 / 60
        self.movement_lock = threading.Lock()
        self.start_lock = threading.Lock()
        self.begin = False
        
    def wait_start(self):
        print("Waiting for game instance " + self.game_id + " to start")
        while True:
            with self.start_lock:
                if self.begin == True:
                    break
            time.sleep(1/60)

    def start_game(self):
        print("Starting game instance " + self.game_id)
        with self.start_lock:
            self.begin = True

    def run(self) -> None:
        self.send_config()
        self.wait_start()
        while True:
            print("Thread game id = " + str(self.game_id) + " / score = " + str(self.frame.player_1.score))
            self.frame = self.get_next_frame()
            self.send_frame()
            if self.frame.end == True:
                break;
            with self.end_lock:
                if self.end == True:
                    break
            time.sleep(self.frame_rate)
        async_to_sync(self.channel_layer.group_send)(self.game_id, {
            "type": "end.game"
        })
        print("End of run function for thread " + self.game_id)
        
    def receive_movement(self, player : str, direction : str):
        try:
            with self.movement_lock:
                if player == "player_1":
                    self.frame.player_1.movement = direction
                if player == "player_2":
                    self.frame.player_2.movement = direction
        except ValueError:
            print("Invalid movement received from " + player)
                     
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
        with self.movement_lock:
            new_frame = self.move_players(new_frame)
        new_frame = self.move_ball(new_frame)
        return new_frame
 
    def end_thread(self) -> None:
        with self.end_lock:
            self.end = True
            print("End function called in thread" + self.game_id)
   
    def send_frame(self) -> None:
        async_to_sync(self.channel_layer.group_send)(self.game_id, {
            "type": "send.frame",
            "Frame": self.frame.render(),
        })
        
    def send_config(self) -> None:
        conf = {"Dimensions": self.config.render(),
            "player_1" : self.frame.player_1.top_left().render(),
            "player_2" : self.frame.player_2.top_left().render(),
            "ball": self.frame.board.ball.position.render(),}
        async_to_sync(self.channel_layer.group_send)(self.game_id, {
            "type": "send.config",
            "Config": conf,
        })       