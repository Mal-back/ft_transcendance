import { navigateTo } from "../router.js";

export default class Pong {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.webSocket = null;
    this.mode = "local";
    this.pingInterval = null;
    this.timeout = null;

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
    this.gameStart = false;
    this.gamePause = false;
    this.player1 = {
      username: "Left-Player",
      keyPressTimeout: null,
      name: "player_1",
      upPressed: false,
      downPressed: false,
      lastDirection: null,
    };
    this.player2 = {
      username: "Right-Player",
      keyPressTimeout: null,
      name: "player_2",
      upPressed: false,
      downPressed: false,
      lastDirection: null,
    };
    this.scoreId = null;

    this.handleWebSocketOpen = this.handleWebSocketOpen.bind(this);
    this.handleWebSocketClose = this.handleWebSocketClose.bind(this);
    this.handleWebSocketError = this.handleWebSocketError.bind(this);
    this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);
    this.handleUnloadPage = this.handleUnloadPage.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  initPong(
    canvas = "ongoing-game",
    websocket = `wss://localhost:8080/api/game/pong-local/join/`,
    mode = "local",
    scoreId,
  ) {
    this.canvas = document.getElementById(canvas);
    const computedStyle = window.getComputedStyle(this.canvas);
    this.canvas.width = parseFloat(computedStyle.width);
    this.canvas.height = parseFloat(computedStyle.height);
    console.log("CANVAS:", {
      width: this.canvas.width,
      height: this.canvas.height,
    });
    this.mode = mode;
    this.scoreId = document.getElementById(scoreId);
    this.context = this.canvas.getContext("2d");
    this.webSocket = new WebSocket(websocket);
  }

  setUsername(player1Name, player2Name, tournament) {
    this.player1.username = player1Name;
    this.player2.username = player2Name;
    this.tournament = tournament;
  }

  getUsername() {
    return {
      mode: this.mode,
      leftPlayer: this.player1.username,
      rightPlayer: this.player2.username,
    };
  }

  handleWebSocketOpen(ev) {
    console.log("WEBSOCKET IS OPEN");
    this.webSocket.send(JSON.stringify({ type: "init_game" }));
    this.webSocket.send(JSON.stringify({ type: "get_config" }));
    this.startTimeout();
  }

  handleWebSocketClose(ev) {
    console.error("Socket is closed");
    this.removePongEvent();
    this.gameStart = false;
    if (this.mode == "tournament_local") {
      navigateTo("/pong-local-tournament");
    }
  }

  handleWebSocketError(ev) {
    console.error("Websocket fail: ", ev);
    this.removePongEvent();
    this.gameStart = false;
  }

  printMessage(message, color) {
    const fontSize = 50;
    this.context.font = `${fontSize}px Arial`;
    const textWidth = this.context.measureText(message).width;
    const x = (this.canvas.width - textWidth) / 2;
    const y = (this.canvas.height / 2) * 0.5;
    this.context.strokeStyle = "black";
    this.context.lineWidth = 5;
    this.context.strokeText(message, x, y + fontSize * 0.5);
    this.context.fillStyle = color;
    this.context.fillText(message, x, y + fontSize * 0.5);
  }

  handleWebSocketMessage(ev) {
    const data = JSON.parse(ev.data);
    switch (data.type) {
      case "ping": {
        this.webSocket.send(JSON.stringify({ type: "pong" }));
      }
      case "pong": {
        clearTimeout(this.pingInterval);
      }
      case "config": {
        this.configGame(data);
        break;
      }
      case "frame": {
        this.drawFrame(data);
        break;
      }
      case "pause": {
        console.log(data);
        if (data.action == "start") {
          this.context.strokeText("", 10, 80);
          this.gamePause = false;
        }
        if (data.action == "stop") {
          this.printMessage("Game is paused", "white");
          this.gamePause = true;
        }
        break;
      }
      case "end_state": {
        console.log("END:", data);
        this.printMessage(`${data.winner} won`, "white");
        if (this.mode == "tournament_local") {
          console.log("TOURNAMENT:", this.tournament);
          const playerA =
            this.tournament.PlayerA[this.tournament.round.currentMatch];
          const playerB =
            this.tournament.PlayerB[this.tournament.round.currentMatch];
          if (data.winner == "player_1") {
            playerA.win += 1;
            playerA.winRate =
              (playerA.win / (playerA.win + playerA.loss)) * 100;
            playerB.loss += 1;
            playerB.winRate =
              (playerB.win / (playerB.win + playerB.loss)) * 100;
          } else {
            playerB.win += 1;
            playerB.winRate =
              (playerB.win / (playerB.win + playerB.loss)) * 100;
            playerA.loss += 1;
            playerA.winRate =
              (playerA.win / (playerA.win + playerA.loss)) * 100;
          }
          this.tournament.round.currentMatch += 1;
          console.log("CURRENT MATCH = ", this.tournament.round.currentMatch);
          sessionStorage.setItem(
            "tournament_transcendence_local",
            JSON.stringify(this.tournament),
          );
          navigateTo("/pong-local-tournament");
        }
        this.removePongEvent();
        // this.endGame();
        break;
      }
      default: {
        console.log("Unknown message: ", data);
      }
    }
    clearTimeout(this.timeout);
    this.startTimeout();
  }

  startTimeout() {
    this.timeout = setTimeout(() => {
      console.log("no frame recieved in the last 3s");
      this.sendPing();
    }, 3000);
  }

  sendPing() {
    this.webSocket.send(JSON.stringify({ type: "ping" }));
    this.pingInterval = setTimeout(() => {
      console.error("No response from the server");
      this.webSocket.close();
    }, 2000);
  }

  handleUnloadPage(ev) {
    if (this.webSocket) {
      if (this.webSocket.readyState === WebSocket.OPEN) this.webSocket.close();
    }
  }

  handleKeyDown(ev) {
    switch (ev.key) {
      case " ": {
        console.log("SPACE");
        ev.preventDefault();
        if (!this.gameStart) {
          this.webSocket.send(JSON.stringify({ type: "start_game" }));
          this.gameStart = true;
        } else {
          if (!this.gamePause) {
            this.webSocket.send(
              JSON.stringify({ type: "pause", action: "stop" }),
            );
            this.player1.keyPressTimeout = null;
            this.player1.upPressed = false;
            this.player1.downPressed = false;
            this.player1.lastDirection = null;
            this.player2.keyPressTimeout = null;
            this.player2.upPressed = false;
            this.player2.downPressed = false;
            this.player2.lastDirection = null;
          } else {
            this.webSocket.send(
              JSON.stringify({ type: "pause", action: "start" }),
            );
          }
        }
        break;
      }
      case "W":
      case "w": {
        ev.preventDefault();
        if (!this.player1.upPressed) {
          this.player1.upPressed = true;
          this.player1.lastDirection = "UP";
          this.throttleMovement(this.player1);
        }
        break;
      }
      case "S":
      case "s": {
        ev.preventDefault();
        if (!this.player1.downPressed) {
          this.player1.downPressed = true;
          this.player1.lastDirection = "DOWN";
          this.throttleMovement(this.player1);
        }
        break;
      }
      case "ArrowUp": {
        if (this.mode == "remote") return;
        ev.preventDefault();
        if (!this.player2.upPressed) {
          this.player2.upPressed = true;
          this.player2.lastDirection = "UP";
          this.throttleMovement(this.player2);
        }
        break;
      }
      case "ArrowDown": {
        if (this.mode == "remote") return;
        ev.preventDefault();
        if (!this.player2.downPressed) {
          this.player2.downPressed = true;
          this.player2.lastDirection = "DOWN";
          this.throttleMovement(this.player2);
        }
        break;
      }
    }
  }

  handleKeyUp(ev) {
    switch (ev.key) {
      case "W":
      case "w": {
        this.player1.upPressed = false;
        break;
      }
      case "S":
      case "s": {
        this.player1.downPressed = false;
        break;
      }
      case "ArrowUp": {
        if (this.mode == "remote") return;
        ev.preventDefault();
        this.player2.upPressed = false;
        break;
      }
      case "ArrowDown": {
        if (this.mode == "remote") return;
        ev.preventDefault();
        this.player2.downPressed = false;
        break;
      }
    }
  }

  addPongEvent() {
    this.webSocket.addEventListener("open", this.handleWebSocketOpen);
    this.webSocket.addEventListener("close", this.handleWebSocketClose);
    this.webSocket.addEventListener("error", this.handleWebSocketError);
    this.webSocket.addEventListener("message", this.handleWebSocketMessage);
    document.addEventListener("beforeunload", this.handleUnloadPage);
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  removePongEvent() {
    clearTimeout(this.pingInterval);
    clearTimeout(this.timeout);
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket.removeEventListener("open", this.handleWebSocketOpen);
      this.webSocket.removeEventListener("close", this.handleWebSocketClose);
      this.webSocket.removeEventListener("error", this.handleWebSocketError);
      this.webSocket.removeEventListener(
        "message",
        this.handleWebSocketMessage,
      );
    }
    document.removeEventListener("beforeunload", this.handleUnloadPage);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  configGame(data) {
    console.log(data);
    this.serverWidth = data.board_len;
    this.serverHeight = data.board_height;
    console.log(`Board Dimensions: ${this.serverWidth} * ${this.serverHeight}`);

    this.scaleX = this.canvas.width / this.serverWidth;
    this.scaleY = this.canvas.height / this.serverHeight;
    console.log("scaleX", this.scaleX);
    console.log("scaleY", this.scaleY);

    this.leftPaddle = {
      x: data.player_1.pos[0],
      y: data.player_1.pos[1],
    };
    this.paddleHeight = data.pad_height;
    this.paddleWidth = data.pad_len;
    console.log("paddleHeight:", this.paddleHeight);
    console.log("paddleWidth:", this.paddleWidth);
    console.log("LeftPaddle:", this.leftPaddle);

    this.rightPaddle = {
      x: data.player_2.pos[0],
      y: data.player_2.pos[1],
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
  }

  drawFrame(data) {
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
    this.scoreId.innerText = `${data.player_1.score} - ${data.player_2.score}`;
    console.log("UpdatedBall:", this.ball);
    this.draw();
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

  throttleMovement(playerObj) {
    if (this.gamePause || !this.gameStart) return;

    if (!playerObj.keyPressTimeout) {
      playerObj.keyPressTimeout = setTimeout(() => {
        this.sendPlayerMovement(playerObj.name, playerObj.lastDirection);
        if (playerObj.upPressed || playerObj.downPressed) {
          this.throttleMovement(playerObj);
        } else {
          playerObj.keyPressTimeout = null;
        }
      }, 10);
      playerObj.keyPressTimeout = null;
    }
  }
}
