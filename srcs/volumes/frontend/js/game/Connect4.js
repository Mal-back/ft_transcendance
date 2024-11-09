import { navigateTo } from "../router.js";
import { getIpPortAdress, setSessionStorage, showModal } from "../Utils/Utils.js";

export default class Connect4 {
  constructor(setUsernameCallBack) {
    this.rows = 6;
    this.cols = 7;
    this.context = null;
    this.webSocket = null;
    this.mode = "local";
    this.pingInterval = null;
    this.timeout = null;
    this.redirectURL = null;
    this.token = null;

    this.gameActive = true;
    this.gameStart = false;
    this.player1 = {
      username: "Folklore",
      keyPressTimeout: null,
      player: "player_1",
      name: "player_1",
      color: "Red",
      span: `<span id="leftUser" class="user1-txt">`,
      piece: "X",
    };
    this.player2 = {
      username: "Evermore",
      keyPressTimeout: null,
      player: "player_2",
      name: "player_2",
      color: "Blue",
      span: `<span id="rightUser" class="user2-txt">`,
      piece: "0",
    };
    this.currentPlayer = this.player1;
    this.currentColor = "red";
    this.handleWebSocketOpen = this.handleWebSocketOpen.bind(this);
    this.handleWebSocketClose = this.handleWebSocketClose.bind(this);
    this.handleWebSocketError = this.handleWebSocketError.bind(this);
    this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);
    this.sendPlayerMovement = this.sendPlayerMovement.bind(this);
    this.handleUnloadPage = this.handleUnloadPage.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
    this.handleHelp = this.handleHelp.bind(this);
    this.handleGiveUp = this.handleGiveUp.bind(this);
    this.setBackground = this.setBackground.bind(this);
    this.showTimer = this.showTimer.bind(this);
    this.setUsernameCallBack = setUsernameCallBack;
  }

  initC4(
    canvas = "ongoing-game",
    websocket = `wss://${getIpPortAdress()}/api/game/c4-local/join/`,
    mode = "local",
    token = null,
  ) {
    this.mode = mode;
    this.token = token;
    console.log("COUCOU");
    this.redirectURL = this.setRedirecturl();
    document.getElementById("User1").innerHTML =
      `<div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar" id="leftPlayerAvatar"></div><h3 class="username-outline" style="cursor: pointer;">${this.player1.span}${this.player1.username}</span></h3>`;
    document.getElementById("User2").innerHTML =
      `</div><h3 class="username-outline" style="cursor: pointer;">${this.player2.span}${this.player2.username}</span></h3><div class="Avatar Avatar-Resize status-playing ms-3" alt="Avatar" id="rightPlayerAvatar"></div>`;
    document
      .getElementById("User1")
      .setAttribute(
        "title",
        `${this.player1.username} is ${this.player1.color}`,
      );
    document
      .getElementById("User2")
      .setAttribute(
        "title",
        `${this.player2.username} is ${this.player2.color}`,
      );
    document.getElementById("Turn").innerHTML =
      `<h3>It's ${this.player1.span}${this.player1.username}</span>'s turn!</h3>`;
    this.webSocket = new WebSocket(websocket);
  }

  setRedirecturl() {
    if (this.tournament) {
      return "/c4-local-tournament";
    }
    switch (this.mode) {
      case "remote": {
        return "/c4-remote-menu";
      }
      default: {
        return "/c4-local-menu";
      }
    }
  }

  setToken(authToken) {
    this.token = authToken;
    console.log("TOKEN IN PONG:", authToken);
  }

  setBackground() {
    const element = document.querySelector(
      ".background.background-battle.d-flex.flex-column.align-items-center",
    );
    element.style = `background-image:url('../img/forest.png');`;
  }
  setUsername(player1Name, player2Name, tournament) {
    this.player1.username = player1Name;
    this.player2.username = player2Name;
    this.tournament = tournament;
    this.redirectURL = this.setRedirecturl();
    document.getElementById("User1").innerHTML =
      `<div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar" id="leftPlayerAvatar"></div><h3 class="username-outline" style="cursor: pointer;">${this.player1.span}${this.player1.username}</span></h3>`;
    document.getElementById("User2").innerHTML =
      `</div><h3 class="username-outline" style="cursor: pointer;">${this.player2.span}${this.player2.username}</span></h3><div class="Avatar Avatar-Resize status-playing ms-3" alt="Avatar" id="rightPlayerAvatar"></div>`;
    document.getElementById("Turn").innerHTML =
      `<h3>It's ${this.player1.span}${this.player1.username}</span>'s turn!</h3>`;
  }

  getUsername() {
    console.log("Pong:getUsername");
    this.setUsernameCallBack(
      this.mode,
      this.player1.username,
      this.player2.username,
    );
  }

  handleWebSocketOpen(ev) {
    console.log("WEBSOCKET IS OPEN");
    if (this.mode == "remote") {
      // console.log("CouCOU");
      let uuid = sessionStorage.getItem("transcendence_game_id");

      const body = {
        type: "join_game",
        game_id: uuid,
        auth_key: this.token,
      };
      console.log("BODY JOIN:", body);
      this.webSocket.send(JSON.stringify(body));
    }
    this.webSocket.send(JSON.stringify({ type: "init_game" }));
    this.webSocket.send(JSON.stringify({ type: "get_config" }));
    this.startTimeout();
  }

  handleWebSocketClose(ev) {
    console.error("Socket is closed");
    this.removeC4Event();
    this.gameStart = false;
    navigateTo(this.redirectURL);
  }

  handleWebSocketError(ev) {
    console.error("Websocket fail: ", ev);
    this.removeC4Event();
    this.gameStart = false;
    navigateTo(this.redirectURL);
  }

  handleHelp(ev) {
    //nothing yet
  }

  handleGiveUp(ev) {
    //nothing yet
  }

  printMessage(data) {
    console.log(this.currentPlayer, this.player1, this.player2);
    if (data.winner !== this.currentPlayer.player) {
      this.togglePlayer();
    }
    document.getElementById("Turn").innerHTML =
      `<h3>Player ${this.currentPlayer.span}${this.currentPlayer.username}</span> wins!</h3>`;
    this.gameActive = false;
    document.getElementById("giveUpBtn").style = `display : none;`;
    document.getElementById("returnBtn").style = `display : inline;`;
  }

  togglePlayer() {
    console.log("TOGGLE");
    this.currentColor = this.currentPlayer == this.player1 ? "blue" : "red";
    this.currentPlayer =
      this.currentPlayer == this.player1 ? this.player2 : this.player1;
  }

  drawFrame(data) {
    // for (let line of data.board) {
    // console.log(line);
    // }
    for (let row = 0; row < 6; row++) {
      const line = data.board[`line_${row + 1}`].split(" ");
      for (let col = 0; col < 7; col++) {
        let color = null;
        if (line[col] == "X") {
          color = this.player1.color.toLowerCase();
        } else if (line[col] == "O") {
          color = this.player2.color.toLowerCase();
        }
        if (color !== null) {
          const cell = document.getElementById(`cell${row}-${col}`);
          cell.classList.remove("cell-empty");
          cell.classList.add(`cell-${color}`);
        } else {
          const cell = document.getElementById(`cell${row}-${col}`);
          cell.classList.remove();
          cell.classList.add(`cell`, `cell-empty`);
        }
      }
    }
    console.log("CHECK THIS", data)
    if (data.current_player !== this.currentPlayer.player) {
      this.togglePlayer();
      document.getElementById("Turn").innerHTML =
        `<h3>It's ${this.currentPlayer.span}${this.currentPlayer.username}</span>'s turn!</h3>`;
    }
  }

  handleWebSocketMessage(ev) {
    const data = JSON.parse(ev.data);
    switch (data.type) {
      case "ping": {
        this.webSocket.send(JSON.stringify({ type: "pong" }));
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
        console.log("FRAME", data);
        this.drawFrame(data);
        break;
      }
      case "timer": {
        this.showTimer(data);
        break;
      }
      case "end_state": {
        console.log("END:", data);
        this.removeC4Event();
        this.printMessage(data);
        if (this.tournament) {
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
        }
        navigateTo(this.redirectURL);
        showModal("coucou", "tu as gagnes");
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
    this.webSocket.send(JSON.stringify({ type: "ping" }));
    this.pingInterval = setTimeout(() => {
      console.error("No response from the server");
      this.webSocket.close();
    }, 2000);
  }

  handleUnloadPage(ev) {
    if (this.webSocket) {
      if (this.webSocket.readyState === WebSocket.OPEN) {
        this.webSocket.close();
      }
    }
  }
  handleStartGame(ev) {
    // console.log("CLICKED START")
    if (this.webSocket.readyState === WebSocket.OPEN && !this.gameStart) {
      this.webSocket.send(JSON.stringify({ type: "start_game" }));
      this.gameStart = true;
      document.getElementById("startBtn").style = `display : none;`;
      document.getElementById("giveUpBtn").style = `display : inline;`;
      // console.log("SENT START");
    }
  }
  addC4Event() {
    this.webSocket.addEventListener("open", this.handleWebSocketOpen);
    this.webSocket.addEventListener("close", this.handleWebSocketClose);
    this.webSocket.addEventListener("error", this.handleWebSocketError);
    this.webSocket.addEventListener("message", this.handleWebSocketMessage);
    document
      .querySelector("#startBtn")
      .addEventListener("click", this.handleStartGame);
    document
      .querySelector("#helpBtn")
      .addEventListener("click", this.handleHelp);
    document
      .querySelector("#giveUpBtn")
      .addEventListener("click", this.handleGiveUp);
    document.addEventListener("beforeunload", this.handleUnloadPage);
    document.querySelectorAll(".cell").forEach((cell, index) => {
      const col = index % this.cols;
      // console.log(col);
      cell.addEventListener("click", () =>
        this.sendPlayerMovement(this.currentPlayer.name, col),
      );
    });
  }

  removeC4Event() {
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
    const local = document.querySelector("#startBtn");
    if (local) local.addEventListener("click", this.handleStartGame);
    const helpBtn = document.querySelector("#helpBtn");
    if (helpBtn) helpBtn.removeEventListener("click", this.handleHelp);
    const giveUpBtn = document.querySelector("#giveUpBtn");
    if (giveUpBtn) giveUpBtn.removeEventListener("click", this.handleGiveUp);
    document.removeEventListener("beforeunload", this.handleUnloadPage);
    const grid = document.querySelectorAll(".cell");
    if (grid) {
      grid.forEach((cell, index) => {
        const col = index % this.cols;
        cell.removeEventListener("click", () =>
          this.sendPlayerMovement(this.currentPlayer.name, col),
        );
      });
    }
  }

  configGame(data) {
    console.log("CONFIG", data);
    this.player1.piece = data.player_1_piece;
    this.player2.piece = data.player_2_piece;
    this.player1.player = data.player_1_username;
    this.player2.player = data.player_2_username;
    if (this.mode !== "local") {
      this.player1.username = data.player_1_username;
      this.player2.username = data.player_2_username;
    }
    document.getElementById("User1").innerHTML = `<div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar" id="leftPlayerAvatar"></div><h3 class="username-outline" style="cursor: pointer;">${this.player1.span}${this.player1.username}</span></h3>`;
    document.getElementById("User2").innerHTML = `</div><h3 class="username-outline" style="cursor: pointer;">${this.player2.span}${this.player2.username}</span></h3><div class="Avatar Avatar-Resize status-playing ms-3" alt="Avatar" id="rightPlayerAvatar"></div>`;
    document.getElementById("User1").setAttribute("title", `${this.player1.username} is ${this.player1.color}`,);
    document.getElementById("User2").setAttribute("title", `${this.player2.username} is ${this.player2.color}`,);
    this.currentPlayer = this.player1.player === data.starting_player ? this.player1 : this.player2;

    document.getElementById("Turn").innerHTML = `<h3>It's ${this.currentPlayer.span}${this.currentPlayer.username}</span>'s turn!</h3>`;
    this.getUsername()
  }

  sendPlayerMovement(player, col) {
    console.log("TRYING TO SEND MOVE => Game started? ", this.gameStart);
    if (this.gameStart) {
      // console.log("SENT:", player)
      const movementData = {
        type: "put",
        player: player,
        column: col,
      };
      this.webSocket.send(JSON.stringify(movementData));
      console.info("SENT =>", movementData);
    }
  }

  showTimer(data) {
    const display = document.getElementById("displayTime");
    const time = document.getElementById("timer");
    console.log("DISPLAY =>", display)
    console.log("TIME =>", time)
    time.innerText = data.time_left;
    display.style.display = "inline-block";
  }
}
