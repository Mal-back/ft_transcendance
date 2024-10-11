import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Local Pong");
    this.canvas = null;
    this.context = null;

    this.leftPaddle = { x: 0, y: 0 };
    this.rightPaddle = { x: 0, y: 0 };
    this.paddleWidth = 0;
    this.paddleHeight = 0;
    this.ballRadius = 0;
    this.ball = { x: 0, y: 0, radius: 0 };
    this.scaleX = 1;
    this.scaleY = 1;
    this.serverWidth = 0;
    this.serverHeight = 0;
    this.webSocket = null;
    this.gameStart = false;
    this.player1 = {
      keyPressTimeout: null,
      name: "player_1",
      upPressed: false,
      downPressed: false,
    };
    this.player2 = {
      keyPressTimeout: null,
      name: "player_2",
      upPressed: false,
      downPressed: false,
    };
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-battle.css");
  }

  async getHtml() {
    const mainDiv = document.createElement("div");
    mainDiv.classList.add("background", "background-battle");

    const divFlex = document.createElement("div");
    divFlex.classList.add("d-flex", "justify-content-center");

    const canvasElement = document.createElement("canvas");
    canvasElement.id = "ongoing-game";
    divFlex.appendChild(canvasElement);
    mainDiv.appendChild(divFlex);
    return mainDiv.outerHTML;
  }

  pongGame() {
    this.canvas = document.getElementById("ongoing-game");
    const computedStyle = window.getComputedStyle(this.canvas);
    this.canvas.width = parseFloat(computedStyle.width);
    this.canvas.height = parseFloat(computedStyle.height);
    console.log("CANVAS:", {
      width: this.canvas.width,
      height: this.canvas.height,
    });

    //     const scaleFactor = window.devicePixelRatio || 1;
    // console.log("SCALE FACTOR:", scaleFactor);
    // canvas.width *= scaleFactor;
    // canvas.height *= scaleFactor;
    // context.scale(scaleFactor, scaleFactor);
    this.context = this.canvas.getContext("2d");
    this.webSocket = new WebSocket(`ws://localhost:8080/api/game/ws/14845`);
  }

  drawPaddles() {
    this.context.fillStyle = "blue";
    this.context.fillRect(
      this.leftPaddle.x * this.scaleX,
      this.leftPaddle.y * this.scaleY,
      this.paddleWidth * this.scaleX,
      this.paddleHeight * this.scaleY,
    );
    console.log("LeftPaddleInCanvas:", {
      x: this.leftPaddle.x * this.scaleX,
      y: this.leftPaddle.y * this.scaleY,
      width: this.paddleWidth * this.scaleX,
      height: this.paddleHeight * this.scaleY,
    });

    this.context.fillStyle = "red";
    this.context.fillRect(
      this.rightPaddle.x * this.scaleX,
      this.rightPaddle.y * this.scaleY,
      this.paddleWidth * this.scaleX,
      this.paddleHeight * this.scaleY,
    );
    console.log("rightPaddleInCanvas:", {
      x: this.rightPaddle.x * this.scaleX,
      y: this.rightPaddle.y * this.scaleY,
      width: this.paddleWidth * this.scaleX,
      height: this.paddleHeight * this.scaleY,
    });
    this.context.fillStyle = "white";
    this.context.beginPath();
    this.context.arc(
      this.ball.x * this.scaleX,
      this.ball.y * this.scaleY,
      this.ballRadius * this.scaleX,
      0,
      Math.PI * 2,
    );
    console.log("BallInCanvas:", {
      x: this.ball.x * this.scaleX,
      y: this.ball.y * this.scaleY,
      radius: this.ballRadius * this.scaleX,
    });
    this.context.fill();
    this.context.closePath();
  }

  draw() {
    console.log("DRAW");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPaddles();
  }

  sendPlayerMovement(player, directionPlayer) {
    const movementData = {
      type: "move",
      player: player,
      direction: directionPlayer,
    };
    this.webSocket.send(JSON.stringify(movementData));
    console.info("Sent", movementData);
  }

  throttleMovement(player, direction) {
    if (player == "player_1") {
      if (!this.player1.keyPressTimeout) {
        this.player1.keyPressTimeout = setTimeout(() => {
          this.sendPlayerMovement(this.player1.name, direction);
          if (this.player1.upPressed || this.player1.downPressed) {
            this.throttleMovement(this.player1.name, direction);
          } else {
            this.player1.keyPressTimeout = null;
          }
        }, 10);
      }
    } else {
      if (!this.player2.keyPressTimeout) {
        this.player2.keyPressTimeout = setTimeout(() => {
          this.sendPlayerMovement(this.player2.name, direction);
          if (this.player2.upPressed || this.player2.downPressed) {
            this.throttleMovement(this.player2.name, direction);
          } else {
            this.player2.keyPressTimeout = null;
          }
        }, 10);
      }
    }
    const str = `coucou${this.webSocket}+${this.sendPlayerMovement(mivi)}\n`;
  }

  async addEventListeners() {
    this.webSocket.addEventListener(`open`, (ev) => {
      console.log("Websocket is opened");
    });

    this.webSocket.addEventListener(`close`, (ev) => {
      console.log("WebSocket is closed");
    });

    this.webSocket.addEventListener(`error`, (ev) => {
      console.error("Error in WebSocket", ev);
    });

    document.addEventListener("click", (ev) => {
      const isClickInsideCanvas = this.canvas.contains(ev.target);
      if (isClickInsideCanvas) {
        const body = this.gameStart
          ? JSON.stringify({ type: "start_game" })
          : JSON.stringify({ type: "init_game" });
        console.log("Sent", body);
        this.webSocket.send(body);
      }
    });

    this.webSocket.addEventListener("message", (ev) => {
      const data = JSON.parse(ev.data);
      console.log("MessageFromSocket:", ev.data);
      if (this.gameStart === false) {
        this.serverWidth = data.Dimensions.board_len;
        this.serverHeight = data.Dimensions.board_height;
        console.log(
          `Board Dimensions: ${this.serverWidth} * ${this.serverHeight}`,
        );

        this.scaleX = this.canvas.width / this.serverWidth;
        this.scaleY = this.canvas.height / this.serverHeight;
        console.log("scaleX", this.scaleX);
        console.log("scaleY", this.scaleY);

        this.leftPaddle = {
          x: data.player_1[0],
          y: data.player_1[1],
        };
        this.paddleHeight = data.Dimensions.pad_height * 2;
        this.paddleWidth = data.Dimensions.pad_len * 2;
        console.log("paddleHeight:", this.paddleHeight);
        console.log("paddleWidth:", this.paddleWidth);
        console.log("LeftPaddle:", this.leftPaddle);

        this.rightPaddle = {
          x: data.player_2[0],
          y: data.player_2[1],
        };
        console.log("RightPaddle:", this.rightPaddle);

        this.ball = {
          x: data.ball[0],
          y: data.ball[1],
        };
        this.ballRadius = data.Dimensions.ball_size;
        console.log("BallRadius:", this.ballRadius);
        console.log("Ball:", this.ball);
        this.gameStart = true;
        this.draw();
      } else {
        this.leftPaddle = {
          x: data.player_1.position[0],
          y: data.player_1.position[1],
        };
        console.log("UpdatedLeftPaddle:", this.leftPaddle);

        this.rightPaddle = {
          x: data.player_2.position[0],
          y: data.player_2.position[1],
        };
        console.log("UpdatedRightPaddle:", this.rightPaddle);

        this.ball = {
          x: data.ball.position[0],
          y: data.ball.position[1],
        };
        console.log("UpdatedBall:", this.ball);

        this.draw();
      }
    });

    document.addEventListener("keydown", (ev) => {
      if ((ev.key === "w" || ev.key === "W") && !this.player1.upPressed) {
        this.player1.upPressed = true;
        this.throttleMovement(this.player1.name, "UP");
      }
      if (ev.key === 38 && !this.player2.upPressed) {
        this.player2.upPressed = true;
        this.throttleMovement(this.player2.name, "UP");
      }
      if ((ev.key === "s" || ev.key === "S") && !this.player1.downPressed) {
        this.player1.downPressed = true;
        this.throttleMovement(this.player1.name, "DOWN");
      }
      if (ev.key === 40 && !this.player2.downPressed) {
        this.player2.downPressed = true;
        this.throttleMovement(this.player2.name, "DOWN");
      }
    });

    document.addEventListener("keyup", (ev) => {
      if (ev.key === "w" || ev.key === "W") {
        this.player1.upPressed = false;
      }
      if (ev.key === "s" || ev.key === "S") {
        this.player1.downPressed = false;
      }
      if (ev.key === 38) this.player2.upPressed = false;
      if (ev.key === 40) {
        this.player2.downPressed = false;
      }
    });

    window.addEventListener("beforeunload", (ev) => {
      if (this.webSocket) {
        if (this.webSocket.readyState === WebSocket.OPEN) {
          this.webSocket.close();
          console.log("WebSocket connection closed before page unload.");
        }
      }
    });
  }
}
