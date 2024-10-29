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
    this.gamePause = false;
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
    const htmlContent = `<div class="col d-flex flex-column align-items-center justify-content-center">
                <div class="background background-battle d-flex flex-column align-items-center">
                    <div class="d-flex flex-row justify-content-between text-white text-section mt-3 w-80">
                        <div class="text-center d-flex"> 
                          <div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar"></div>
                          <h3>${this.lang.getTranslation(["game", "leftPlayer"])}</h3>
                        </div>
                        <div class="text-center">
                            <h3>0 - 0</h3>
                        </div>
                        <div class="text-center d-flex">
                          <h3>${this.lang.getTranslation(["game", "rightPlayer"])}</h3>
                          <div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar"></div>
                        </div>
                    </div>
                    <div class="canvas-container">
                      <canvas id="ongoing-game"></canvas>
                    </div>
                </div>
            </div>`;
    return htmlContent;
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
    this.webSocket = new WebSocket(`ws://localhost:8080/api/game/pong-local/join/`);

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
      console.info("throttleMovement: keypress", this.player1.keyPressTimeout);
      if (!this.player1.keyPressTimeout) {
        this.player1.keyPressTimeout = setTimeout(() => {
          console.info("keyPressTimeout:", this.player1.keyPressTimeout);
          this.sendPlayerMovement(this.player1.name, direction);
          if (this.player1.upPressed || this.player1.downPressed) {
            this.throttleMovement(this.player1.name, direction);
          } else {
            console.info("Remove keyPressTimeout");
            this.player1.keyPressTimeout = null;
          }
        }, 10);
        this.player1.keyPressTimeout = null;
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
        this.player2.keyPressTimeout = null;
      }
    }
  }

  async addEventListeners() {
    this.webSocket.addEventListener(`open`, (ev) => {
      this.webSocket.send(JSON.stringify({ type: "init_game" }));
      console.log("Websocket is opened");
      this.webSocket.send(JSON.stringify({ type: "get_config" }));
    });

    this.webSocket.addEventListener(`close`, (ev) => {
      console.log("WebSocket is closed");
    });

    this.webSocket.addEventListener(`error`, (ev) => {
      console.error("Error in WebSocket", ev);
      navigateTo("/");
    });

    document.addEventListener("click", (ev) => {
      const isClickInsideCanvas = this.canvas.contains(ev.target);
      if (isClickInsideCanvas) {
        let body = null;
        if (!this.gameStart) {
          body = JSON.stringify({ type: "start_game" });
          this.gameStart = true;
        } else {
          if (!this.gamePause) {
            body = JSON.stringify({ type: "pause", action: "stop" });
            this.gamePause = true;
          } else {
            body = JSON.stringify({ type: "pause", action: "start" });
            this.gamePause = false;
          }
        }
        console.log("Sent", body);
        this.webSocket.send(body);
      }
    });

    this.webSocket.addEventListener("message", (ev) => {
      const data = JSON.parse(ev.data);
      console.log("MessageFromSocket:", ev.data);
      switch (data.type) {
        case "config": {
          this.serverWidth = data.board_len;
          this.serverHeight = data.board_height;
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
          this.paddleHeight = data.pad_height;
          this.paddleWidth = data.pad_len;
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
          this.ballRadius = data.ball_size;
          console.log("BallRadius:", this.ballRadius);
          console.log("Ball:", this.ball);
          this.draw();
          break;
        }
        case "frame": {
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
          break;
        }
        case "pause": {
          this.gamePause = true;
          break;
        }
        default: {
          console.log("Unknown message:", data);
        }
      }
    });

    document.addEventListener("keydown", (ev) => {
      if ((ev.key === "w" || ev.key === "W") && !this.player1.upPressed) {
        this.player1.upPressed = true;
        console.info("Press up");
        this.throttleMovement(this.player1.name, "UP");
      }
      if (ev.key === "ArrowUp" && !this.player2.upPressed) {
        this.player2.upPressed = true;
        this.throttleMovement(this.player2.name, "UP");
      }
      if ((ev.key === "s" || ev.key === "S") && !this.player1.downPressed) {
        ev.preventDefault();
        this.player1.downPressed = true;
        this.throttleMovement(this.player1.name, "DOWN");
      }
      if (ev.key === "ArrowDown" && !this.player2.downPressed) {
        ev.preventDefault();
        this.player2.downPressed = true;
        this.throttleMovement(this.player2.name, "DOWN");
      }
      console.info("key pressed:", ev.key);
    });

    document.addEventListener("keyup", (ev) => {
      if (ev.key === "w" || ev.key === "W") {
        console.info("Remove press up");
        this.player1.upPressed = false;
      }
      if (ev.key === "s" || ev.key === "S") {
        this.player1.downPressed = false;
      }
      if (ev.key === "ArrowUp") this.player2.upPressed = false;
      if (ev.key === "ArrowDown") {
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
