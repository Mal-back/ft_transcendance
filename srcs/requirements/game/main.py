# coding: utf-8

from Const import Const
from Pad import Pad
from Player import Player
from Game import Game
from Ball import Ball
import turtle
import time

bob = Player(1, "Bob", 0, Pad(Const.MIN_X.value + Const.PAD_DISTANCE.value, 0))
patrick = Player(2, "Patrick", 0, Pad(Const.MAX_X.value - Const.PAD_DISTANCE.value, 0))
myGame = Game(bob, patrick)

screen = turtle.Screen()
screen.title("Ping Pong")
screen.bgcolor("white")
screen.setup(width=Const.MAX_X.value * 2, height=Const.MAX_Y.value *2)

screen.ball = turtle.Turtle()
screen.ball.speed(4)
screen.ball.shape("circle")
screen.ball.color("blue")
screen.ball.penup()
screen.ball.goto(myGame.ball.x, myGame.ball.y)
screen.leftPad = turtle.Turtle()
screen.leftPad.speed(0)
screen.leftPad.shape("square")
screen.leftPad.color("black")
screen.leftPad.shapesize(stretch_wid=Const.PAD_HEIGHT.value / 20, stretch_len=Const.PAD_WIDTH.value / 20)
screen.leftPad.penup()
screen.leftPad.goto(Const.MIN_X.value + Const.PAD_DISTANCE.value, 0)

screen.rightPad = turtle.Turtle()
screen.rightPad.speed(0)
screen.rightPad.shape("square")
screen.rightPad.color("black")
screen.rightPad.shapesize(stretch_wid=Const.PAD_HEIGHT.value / 20, stretch_len=Const.PAD_WIDTH.value / 20)
screen.rightPad.penup()
screen.rightPad.goto(Const.MAX_X.value - Const.PAD_DISTANCE.value, 0)

screen.listen()
screen.onkeypress(myGame.player1.pad.moveUp, "w")
screen.onkeypress(myGame.player1.pad.moveDown, "s")
screen.onkeypress(myGame.player2.pad.moveUp, "Up")
screen.onkeypress(myGame.player2.pad.moveDown, "Down")

while True:
    screen.update()
    time.sleep(0.001)
    myGame.ball.move()
    screen.ball.speed(500)
    screen.leftPad.goto(myGame.player1.pad.x, myGame.player1.pad.y)
    screen.rightPad.goto(myGame.player2.pad.x, myGame.player2.pad.y)
    screen.ball.goto(myGame.ball.x, myGame.ball.y)
    screen.ball.speed(2)
    if myGame.checkCollisions() == False:
        print("End of the game")
        break