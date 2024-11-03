import json
import sys

class FullError(Exception):
	"""
	Exception Raised when a column is full
	"""

	def __init__(self, message="This column is full, please try again :))"):
		self.message = message
	
	def __str__(self):
		return self.message
	
class IndexColError(Exception):
	"""
	Exception Raised when the index is out of range
	"""

	def __init__(self, message="Index out of range, please try again! :(("):
		self.message = message
	
 
	def __str__(self):
		return self.message
	
class Win(Exception):
	"""
	Class that holds the winner
	"""

	def __init__(self, player="Anon"):
		self.player = player
		self.message = f'Congratulations {player}! You won :))'
	
 
	def __str__(self):
		return self.message

class Board:
	"""
	This class takes two names(str) to instantiate the object. This is a board of
	a connect four
	"""
	def __init__(self, p1, p2):
		self.row = 6
		self.column = 7
		self.board = [["." for _ in range(self.column)] for _ in range(self.row)]
		self.over=0
		self.player1=p1
		self.player2=p2
		self.currrentPlayer = self.player1
		self.pieces=["X","O"]
		self.turn=0
		self.tie=0
		self.tick = 0
		self.disk = self.pieces[0]
		self.winner=None


	def __str__(self):
		"""Function that returns the printable object as a string"""
		s= f'Row : {self.row}, Columns : {self.column}\n'
		s+=f'{("*" * self.column) * 2 + "*"}' + "\n"
		for i in self.board:
			s+= "|" + "|".join(map(str,i)) + "|\n"
		s+=f'{("*" * self.column) * 2 + "*"}'
		if self.winner is not None:
			return "This is a winning board!\n" + s + "\n" + str(self.winner)
		return s

	def getConfig(self) -> dict:
		config = {
			"starting_player" : self.player1,
			"player_1_username" : self.player1,
			"player_2_username" : self.player2,
			"piece_1":self.pieces[0],
			"piece_2":self.pieces[1],
		}
		return config

	def returnBoardState(self) -> dict:
		"""Returns the current state of the game as a JSON string."""
		state = {
			"board":{
				"line_1" : ' '.join(self.board[0]),
				"line_2" : ' '.join(self.board[1]), 
				"line_3" : ' '.join(self.board[2]), 
				"line_4" : ' '.join(self.board[3]), 
				"line_5" : ' '.join(self.board[4]), 
				"line_6" : ' '.join(self.board[5])
			}, 
			"player_1_username": self.player1,
			"player_2_username": self.player2,
			"turn": self.turn,
			"current_player":self.currrentPlayer,
			"tie": self.tie,
		}
		return state


	def flush_board(self) -> None:
		"""Function that flushes board and reset the turns if the board is full"""
		if self.board_is_full() :
			self.board = [["." for _ in range(self.column)] for _ in range(self.row)]
			self.turn = 0
			self.tie +=1
			print("Board flushed")
		else : print("Board not flushed")


	def board_is_full(self) -> bool:
		"""Function to check if the board is full"""
		for i in range(self.row):
			for j in range(self.column):
				if self.board[i][j] == ".":
					return False
		return True


	def put_disk(self, column, name) -> bool:
		"""Function to put the disk in the board, it returns false if the game is over and true if it succeeds"""
		if self.currrentPlayer != name:
			return False
		if self.over:
			return False
		# if self.currrentPlayer != name:
			# print("Not " + name + " ")
			# return False
		# print(self.disk, name, self.currrentPlayer , sep=" | ",file=sys.stderr, flush=True)
		self.disk = self.pieces[self.turn % 2]
		if column < 0 or column >= self.column :
			return False
		for i in range(self.row -1 , -1, -1):
			if self.board[i][column] == ".":
				self.board[i][column] = self.disk
				break
			if i - 1 == -1:
				return False
		self.turn+=1
		self.currrentPlayer = self.player1 if self.turn % 2 == 0 else self.player2
		self.tick += 1
		return True


	def check_row_win(self) -> int :
		"""Function that checks if there is a winning row, returns 0 if the player1 wins, 1 if player2 wins else -1"""
		for row in range(self.row):
			for col in range(self.column):
				if self.board[row][col] in self.pieces:
					win=0
					piece = self.board[row][col]
					row_to_check=row
					while row_to_check < self.row and self.board[row_to_check][col] == piece:
						win+=1
						row_to_check+=1
					if win == 4:
						print(piece, self.pieces.index(piece))
						return self.pieces.index(piece)
		return -1


	def check_column_win(self) -> int :
		"""Function that checks if there is a winning column, returns 0 if the player1 wins, 1 if player2 wins else -1"""
		for row in range(self.row):
			for col in range(self.column):
				if self.board[row][col] in self.pieces:
					win=0
					piece = self.board[row][col]
					col_to_check=col
					while col_to_check < self.column and self.board[row][col_to_check] == piece:
						win+=1
						col_to_check+=1
					if win == 4:
						print(piece, self.pieces.index(piece))
						return self.pieces.index(piece)
		return -1


	def check_upward_diag_win(self) -> int :
		"""Function that checks if there is a winning upward diag, returns 0 if the player1 wins, 1 if player2 wins else -1"""
		for row in range(self.row):
			for col in range(self.column):
				if self.board[row][col] in self.pieces:
					win=0
					piece = self.board[row][col]
					row_to_check=row
					col_to_check=col
					while row_to_check >= 0 and col_to_check < self.column and self.board[row_to_check][col_to_check] == piece:
						win+=1
						row_to_check-=1
						col_to_check+=1
					if win == 4:
						print(piece, self.pieces.index(piece))
						return self.pieces.index(piece)
		return -1


	def check_downward_diag_win(self) -> int :
		"""Function that checks if there is a winning downward diag, returns 0 if the player1 wins, 1 if player2 wins else -1"""
		for row in range(self.row):
			for col in range(self.column):
				if self.board[row][col] in self.pieces:
					win=0
					piece = self.board[row][col]
					row_to_check=row
					col_to_check=col
					while row_to_check < self.row and col_to_check < self.column and self.board[row_to_check][col_to_check] == piece:
						win+=1
						row_to_check+=1
						col_to_check+=1
					if win == 4:
						print(piece, self.pieces.index(piece))
						return self.pieces.index(piece)
		return -1


	def winning_board(self) -> Win :
		"""Function that checks if there is a win, returns the player of won in case of a win, else it returns None"""
		if (w :=self.check_column_win()) >= 0:
			print(self)
			player = self.player1 if w == 0 else self.player2
			return player
		elif (w :=self.check_row_win()) >= 0:
			print(self)
			player = self.player1 if w == 0 else self.player2
			return player
		elif (w :=self.check_upward_diag_win()) >= 0:
			print(self)
			player = self.player1 if w == 0 else self.player2
			return player
		elif (w :=self.check_downward_diag_win()) >= 0:
			print(self)
			player = self.player1 if w == 0 else self.player2
			return player
		if self.board_is_full():
			self.flush_board()
		return None


	def start(self) -> None:
		"""Function that starts the game"""
		while not self.over:
			print(self)
			if self.turn % 2 == 0 :
				print(f"It's {self.player1}'s turn! Please choose a column where to put your next piece:")

			else :
				print(f"It's {self.player2}'s turn! Please choose a column where to put your next piece:")

			try:
				column = int(input())
				self.put_disk(column,self.currrentPlayer)
				if (winner:= self.winning_board()) != None:
					print(winner)
					self.winner = winner
					self.over = 1

			except KeyboardInterrupt:
				exit(print("\b\bCtrl+C caught, exiting gracefully <3"))

			except EOFError:
				exit(print("\b\bEOF caught, exiting gracefully <3"))

			except Exception as e:
				if type(e) == Win: exit(print(e))
				print(type(e).__name__, ":", e)



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
		self.sleep = 0.01
		self.input_lock = threading.Lock()
		self.input_receive = False
		self.input_player = "None"
		self.input_column = "None"


	def wait_start(self):
		print("Waiting for C4 Local Game Instance " + self.game_id + " to start")
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
			if self.running == True:
				print("C4 Local Game instance " + self.game_id + "is already running, this function returns without doing anything")
			else:
				print("Starting C4 Local Game instance " + self.game_id)
				self.running = True


	def run(self):
		self.wait_start()
		while not self.board.over:
			with self.end_lock:
				if self.end == True:
					break
			self.check_input()
			self.check_winner()
			if self.board.over == 1 or self.check_surrender() == True:
				self.send_end_state()
				break
			time.sleep(self.sleep)
		self.join_thread()
		print("End of run function for thread " + self.game_id)


	def join_thread(self):
		try:
			async_to_sync(self.channel_layer.send)("c4_local_engine", {
				"type": "join.thread",
				"game_id": self.game_id
			})
		except:
			print("Can not send join thread to c4_local_engine from thread num " + self.game_id)	

	
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
			print("Can not send config to group channel " + self.game_id)
 
 
	def send_end_state(self) -> None:
		looser = "player_1" if self.winner == "player_2" else "player_2"
		data = {"winner" : self.winner,
		  "looser" : looser,
		}
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type" : "send.end.state",
				"End_state" : data,
			})
		except Exception:
			print("Can not send end state to group channel " + self.game_id)
			

	def send_frame(self):
		try:
			async_to_sync(self.channel_layer.group_send)(self.game_id, {
				"type": "send.frame",
				"Frame": self.board.returnBoardState(),
			})
		except Exception:
			print("Can not send frame to group channel " + self.game_id)


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
			