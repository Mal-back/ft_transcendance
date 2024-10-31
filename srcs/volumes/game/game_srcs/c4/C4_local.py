import json

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
			"board":{
				"line1" : ' '.join(self.board[0]),
				"line2" : ' '.join(self.board[1]), 
				"line3" : ' '.join(self.board[2]), 
				"line4" : ' '.join(self.board[3]), 
				"line5" : ' '.join(self.board[4]), 
				"line6" : ' '.join(self.board[5])
			},
			"startingPlayer" : self.player1,
			"player1" : self.player1,
			"player2" : self.player2,
			"player1-piece":self.pieces[0],
			"player2-piece":self.pieces[1],
		}
		return config

	def returnBoardState(self) -> dict:
		"""Returns the current state of the game as a JSON string."""
		state = {
			"board":{
				"line1" : ' '.join(self.board[0]),
				"line2" : ' '.join(self.board[1]), 
				"line3" : ' '.join(self.board[2]), 
				"line4" : ' '.join(self.board[3]), 
				"line5" : ' '.join(self.board[4]), 
				"line6" : ' '.join(self.board[5])
			}, 
			"over": self.over,
			"player1": self.player1,
			"player2": self.player2,
			"pieces": self.pieces,
			"turn": self.turn,
			"currentPlayer":self.currrentPlayer,
			"tie": self.tie,
			"winner": self.winner.player if self.winner else None
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
		if self.over:
			return False
		if self.currrentPlayer != name:
			return False
		if column < 0 or column >= self.column :
			raise IndexColError()
		for i in range(self.row -1 , -1, -1):
			if self.board[i][column] == ".":
				self.board[i][column] = self.disk
				break
			if i - 1 == -1:
				return False
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
			return Win(player)
		elif (w :=self.check_row_win()) >= 0:
			print(self)
			player = self.player1 if w == 0 else self.player2
			return Win(player)
		elif (w :=self.check_upward_diag_win()) >= 0:
			print(self)
			player = self.player1 if w == 0 else self.player2
			return Win(player)
		elif (w :=self.check_downward_diag_win()) >= 0:
			print(self)
			player = self.player1 if w == 0 else self.player2
			return Win(player)
		self.turn+=1
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
				self.disk = self.pieces[self.turn % 2]
				self.currrentPlayer = self.player1 if self.turn % 2 == 0 else self.player2
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
		self.tick = 0
		self.board_lock = threading.Lock()
		self.winner = "None"
		self.surrender = "None"
		self.surrender_lock = threading.Lock()
		self.game_id = game_id
		self.channel_layer = get_channel_layer()
		self.end = False
		self.end_lock = threading.Lock()
		return


	def wait_start(self):
		print("Waiting for pong local game instance " + self.game_id + " to start")
		while True:
			with self.start_lock:
				if self.runing == True:
					break
			with self.end_lock:
				if self.end == True:
					break
			time.sleep(0.01)
   

	def run(self):
		while not self.board.over:
			if self.tick != self.board.tick:
				self.board.tick = 0
				self.board.returnBoardState()
			
	def receive_input(self, event):
		col_num = event["col"]
		player = event["player"]
		self.board.put_disk()
		return

	def send_state(self):
		return
			