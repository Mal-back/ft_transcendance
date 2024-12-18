import { navigateTo } from "../router.js";
import { getIpPortAdress, showModalGameResult } from "../Utils/Utils.js";
import Language from "../Utils/Language.js";

export default class Pong {
  constructor(setUsernameCallBack) {
    this.lang = new Language();
    this.canvas = null;
    this.context = null;
    this.webSocket = null;
    this.connection = "local";
    this.mode = "simple";
    this.pingInterval = null;
    this.timeout = null;
    this.redirectURL = null;
    this.token = null;

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
    this.handleGiveUp = this.handleGiveUp.bind(this);
    this.setBackground = this.setBackground.bind(this);
    this.setUsernameCallBack = setUsernameCallBack;
  }

  initPong(
    canvas = "ongoing-game",
    websocket = `wss://${getIpPortAdress()}/api/game/pong-local/join/`,
    connection = "local",
    mode = "simple",
    scoreId,
    token = null,
  ) {
    this.canvas = document.getElementById(canvas);
    const computedStyle = window.getComputedStyle(this.canvas);
    this.canvas.width = parseFloat(computedStyle.width);
    this.canvas.height = parseFloat(computedStyle.height);
    this.player1.username = this.lang.getTranslation(["game", "blue"]);
    this.player2.username = this.lang.getTranslation(["game", "red"]);
    this.mode = mode;
    this.connection = connection;
    this.token = token;
    this.redirectURL = this.setRedirecturl();
    this.scoreId = document.getElementById(scoreId);
    this.context = this.canvas.getContext("2d");
    console.log("connecting to :", websocket);
    this.webSocket = new WebSocket(websocket);
  }

  setRedirecturl() {
    let url = "/pong-";
    url += this.connection == "local" ? "local-" : "remote-";
    url += this.mode == "simple" ? "menu" : "tournament";
    console.log(`url = ${url}`);
    return url;
  }

  setToken(authToken) {
    this.token = authToken;
  }

  setUsername(player1Name, player2Name, tournament) {
    this.player1.username = player1Name;
    this.player2.username = player2Name;
    this.tournament = tournament;
    this.redirectURL = this.setRedirecturl();
  }

  setBackground() {
    const element = document.querySelector(
      ".background.background-battle.d-flex.flex-column.align-items-center",
    );
    element.style = `background-image:url('../img/ow.jpg');`;
  }

  getUsername() {
    this.setUsernameCallBack(
      this.connection,
      this.player1.username,
      this.player2.username,
    );
  }

  async handleWebSocketOpen(ev) {
    console.log("WEBSOCKET IS OPEN: mode = ", this.mode);
    if (this.connection == "remote") {
      let uuid = sessionStorage.getItem("transcendence_game_id");

      const body = {
        type: "join_game",
        game_id: uuid,
        auth_key: this.token,
      };
      console.log("try to auth with: ", body);
      this.webSocket.send(JSON.stringify(body));
    }
    this.webSocket.send(JSON.stringify({ type: "init_game" }));
    this.webSocket.send(JSON.stringify({ type: "get_config" }));
    this.startTimeout();
  }

  handleWebSocketClose(ev) {
    console.error("Socket is closed");
    this.removePongEvent();
    this.gameStart = false;
    navigateTo(this.redirectURL);
  }

  handleWebSocketError(ev) {
    console.error("Websocket fail: ", ev);
    this.removePongEvent();
    this.gameStart = false;
    navigateTo(this.redirectURL);
  }

  printMessage(message, color) {
    this.draw();
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

  handleTournamentData(data) {
    const playerA = this.tournament.PlayerA[this.tournament.round.currentMatch];
    const playerB = this.tournament.PlayerB[this.tournament.round.currentMatch];
    if (data.winner == "player_1") {
      playerA.win += 1;
      playerA.winRate = (playerA.win / (playerA.win + playerA.loss)) * 100;
      playerB.loss += 1;
      playerB.winRate = (playerB.win / (playerB.win + playerB.loss)) * 100;
    } else {
      playerB.win += 1;
      playerB.winRate = (playerB.win / (playerB.win + playerB.loss)) * 100;
      playerA.loss += 1;
      playerA.winRate = (playerA.win / (playerA.win + playerA.loss)) * 100;
    }
    this.tournament.round.currentMatch += 1;
    sessionStorage.setItem(
      "tournament_transcendence_local",
      JSON.stringify(this.tournament),
    );
  }

  showResultModal(data) {
    let winner = "";
    let loser = "";
    let score = "";
    let gif = "../img/ts/taylor-swift-cookie.gif";
    const username = sessionStorage.getItem("username_transcendence");
    if (this.connection == "local") {
        console.log("PONGLOCAL: player1:", this.player1.username);
        console.log("PONGLOCAL: player2:", this.player2.username);
      if (data.winner == "player_1") {
        winner = this.player1.username;
        loser = this.player2.username;
      }
      else {
        winner = this.player2.username;
        loser = this.player1.username;
      }
      score =
        data.winner == "player_1"
          ? `${data.score_1} - ${data.score_2}`
          : `${data.score_2} - ${data.score_1}`;
    } else {
      winner = data.winner;
      loser = data.looser;
      gif =
        data.winner == username
          ? "../img/ts/taylor-swift-win.gif"
          : "../img/ts/taylor-swift-cookie.gif";
      score =
        data.winner == username
          ? `${data.winner_points} - ${data.looser_points}`
          : `${data.looser_points} - ${data.winner_points}`;
    }

    showModalGameResult(winner, loser, gif, score);
  }

  handleWebSocketMessage(ev) {
    const data = JSON.parse(ev.data);
    switch (data.type) {
      case "ping": {
        this.webSocket.send(JSON.stringify({ type: "pong" }));
        break;
      }
      case "pong": {
        clearTimeout(this.pingInterval);
        break;
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
        if (data.action == "start") {
          this.context.strokeText("", 10, 80);
          this.gamePause = false;
        }
        if (data.action == "stop") {
          this.printMessage(this.lang.getTranslation(["game", "game_paused"]), "white");
          this.gamePause = true;
        }
        break;
      }
      case "wait": {
        this.printMessage(this.lang.getTranslation(["game", "waiting_players"]));
        break;
      }
      case "end_state": {
        console.log("END:", data);
        this.removePongEvent();
        this.printMessage(`${data.winner} won`, "white");
        if (this.tournament) {
          this.handleTournamentData(data);
        }
        this.showResultModal(data);
        navigateTo(this.redirectURL);
        return;
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
      this.sendPing();
    }, 3000);
  }

  sendPing() {
    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify({ type: "ping" }));
      this.pingInterval = setTimeout(() => {
        console.error("No response from the server");
        this.webSocket.close();
      }, 2000);
    }
  }

  handleUnloadPage(ev) {
    if (this.webSocket) {
      if (this.webSocket.readyState === WebSocket.OPEN) this.webSocket.close();
    }
  }

  handleKeyDown(ev) {
    if (this.webSocket.readyState === WebSocket.OPEN) {
      switch (ev.key) {
        case " ": {
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
          if (this.connection == "remote") return;
          ev.preventDefault();
          if (!this.player2.upPressed) {
            this.player2.upPressed = true;
            this.player2.lastDirection = "UP";
            this.throttleMovement(this.player2);
          }
          break;
        }
        case "ArrowDown": {
          if (this.connection == "remote") return;
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
  }

  handleKeyUp(ev) {
    if (this.webSocket.readyState === WebSocket.OPEN) {
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
          if (this.connection == "remote") return;
          ev.preventDefault();
          this.player2.upPressed = false;
          break;
        }
        case "ArrowDown": {
          if (this.connection == "remote") return;
          ev.preventDefault();
          this.player2.downPressed = false;
          break;
        }
      }
    }
  }

  handleGiveUp(ev) {
    ev.preventDefault();
    if (this.gamePause) {
      this.webSocket.send(JSON.stringify({ type: "pause", action: "start" }));
    }
    this.webSocket.send(JSON.stringify({ type: "surrend" }));
  }

  addPongEvent() {
    if (this.webSocket) {
      this.webSocket.addEventListener("open", this.handleWebSocketOpen);
      this.webSocket.addEventListener("close", this.handleWebSocketClose);
      this.webSocket.addEventListener("error", this.handleWebSocketError);
      this.webSocket.addEventListener("message", this.handleWebSocketMessage);
    }
    document.addEventListener("beforeunload", this.handleUnloadPage);
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    const giveUpButton = document.querySelector("#giveUpButton");
    giveUpButton.addEventListener("click", this.handleGiveUp);
  }

  removePongEvent() {
    clearTimeout(this.player1.keyPressTimeout);
    clearTimeout(this.player2.keyPressTimeout);
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
      this.webSocket = null;
    }
    document.removeEventListener("beforeunload", this.handleUnloadPage);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  configGame(data) {
    console.log(data);
    this.serverWidth = data.board_len;
    this.serverHeight = data.board_height;
    // console.log(`Board Dimensions: ${this.serverWidth} * ${this.serverHeight}`);

    this.scaleX = this.canvas.width / this.serverWidth;
    this.scaleY = this.canvas.height / this.serverHeight;
    // console.log("scaleX", this.scaleX);
    // console.log("scaleY", this.scaleY);

    this.leftPaddle = {
      x: data.player_1.pos[0],
      y: data.player_1.pos[1],
    };
    this.paddleHeight = data.pad_height;
    this.paddleWidth = data.pad_len;
    // console.log("paddleHeight:", this.paddleHeight);
    // console.log("paddleWidth:", this.paddleWidth);
    // console.log("LeftPaddle:", this.leftPaddle);

    this.rightPaddle = {
      x: data.player_2.pos[0],
      y: data.player_2.pos[1],
    };
    // console.log("RightPaddle:", this.rightPaddle);

    this.ball = {
      x: data.ball[0],
      y: data.ball[1],
    };
    this.ballRadius = data.ball_size;
    // console.log("BallRadius:", this.ballRadius);
    // console.log("Ball:", this.ball);
    if (this.connection == "remote")
      this.setUsername(data.player_1.username, data.player_2.username);
    this.getUsername();
    this.draw();
  }

  drawFrame(data) {
    this.leftPaddle = {
      x: data.player_1.position[0],
      y: data.player_1.position[1],
    };
    // console.log("UpdatedLeftPaddle:", this.leftPaddle);

    this.rightPaddle = {
      x: data.player_2.position[0],
      y: data.player_2.position[1],
    };
    // console.log("UpdatedRightPaddle:", this.rightPaddle);

    this.ball = {
      x: data.ball.position[0],
      y: data.ball.position[1],
    };
    this.scoreId.innerText = `${data.player_1.score} - ${data.player_2.score}`;
    // console.log("UpdatedBall:", this.ball);
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
    // console.log("LeftPaddleInCanvas:", {
    //   x: this.leftPaddle.x * this.scaleX,
    //   y: this.leftPaddle.y * this.scaleY,
    //   width: this.paddleWidth * this.scaleX,
    //   height: this.paddleHeight * this.scaleY,
    // });

    this.context.fillStyle = "red";
    this.context.fillRect(
      this.rightPaddle.x * this.scaleX,
      this.rightPaddle.y * this.scaleY,
      this.paddleWidth * this.scaleX,
      this.paddleHeight * this.scaleY,
    );
    // console.log("rightPaddleInCanvas:", {
    //   x: this.rightPaddle.x * this.scaleX,
    //   y: this.rightPaddle.y * this.scaleY,
    //   width: this.paddleWidth * this.scaleX,
    //   height: this.paddleHeight * this.scaleY,
    // });
    this.context.fillStyle = "white";
    this.context.beginPath();
    this.context.arc(
      this.ball.x * this.scaleX,
      this.ball.y * this.scaleY,
      this.ballRadius * this.scaleX,
      0,
      Math.PI * 2,
    );
    // console.log("BallInCanvas:", {
    //   x: this.ball.x * this.scaleX,
    //   y: this.ball.y * this.scaleY,
    //   radius: this.ballRadius * this.scaleX,
    // });
    this.context.fill();
    this.context.closePath();
  }
  draw() {
    // console.log("DRAW");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPaddles();
  }

  sendPlayerMovement(player, directionPlayer) {
    if (!this.webSocket) return;
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
