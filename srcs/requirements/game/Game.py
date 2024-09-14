# coding: utf-8

from Const import Const
from Pad import Pad
from Player import Player
from Ball import Ball
  
class Game():
    def __init__(self, player1 : Player, player2 : Player):
        self.player1 = player1
        self.player2 = player2
        self.ball = Ball(0, 0)
        
    @property
    def player1(self):
        return self._player1
    
    @player1.setter
    def player1(self, newPlayer1 : Player):
        self._player1 = newPlayer1

    @property
    def player2(self):
        return self._player2
    
    @player2.setter
    def player2(self, newPlayer2 : Player):
        self._player2 = newPlayer2
        
    @property
    def ball(self):
        return self._ball
    
    @ball.setter
    def ball(self, newBall : Ball):
        self._ball = newBall
    
    def printInfo(self):
        print("Player 1 :\n\tName : " + self.player1.name
              + "\n\tScore : " + str(self.player1.score)
              + "\n\tX Pad : " + str(self.player1.pad.x)
              + "\n\tY Pad : " + str(self.player1.pad.y))
        print("Player 2 :\n\tName : " + self.player2.name
              + "\n\tScore : " + str(self.player2.score)
              + "\n\tX Pad : " + str(self.player2.pad.x)
              + "\n\tY Pad : " + str(self.player2.pad.y))
        print("Ball : \n\tX Ball : " + str(self.ball.x)
              + "\n\tY Ball : " + str(self.ball.y)
              + "\n\tDx Ball : " + str(self.ball.dx)
              + "\n\tDy Ball : " + str(self.ball.dy))
        
    def resetBallPosition(self):
        self.ball.x = 0
        self.ball.y = 0
        
    def start(self):
        while True:
            continue

bob = Player(1, "Bob", 0, Pad(Const.MIN_X.value + Const.PAD_DISTANCE.value, 0))
patrick = Player(2, "Patrick", 0, Pad(Const.MAX_X.value - Const.PAD_DISTANCE.value, 0))
game = Game(bob, patrick)
game.printInfo()