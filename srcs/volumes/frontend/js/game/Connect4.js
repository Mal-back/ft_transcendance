import { navigateTo } from "../router.js";

export default class Connect4 {
    constructor() {
        this.rows = 6;
        this.cols = 7;
        this.board = [];
        this.context = null;
        this.webSocket = null;
        this.mode = "local";
        this.pingInterval = null;
        this.timeout = null;
        this.gameActive = true;
        for (let i = 0; i < this.rows; i++) {
            this.board.push(Array(this.cols).fill(null));
        }
        this.gameStart = false;
        this.player1 = {
            username: "Left-Player",
            keyPressTimeout: null,
            name: "player_1",
            color: 'Red',
            span: `<span class="user1-txt">`,
        };
        this.player2 = {
            username: "Right-Player",
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

    initPong(
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

    addPongEvent() {
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
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const col = index % cols;
            cell.addEventListener('click', () => placePiece(col));
        });
        document.removeEventListener("beforeunload", this.handleUnloadPage);
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const col = index % cols;
            cell.removeEventListener('click', this.placePiece(col));
        });
    }

    configGame(data) {
        console.log(data);
    }

    updateUI(row, col) {
        const cell = document.getElementById(`cell${row}-${col}`);
        cell.classList.remove('cell-empty');
        cell.classList.add(`cell-${currentColor}`);
        const theme = document.getElementById('theme');

        // Toggle between light.css and dark.css
        if (theme.getAttribute('href') == '../../css/connect4/hover-red.css') {
            theme.setAttribute('href', '../../css/connect4/hover-blue.css');
        } else {
            theme.setAttribute('href', '../../css/connect4/hover-red.css');
        }
    }

    togglePlayer() {
        this.currenColor = this.currentPlayer == this.player1 ? 'blue' : 'red';
        this.currentPlayer = this.currentPlayer == this.player1 ? this.player2 : this.player1;
    }

    checkDirection(row, col, rowIncrement, colIncrement) {
        let count = 0;
        for (let dir of [-1, 1]) {
            let r = row, c = col;
            while (true) {
                r += dir * rowIncrement;
                c += dir * colIncrement;
                if (r < 0 || r >= rows || c < 0 || c >= cols || this.board[r][c] !== this.currentPlayer.username) break;
                count++;
            }
        }
        return count >= 3; // We already have the current cell, so we just need 3 more
    }

    checkWin(row, col) {
        return this.checkDirection(row, col, 1, 0) ||  // Horizontal
            this.checkDirection(row, col, 0, 1) ||  // Vertical
            this.checkDirection(row, col, 1, 1) ||  // Diagonal down-right
            this.checkDirection(row, col, 1, -1);   // Diagonal down-left
    }

    placePiece(col) {
        if (!this.gameActive) return;
        // Find the lowest empty row in the clicked column
        console.log(col);
        for (let row = this.rows - 1; row >= 0; row--) {
            if (!this.board[row][col]) {
                this.board[row][col] = this.currentPlayer.username;
                updateUI(row, col);
                if (this.checkWin(row, col)) {
                    document.getElementById('Turn').innerHTML = `<h3>Player ${this.currentPlayer.span}${this.currentPlayer.username}</span> wins!</h3>`;
                    gameActive = false;
                } else {
                    this.togglePlayer();
                    document.getElementById('Turn').innerHTML = `<h3>It's ${this.currentPlayer.span}${this.currentPlayer.username}</span>'s turn!</h3>`;
                }
                return;
            }
        }
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
