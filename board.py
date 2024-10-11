from MyException import FullError,IndexColError,Win


class Board:
    """
    This class takes two ints to instantiate the object for the row and columns of the board. This is a board of
    a connect four
    """
    def __init__(self,row,column):
        self.row = row
        self.column = column
        self.board = [["." for _ in range(self.column)] for _ in range(self.row)]
        self.over=0
        self.player1="Toto"
        self.player2="Lulu"
        self.pieces=["X","O"]
        self.turn=0
        self.tie=0
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


    def put_disk(self, column, disk) -> bool:
        """Function to put the disk in the board, it returns false if the game is over and true if it succeeds"""
        if self.over:
            return False
        if column < 0 or column >= self.column :
            raise IndexColError()
        for i in range(self.row -1 , -1, -1):
            if self.board[i][column] == ".":
                self.board[i][column] = disk
                break
            if i - 1 == -1:
                raise FullError()
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
                self.put_disk(column,self.pieces[self.turn % 2])
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