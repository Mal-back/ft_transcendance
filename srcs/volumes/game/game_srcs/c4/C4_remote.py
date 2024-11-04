from .Board import Board
import threading
import copy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import time 

class C4RemoteEngine(threading.Thread):
    def __init__(self, game_id, player_1_username, player_2_username, **kwargs):
        super().__init__(daemon=True)
        self.board = copy.deepcopy(Board(player_1_username, player_2_username))
        self.conf = self.board.getConfig()
        self.tick = 0
        self.winner = "None"
        self.surrender = "None"
        self.surrender_lock = threading.Lock()
        self.game_id = game_id
        self.player_1_username = player_1_username
        self.player_2_username = player_2_username
        self.channel_layer = get_channel_layer()
        self.end = False
        self.end_lock = threading.Lock()
        self.start_lock= threading.Lock()
        self.runing_player_1 = "stop"
        self.runing_player_2 = "stop"
        self.sleep = 0.01
        self.input_lock = threading.Lock()
        self.input_receive = False
        self.input_player = "None"
        self.input_column = "None"


    def wait_start(self):
        print("Waiting for c4 remote game instance " + self.game_id + " to start | player_1_start = " + self.runing_player_1 + " | player_2_start = " + self.runing_player_2)
        waiting_opponent = 0
        while True:
            with self.start_lock:
                if self.runing_player_1 == "start" and self.runing_player_2 == "start":
                    break
                if self.runing_player_1 == "start" or self.runing_player_2 == "start":
                    if waiting_opponent == 0:
                        self.send_wait_opponent()
                    waiting_opponent += 1
            if waiting_opponent * self.sleep >= 30:
                with self.start_lock:
                    with self.surrender_lock:
                        self.surrender = "player_1" if self.runing_player_1 == "stop" else "player_2"
                break
            time.sleep(self.sleep)
        print("player_1_start = " + self.runing_player_1 + " | player_2_start = " + self.runing_player_2)


    def send_wait_opponent(self):
        try:
            async_to_sync(self.channel_layer.group_send)(self.game_id, {
                "type": "send.wait.opponent",
            })
        except Exception:
            print("Can not send frame to group channel " + self.game_id)


    def start_game(self, player : str):
        with self.start_lock:
            if player == "player_1":
                self.runing_player_1 = "start"
            elif player == "player_2":
                self.runing_player_2 = "start"
    
    def run(self):
        self.wait_start()
        while True:
            self.check_input()
            self.check_winner()
            if self.board.over == 1 or self.check_surrender() == True:
                self.send_end_state()
                break
            time.sleep(self.sleep)
        self.clean_game()
        self.join_thread()
        print("End of run function for thread " + self.game_id)
  
  
    def join_thread(self):
        try:
            async_to_sync(self.channel_layer.send)("pong_remote_engine", {
                "type": "join.thread",
                "game_id": self.game_id
            })
        except:
            print("Can not send join thread to pong_remote_engine from thread num " + self.game_id)
   
   
    def clean_game(self):
        try:
            async_to_sync(self.channel_layer.send)("pong_remote_engine", {
                "type": "clean.game",
                "game_id": self.game_id
            })
        except:
            print("Can not send clean game to pong_remote_engine from thread num " + self.game_id)
   
   
    def check_winner(self):
        if (winner:= self.board.winning_board()) != None:
            self.winner = winner
            self.board.over = 1


    def check_surrender(self) -> bool:
        with self.surrender_lock:
            if self.surrender == "player_1" or self.surrender == "player_2":
                self.winner = self.player_1_username if self.surrender == "player_2" else self.player_2_username
                self.looser = self.player_1_username if self.surrender == "player_1" else self.player_2_username
                return True
        return False


    def check_input(self):
        with self.input_lock:
            if self.input_receive == True:
                self.input_receive = False
                self.board.put_disk(self.input_column, self.input_player)
        if self.tick != self.board.tick:
            self.board.tick = 0
            self.send_frame()
   
   
    def send_config(self, channel_name : str) -> None:
        try:
            async_to_sync(self.channel_layer.send)(channel_name, {
                "type": "send.config",
                "Config": self.conf,
            })
            self.send_frame_channel(channel_name)
        except Exception:
            print("Can not send config to group channel " + self.game_id)
 
 
    def send_end_state(self) -> None:
        looser = self.player_1_username if self.winner == self.player_2_username else self.player_2_username
        data = {"game" : "c4",
            "winner" : self.winner,
          "looser" : looser,
          "winner_points" : 1,
          "looser_points" : 0,
        }
        try:
            async_to_sync(self.channel_layer.group_send)(self.game_id, {
                "type" : "send.end.state",
                "End_state" : data,
            })
        except Exception:
            print("Can not send end state to group channel " + self.game_id)
        try:
            async_to_sync(self.channel_layer.send)("c4_remote_engine", {
                "type" : "send.result",
                "End_state" : data,
                "game_id" : self.game_id,
            })
        except Exception:
            print("Can not send end state to group channel " + self.game_id)

    def send_frame_channel(self, channel : str):
        try:
            async_to_sync(self.channel_layer.send)(channel, {
                "type": "send.frame",
                "Frame": self.board.returnBoardState(),
            })
        except Exception:
             print("Can not send result to C4RemoteGameConsumer for game " + self.game_id)


    def send_frame(self):
        try:
            async_to_sync(self.channel_layer.group_send)(self.game_id, {
                "type": "send.frame",
                "Frame": self.board.returnBoardState(),
            })
        except Exception:
            print("Can not send frame to group channel " + self.game_id)


    def receive_input(self, player : str, column : str):
        username = self.player_1_username if player == "player_1" else self.player_2_username
        with self.input_lock:
            try:
                self.input_column = int(column)
                self.input_receive = True
                self.input_player = username
            except Exception:
                return

    def receive_surrend(self, surrender : str) -> None:
        with self.surrender_lock:
            if (surrender == "player_1" or surrender == "player_2") and self.surrender == "None":
                self.surrender = surrender   