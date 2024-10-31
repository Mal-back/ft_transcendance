import { navigateTo } from "../router.js";

export default class Connect4 {
    constructor() {
        this.rows = 6;
        this.cols = 7;
        this.context = null;
        this.webSocket = null;
        this.mode = "local";
        this.pingInterval = null;
        this.timeout = null;
        this.gameActive = true;
        this.gameStart = false;
        this.player1 = {
            player: "player_1",
            username: "Folklore",
            keyPressTimeout: null,
            name: "player_1",
            color: 'Red',
            span: `<span class="user1-txt">`,
        };
        this.player2 = {
            player: "player_2",
            username: "Evermore",
            keyPressTimeout: null,
            name: "player_2",
            color: 'Blue',
            span: `<span class="user2-txt">`,
        };
        this.currentPlayer = this.player1;
        this.currenColor = 'red';
        this.handleWebSocketOpen = this.handleWebSocketOpen.bind(this);
        this.handleWebSocketClose = this.handleWebSocketClose.bind(this);
        this.handleWebSocketError = this.handleWebSocketError.bind(this);
        this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);
        this.placePiece = this.placePiece.bind(this);
        this.handleUnloadPage = this.handleUnloadPage.bind(this);
    }

    initC4(
        canvas = "ongoing-game",
        websocket = `wss://localhost:8080/api/game/c4-local/join/`,
        mode = "local",
    ) {
        this.canvas = document.getElementById(canvas);
        this.mode = mode;
        this.context = this.canvas.getContext("2d");
        this.webSocket = new WebSocket(websocket);
        document.getElementById('User1').innerHTML = `<h3 class="username-outline" style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#playerModal1">${p1.span}${p1.username}</span></h3>`
        document.getElementById('User2').innerHTML = `<h3 class="username-outline" style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#playerModal2">${p2.span}${p2.username}</span></h3>`
        document.getElementById('User1').setAttribute('title', `${p1.username} is ${p1.color}`);
        document.getElementById('User2').setAttribute('title', `${p2.username} is ${p2.color}`);
        document.getElementById('user1-modal').innerHTML = `<p>${p1.username} is <span class="user1-txt">${p1.color}</span></p>`;
        document.getElementById('user2-modal').innerHTML = `<p>${p2.username} is <span class="user2-txt">${p2.color}</span></p>`;
        document.getElementById("Turn").innerHTML = `<h3>It's ${p1.span}${p1.username}</span>'s turn!</h3>`;
    }

    setUsername(player1Name, player2Name, tournament) {
        this.player1.username = player1Name;
        this.player2.username = player2Name;
        this.tournament = tournament;
    }

    getUsername() {
        return {
            mode: this.mode,
            User1: this.player1.username,
            User2: this.player2.username,
            UserTurn: this.currentPlayer.username
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
        this.removeC4Event();
        this.gameStart = false;
        if (this.mode == "tournament_local") {
            navigateTo("/pong-local-tournament");
        }
    }

    handleWebSocketError(ev) {
        console.error("Websocket fail: ", ev);
        this.removeC4Event();
        this.gameStart = false;
    }

    printMessage() {
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
                this.printMessage();
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
                    navigateTo("/c4-local-tournament");
                }
                this.removeC4Event();
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

    addC4Event() {
        this.webSocket.addEventListener("open", this.handleWebSocketOpen);
        this.webSocket.addEventListener("close", this.handleWebSocketClose);
        this.webSocket.addEventListener("error", this.handleWebSocketError);
        this.webSocket.addEventListener("message", this.handleWebSocketMessage);
        document.addEventListener("beforeunload", this.handleUnloadPage);
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const col = index % cols;
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
            const col = index % cols;
            cell.removeEventListener('click', this.placePiece(col));
        });
    }


    configGame(data) {
        console.log(data);
    }


    sendPlayerMovement(player, col) {
        const movementData = {
            type: "move",
            player: player,
            col: col
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
