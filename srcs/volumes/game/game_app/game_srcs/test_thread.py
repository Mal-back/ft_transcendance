import threading
import time
from attrs import define, field, validators

@define
class newClass():
    score : int = field(validator=validators.instance_of(int))

class LocalEngine(threading.Thread):
    def __init__(self, game_id, **kwargs):
        super().__init__(daemon=True)
        # self.config = Config()
        self.test = newClass(score=game_id)
        self.game_id = game_id
     	# self.channel_layer = get_channel_layer()
        self.end_lock = threading.Lock()
        self.end = False
        # self.frame = Frame()
        self.state_rate = 1 / 10
        self.movement_lock = threading.Lock()
        self.start_lock = threading.Lock()
        self.begin = False
        self.score = 0
        
    def wait_start(self):
        print("Waiting for game instance " + str(self.game_id) + " to start")
        while True:
            with self.start_lock:
                if self.begin == True:
                    break
            time.sleep(1/60)

    def start_game(self):
        print("Starting game instance " + str(self.game_id))
        with self.start_lock:
            self.begin = True

    def run(self) -> None:
        # self.send_config()
        self.wait_start()
        while True:
            # self.frame = self.get_next_frame()
            print("thread " + str(self.game_id) + " test = " + str(self.test.score))
            # self.send_frame()
            self.score += 1
            if self.score == 20:
                break
            # if self.frame.end == True:
            #     break;
            with self.end_lock:
                if self.end == True:
                    break
            time.sleep(2)
        # async_to_sync(self.channel_layer.group_send)(self.game_id, {
        #     "type": "end.game"
        # })
        print("End of run function for thread " + str(self.game_id))

game_instances = {}
game_instances[500] = LocalEngine(game_id=500)
game_instances[500].start()

game_instances[500].start_game()
game_instances[5005] = LocalEngine(game_id=5005)
game_instances[5005].start()
game_instances[5005].start_game()
print("Waiting for thread to end")
game_instances[500].join()
# game_instances.pop(500)
print("Thread waited !")
game_instances[500] = LocalEngine(game_id=500)
game_instances[500].start()
game_instances[500].start_game()
print("Waiting for thread to end")
game_instances[500].join()
game_instances.pop(500)
print("Thread waited !")
