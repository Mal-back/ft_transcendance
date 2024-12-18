from .Board import Board
import threading
import copy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import time 

class C4LocalEngine(threading.Thread):
    def __init__(self, game_id, **kwargs):
        super().__init__(daemon=True)
        self.board = copy.deepcopy(Board("player_1", "player_2"))
        self.conf = self.board.getConfig()
        self.tick = 0
        self.winner = "None"
        self.surrender = "None"
        self.surrender_lock = threading.Lock()
        self.game_id = game_id
        self.channel_layer = get_channel_layer()
        self.end = False
        self.end_lock = threading.Lock()
        self.start_lock= threading.Lock()
        self.running = False
        self.sleep = 1/60
        self.input_lock = threading.Lock()
        self.input_receive = False
        self.input_player = "None"
        self.input_column = "None"


    def wait_start(self):
        print("C4LocalEngine : Waiting for game instance " + self.game_id + " to start")
        while True:
            with self.start_lock:
                if self.running == True:
                    break
            with self.end_lock:
                if self.end == True:
                    break
            time.sleep(self.sleep)
   
   
    def start_game(self):
        with self.start_lock:
            if self.running == False:
                print("C4LocalEngine : starting game instance " + self.game_id)
                self.running = True


    def run(self):
        self.wait_start()
        print("C4LocalEngine : Starting game instance " + self.game_id)
        while True:
            with self.end_lock:
                if self.end == True:
                    break
            self.check_input()
            self.check_winner()
            if self.board.over == 1 or self.check_surrender() == True:
                self.send_end_state()
                break
            self.check_full()
            time.sleep(self.sleep)
        self.join_thread()
        print("C4LocalEngine : End of run function for thread " + self.game_id)


    def join_thread(self) -> None:
        while True:
            try:
                async_to_sync(self.channel_layer.send)("c4_local_engine", {
                    "type": "join.thread",
                    "game_id": self.game_id
                })
                return
            except:
                print("C4LocalEngine : Can not send join thread to C4LocalGameConsumer from thread num " + self.game_id)
            time.sleep(0.5)


    def check_full(self) -> None:
        if self.board.board_is_full():
            self.board.flush_board()
            self.send_frame()

    
    def check_winner(self):
        if (winner:= self.board.winning_board()) != None:
            self.winner = winner
            self.board.over = 1


    def check_input(self):
        with self.input_lock:
            if self.input_receive == True:
                self.input_receive = False
                self.board.put_disk(self.input_column, self.input_player)
        if self.tick != self.board.tick:
            self.board.tick = 0
            self.send_frame()	


    def end_thread(self) -> None:
        with self.end_lock:
            self.end = True
   
   
    def send_config(self) -> None:
        try:
            async_to_sync(self.channel_layer.group_send)(self.game_id, {
                "type": "send.config",
                "Config": self.conf,
            })
        except Exception:
            print("C4LocalEngine : Can not send config to group channel " + self.game_id)
 
 
    def send_end_state(self) -> None:
        looser = "player_1" if self.winner == "player_2" else "player_2"
        data = {"winner" : self.winner,
          "looser" : looser,
        }
        while True:
            try:
                async_to_sync(self.channel_layer.group_send)(self.game_id, {
                    "type" : "send.end.state",
                    "End_state" : data,
                })
                return
            except Exception:
                print("C4LocalEngine : Can not send end state to group channel " + self.game_id)
            time.sleep(0.5)
            

    def send_frame(self):
        try:
            async_to_sync(self.channel_layer.group_send)(self.game_id, {
                "type": "send.frame",
                "Frame": self.board.returnBoardState(),
            })
        except Exception:
            print("C4LocalEngine : Can not send frame to group channel " + self.game_id)


    def receive_input(self, player : str, column : str):
        with self.input_lock:
            try:
                self.input_column = int(column)
                self.input_receive = True
                self.input_player = player
            except Exception:
                return


    def receive_surrend(self, surrender : str) -> None:
        with self.surrender_lock:
            if (surrender == "player_1" or surrender == "player_2") and self.surrender == "None":
                self.surrender = surrender   
   
   
    def check_surrender(self) -> bool:
        with self.surrender_lock:
            if self.surrender == "player_1" or self.surrender == "player_2":
                self.winner = "player_1" if self.surrender == "player_2" else "player_2"
                return True
        return False
            