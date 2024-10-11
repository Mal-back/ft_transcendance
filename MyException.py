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