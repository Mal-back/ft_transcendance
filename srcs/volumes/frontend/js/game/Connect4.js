import { navigateTo } from "../router.js";
import { getIpPortAdress } from "../Utils/Utils.js";

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
            name: "player_1",
            color: 'Red',
            span: `<span class="user1-txt">`,
            piece: "X",
        };
        this.player2 = {
            username: "Evermore",
            keyPressTimeout: null,
            name: "player_2",
            color: 'Blue',
            span: `<span class="user2-txt">`,
            piece: "0",
        };
        this.currentPlayer = this.player1;
        this.currenColor = 'red';
        this.handleWebSocketOpen = this.handleWebSocketOpen.bind(this);
        this.handleWebSocketClose = this.handleWebSocketClose.bind(this);
        this.handleWebSocketError = this.handleWebSocketError.bind(this);
        this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);
        this.sendPlayerMovement = this.sendPlayerMovement.bind(this);
        this.handleUnloadPage = this.handleUnloadPage.bind(this);
        this.setUsernameCallBack = setUsernameCallBack;
    }

    initC4(
        canvas = "ongoing-game",
        websocket = `wss://${getIpPortAdress()}/api/game/c4-local/join/`,
        mode = "local",
        token = null,
    ) {
        // this.canvas = document.getElementById(canvas);
        // this.context = this.canvas.getContext("2d");
        this.mode = mode;
        this.token = token;
        console.log("COUCOU");
        this.redirectURL = this.setRedirecturl();
        document.getElementById('User1').innerHTML = `<h3 class="username-outline" style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#playerModal1">${this.player1.span}${this.player1.username}</span></h3>`
        document.getElementById('User2').innerHTML = `<h3 class="username-outline" style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#playerModal2">${this.player2.span}${this.player2.username}</span></h3>`
        document.getElementById('User1').setAttribute('title', `${this.player1.username} is ${this.player1.color}`);
        document.getElementById('User2').setAttribute('title', `${this.player2.username} is ${this.player2.color}`);
        document.getElementById('user1-modal').innerHTML = `<p>${this.player1.username} is <span class="user1-txt">${this.player1.color}</span></p>`;
        document.getElementById('user2-modal').innerHTML = `<p>${this.player2.username} is <span class="user2-txt">${this.player2.color}</span></p>`;
        document.getElementById("Turn").innerHTML = `<h3>It's ${this.player1.span}${this.player1.username}</span>'s turn!</h3>`;
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

    setUsername(player1Name, player2Name, tournament) {
        this.player1.username = player1Name;
        this.player2.username = player2Name;
        this.tournament = tournament;
        this.redirectURL = this.setRedirecturl();
    }

    getUsername() {
        console.log("Pong:getUsername");
        this.setUsernameCallBack(
            this.mode,
            this.player1.username,
            this.player2.username,
            this.currentPlayer.username
        );
    }

    handleWebSocketOpen(ev) {
        console.log("WEBSOCKET IS OPEN");
        if (this.mode == "remote") {
            console.log("CouCOU");
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

    printMessage(data) {
        if (data.currentPlayer !== this.currentPlayer.player) {
            this.togglePlayer();
            this.updateUI();
        }
        document.getElementById('Turn').innerHTML = `<h3>Player ${currentPlayer.span}${currentPlayer.username}</span> wins!</h3>`;
        gameActive = false;
    }


    togglePlayer() {
        this.currenColor = this.currentPlayer == this.player1 ? 'blue' : 'red';
        this.currentPlayer = this.currentPlayer == this.player1 ? this.player2 : this.player1;
    }

    updateUI() {
        const theme = document.getElementById('theme');
        if (theme.getAttribute('href') == '../../css/connect4/hover-red.css') {
            theme.setAttribute('href', '../../css/connect4/hover-blue.css');
        } else {
            theme.setAttribute('href', '../../css/connect4/hover-red.css');
        }
    }


    drawFrame(data) {
        console.log(data)
        if (data.currentPlayer !== this.currentPlayer.player) {
            this.togglePlayer();
            this.updateUI();
        }
        for (let row = 0; row < 6; row++) {
            const line = data.board[`line${row + 1}`].split(" ");
            for (let col = 0; col < 6; col++) {
                let color = null;
                if (line[col] == "X") {
                    color = this.player1.color.toLowerCase();
                }
                else if (line[col] == "0") {
                    color = this.player2.color.toUpperCase()
                }
                if (col !== null) {
                    const cell = document.getElementById(`cell${row}-${col}`);
                    cell.classList.remove('cell-empty');
                    cell.classList.add(`cell-${color}`);
                }
                else {
                    const cell = document.getElementById(`cell${row}-${col}`);
                    cell.classList.remove();
                    cell.classList.add(`cell`, `cell-empty`);
                }
            }
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
            }
            case "config": {
                this.configGame(data);
                break;
            }
            case "frame": {
                this.drawFrame(data);
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

    addC4Event() {
        this.webSocket.addEventListener("open", this.handleWebSocketOpen);
        this.webSocket.addEventListener("close", this.handleWebSocketClose);
        this.webSocket.addEventListener("error", this.handleWebSocketError);
        this.webSocket.addEventListener("message", this.handleWebSocketMessage);
        document.addEventListener("beforeunload", this.handleUnloadPage);
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const col = index % this.cols;
            cell.addEventListener('click', this.sendPlayerMovement(col));
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
        document.removeEventListener("beforeunload", this.handleUnloadPage);
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const col = index % this.cols;
            cell.removeEventListener('click', this.sendPlayerMovement(col));
        });
    }


    configGame(data) {
        console.log(data);
        this.player1.piece = data.player1_piece;
        this.player2.piece = data.player2_piece;
        this.player1.username = data.player1;
        this.player2.username = data.player2;
    }


    sendPlayerMovement(player, col) {
        if (this.webSocket.readyState === WebSocket.OPEN) {
            console.log(player)
            const movementData = {
                type: "put",
                player: player,
                column: col
            };
            this.webSocket.send(JSON.stringify(movementData));
            console.info("Sent", movementData);
        }
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
