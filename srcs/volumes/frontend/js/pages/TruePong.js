import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Create new user");
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-battle.css");
  }

  async getHtml() {
    //get websocket
    //load page with background game, bars at the y center, ball center x,y
    //
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
    const canvas = document.getElementById("ongoing-game");
    const context = canvas.getContext("2d");

    const header = document.querySelector("#header");
    const headerHeight = header ? header.offsetHeight : 0;
    canvas.width = (window.innerWidth * 0.95) / 2; // 95% of the viewport width
    canvas.height = (window.innerHeight - headerHeight) / 2; // 99% of the viewport height

    const scaleFactor = window.devicePixelRatio || 1;
    console.log("SCALE FACTOR:", scaleFactor);
    canvas.width *= scaleFactor;
    canvas.height *= scaleFactor;
    context.scale(scaleFactor, scaleFactor);

    // const leftPaddleImg = new Image();
    // leftPaddleImg.src = "../../img/left-paddle.png";
    // const rightPaddleImg = new Image();
    // rightPaddleImg.src = "../../img/right-paddle.png";
    //
    // const paddleHeight = canvas.height * 0.15;
    // const paddleWidth = canvas.width * 0.025;
    //
    // const paddleOffset = canvas.height * 0.05;
    // const leftPaddle = {
    //   x: paddleOffset,
    //   y: canvas.height / 2 - paddleHeight / 2,
    // };
    // const rightPaddle = {
    //   x: canvas.width - paddleWidth - paddleOffset,
    //   y: canvas.height / 2 - paddleHeight / 2,
    // };
    //
    // const ball = {
    //   x: canvas.width / 2,
    //   y: canvas.height / 2,
    //   radius: (canvas.height + canvas.width) / 100,
    // };
    //
    // let leftScore = 0;
    // let rightScore = 0;
    //
    //
    // function drawPaddles() {
    //       context.drawImage(
    //         leftPaddleImg,
    //         leftPaddle.x,
    //         leftPaddle.y,
    //         paddleWidth,
    //         paddleHeight,
    //       );
    //       context.drawImage(
    //         rightPaddleImg,
    //         rightPaddle.x,
    //         rightPaddle.y,
    //         paddleWidth,
    //         paddleHeight,
    //       );
    //     }
    //
    //     function drawBall() {
    //       context.fillStyle = "white";
    //       context.beginPath();
    //       context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    //       context.fill();
    //       context.closePath();
    //     }

    // Variables for scaling
    let scaleX = 1;
    let scaleY = 1;

    // Set default paddles and ball values (they'll be updated from the server)
    let leftPaddle = { x: 0, y: 0, width: 0, height: 0 };
    let rightPaddle = { x: 0, y: 0, width: 0, height: 0 };
    let ball = { x: 0, y: 0, radius: 0 };
    let serverGameWidth = 0;
    let serverGameHeight = 0;

    // Draw functions (apply scaling to server-sent coordinates)
    //

    function drawPaddles() {
      console.log("drawPaddles");
      context.fillStyle = "red";
      // Scale paddle positions and sizes using the scale factors
      context.fillRect(
        Math.floor(leftPaddle.x * scaleX),
        Math.floor(leftPaddle.y * scaleY),
        Math.floor(leftPaddle.width * scaleX),
        Math.floor(leftPaddle.height * scaleY),
      );
      console.log(
        `LeftPaddle: ${leftPaddle.x * scaleX}, ${leftPaddle.y * scaleY}`,
      );
      // context.fillRect(
      //   Math.floor(rightPaddle.x * scaleX),
      //   Math.floor(rightPaddle.y * scaleY),
      //   Math.floor(rightPaddle.width * scaleX),
      //   Math.floor(rightPaddle.height * scaleY),
      // );
      context.fillRect(
        333,
        63,
        rightPaddle.width * scaleX,
        rightPaddle.height * scaleY,
      );
      console.log(
        `RightPaddle: ${rightPaddle.x * scaleX}, ${rightPaddle.y * scaleY}`,
      );
    }

    function drawBall() {
      context.fillStyle = "white";
      context.beginPath();
      // Scale ball position and radius using the scale factors
      context.arc(
        ball.x * scaleX,
        ball.y * scaleY,
        ball.radius * scaleX, // Scale radius with scaleX (assuming a uniform scale)
        0,
        Math.PI * 2,
        false,
      );
      console.log(`ball: ${ball.x * scaleX}, ${ball.y * scaleY}`);
      context.fill();
      context.closePath();
    }
    function draw() {
      console.log("DRAW");
      console.log("Canvas z-index:", window.getComputedStyle(canvas).zIndex);
      console.log(
        "Canvas width:",
        canvas.width,
        "Canvas height:",
        canvas.height,
      );
      if (canvas.checkVisibility() == false) {
        console.log("NO CANVAS");
      }
      context.clearRect(
        0,
        0,
        canvas.width / scaleFactor,
        canvas.height / scaleFactor,
      );
      drawPaddles();
      drawBall();
      // updateScore();
    }
    const websocket = new WebSocket(`ws://localhost:8080/api/game/ws/14845 `);

    websocket.addEventListener(`open`, (ev) => {
      console.log("Websocket is opened");
      // const body = JSON.stringify({ type: "start_game" });
      // websocket.send(body);
    });

    let gameStart = false;
    // let player1keyPressTimeout = null;
    // let player2keyPressTimeout = null;

    const player2 = {
      player2keyPressTimeout: null,
      name: "player_2",
      upPressed: false,
      downPressed: false,
    };
    const player1 = {
      player1keyPressTimeout: null,
      name: "player_1",
      upPressed: false,
      downPressed: false,
    };

    function sendPlayerMovement(player, directionPlayer) {
      const movementData = {
        player: player,
        direction: directionPlayer,
      };
      websocket.send(JSON.stringify(movementData));
    }

    function throttleMovement(player, direction) {
      if (player == "player_1") {
        if (!player1.player1keyPressTimeout) {
          player1.player1keyPressTimeout = setTimeout(() => {
            sendPlayerMovement(player1.name, direction);
            if (player1.upPressed || player1.downPressed) {
              throttleMovement(player1.name, direction);
            } else {
              player1.player1keyPressTimeout = null;
            }
          }, 100);
        }
      } else {
        if (!player2.player2keyPressTimeout) {
          player2.player2keyPressTimeout = setTimeout(() => {
            sendPlayerMovement(player2.name, direction);
            if (player2.upPressed || player2.downPressed) {
              throttleMovement(player2.name, direction);
            } else {
              player2.player2keyPressTimeout = null;
            }
          }, 100);
        }
      }
    }

    let counter = 0;
    let intervalId = null;
    websocket.addEventListener("message", (ev) => {
      console.log("MessageSocket: ", ev.data);
      if (gameStart == false) {
        const gameState = JSON.parse(ev.data);

        serverGameWidth = gameState.Dimensions.board_len;
        serverGameHeight = gameState.Dimensions.board_height;

        scaleX = canvas.width / serverGameWidth;
        scaleY = canvas.height / serverGameHeight;

        console.log("scaleX", scaleX);
        console.log("scaleY", scaleY);
        leftPaddle = {
          x: gameState.player_1[0],
          y: gameState.player_1[1],
          width: gameState.Dimensions.pad_len * 2,
          height: gameState.Dimensions.pad_height * 2,
        };

        console.log("leftPaddle", leftPaddle);
        rightPaddle = {
          x: gameState.player_2[0],
          y: gameState.player_2[1],
          width: gameState.Dimensions.pad_len * 2,
          height: gameState.Dimensions.pad_height * 2,
        };

        console.log("leftPaddle", rightPaddle);
        ball = {
          x: gameState.ball[0],
          y: gameState.ball[1],
          radius: gameState.Dimensions.ball_size,
        };

        console.log("ball", ball);
        gameStart = true;
        draw();
        // const body = JSON.stringify({ type: "start_game" });
        // websocket.send(body);
      } else if (counter < 5) {
        let updateGame = JSON.parse(ev.data);

        console.log("Message Socket: ", ev.data);
        leftPaddle = {
          x: updateGame.player_1.position[0],
          y: updateGame.player_1.position[1],
        };
        console.log(
          `leftPaddle: x = ${updateGame.player_1.position[0]}, y = ${updateGame.player_1.position[1]}`,
        );
        rightPaddle = {
          x: updateGame.player_2.position[0],
          y: updateGame.player_2.position[1],
        };
        ball = {
          x: updateGame.ball.position[0],
          y: updateGame.ball.position[1],
        };
        counter++;
        draw();
        // intervalId = setInterval(draw, 1000 / 60);
        // requestAnimationFrame(() => this.pongGame());
      }
    });

    websocket.addEventListener("close", (ev) => {
      // if (intervalId) {
      //   clearInterval(intervalId);
      // }

      console.log("websocket is closed");
    });

    websocket.addEventListener("error", (ev) => {
      // if (intervalId) {
      //   clearInterval(intervalId);
      // }
      console.error("Error in websocket: ", ev);
    });

    document.addEventListener("click", (ev) => {
      console.log("click");
      const canvas = document.getElementById("ongoing-game");
      const isClickInsideCanvas = canvas.contains(ev.target);
      if (isClickInsideCanvas) {
        console.log("gameStart", gameStart);
        const body = gameStart
          ? JSON.stringify({ type: "start_game" })
          : JSON.stringify({ type: "init_game" });
        console.log("Sent:", body);
        websocket.send(body);
      } else {
        console.log("Click outside canvas");
      }
    });

    document.addEventListener("keydown", (ev) => {
      if ((ev.key === "w" || ev.key === "W") && !player1.upPressed) {
        player1.upPressed = true;
        throttleMovement(player1.name, "UP");
      }
      if (ev.key === 38 && !player2.upPressed) {
        player2.upPressed = true;
        throttleMovement(player2.name, "UP");
      }
      if ((ev.key === "s" || ev.key === "S") && !player1.downPressed) {
        player1.downPressed = true;
        throttleMovement(player1.name, "DOWN");
      }
      if (ev.key === 40 && !player2.downPressed) {
        player2.downPressed = true;
        throttleMovement(player2.name, "DOWN");
      }
    });

    document.addEventListener("keyup", (ev) => {
      if (ev.key === "w" || ev.key === "W") {
        player1.upPressed = false;
      }
      if (ev.key === "s" || ev.key === "S") {
        player1.downPressed = false;
      }
      if (ev.key === 38) player2.upPressed = false;
      if (ev.key === 40) {
        player2.downPressed = false;
      }
    });

    window.addEventListener("beforeunload", function (event) {
      // Close the WebSocket connection when the page is about to be unloaded
      console.log("HERE");
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
        console.log("WebSocket connection closed before page unload.");
      }
    });
  }
}
