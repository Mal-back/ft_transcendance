import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Create new user");
    this.canvas = null;
    this.context = null;

    this.leftPaddle = { x: 0, y: 0, width: 0, height: 0, dy: 0 };
    this.rightPaddle = { x: 0, y: 0, width: 0, height: 0, dy: 0 };
    this.ball = { x: 0, y: 0, radius: 0, dx: 2, dy: 2 };
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

  handleKeyDown(event) {
    if (event.key === "s" || event.key === "S") {
      console.log("PRESS KEY S");
      this.updateGameState(); // Update game state on S key press
    }
  }

  handleKeyUp(event) {
    // Stop paddles when the key is released (optional)
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      console.log("PRESS KEY ARROW");
      this.leftPaddle.dy = 0;
    }
  }

  updateGameState() {
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    if (
      this.ball.y + this.ball.radius > this.canvas.height ||
      this.ball.y - this.ball.radius < 0
    ) {
      this.ball.dy = -this.ball.dy;
    }

    // Bounce this.ball off paddles
    if (
      this.ball.x - this.ball.radius <
        this.leftPaddle.x + this.leftPaddle.width &&
      this.ball.y > this.leftPaddle.y &&
      this.ball.y < this.leftPaddle.y + this.leftPaddle.height
    ) {
      this.ball.dx = -this.ball.dx; // Reverse this.ball direction
    }

    if (
      this.ball.x + this.ball.radius > this.rightPaddle.x &&
      this.ball.y > this.rightPaddle.y &&
      this.ball.y < this.rightPaddle.y + this.rightPaddle.height
    ) {
      this.ball.dx = -this.ball.dx; // Reverse this.ball direction
    }

    // Reset this.ball if it goes off-screen
    if (this.ball.x < 0 || this.ball.x > this.canvas.width) {
      this.ball.x = 400; // Reset to center
      this.ball.y = 200;
      this.ball.dx = 2; // Reset this.ball direction
      this.ball.dy = 2;
    }
    this.draw();
  }

  draw() {
    console.log("DRAW");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "blue";
    this.context.fillRect(
      this.leftPaddle.x,
      this.leftPaddle.y,
      this.leftPaddle.width,
      this.leftPaddle.height,
    );
    this.context.fillStyle = "red";
    this.context.fillRect(
      this.rightPaddle.x,
      this.rightPaddle.y,
      this.rightPaddle.width,
      this.rightPaddle.height,
    );

    this.context.beginPath();
    this.context.arc(
      this.ball.x,
      this.ball.y,
      this.ball.radius,
      0,
      Math.PI * 2,
    );
    this.context.fillStyle = "green";
    this.context.fill();
    this.context.closePath();
  }

  pongGame() {
    this.canvas = document.getElementById("ongoing-game");
    const computedStyle = window.getComputedStyle(this.canvas);
    console.log(`canvas.width = ${parseFloat(computedStyle.width)}`);
    console.log(`canvas.height = ${parseFloat(computedStyle.height)}`);
    this.canvas.width = parseFloat(computedStyle.width);
    this.canvas.height = parseFloat(computedStyle.height);

    this.leftPaddle = {
      x: this.canvas.width * 0.1,
      y: this.canvas.height * 0.5,
      width: this.canvas.width * 0.05,
      height: this.canvas.height * 0.1,
      dy: 0,
    };

    this.rightPaddle = {
      x: this.canvas.width * 0.9,
      y: this.canvas.height * 0.5,
      width: this.canvas.width * 0.05,
      height: this.canvas.height * 0.1,
      dy: 0,
    };
    this.ball = {
      x: this.canvas.width * 0.5,
      y: this.canvas.height * 0.5,
      radius: this.canvas.height * 0.05,
      dx: 2,
      dy: 2,
    };
    this.context = this.canvas.getContext("2d");
    this.draw();
  }

  async addEventListeners() {
    document.addEventListener("keydown", (ev) => this.handleKeyDown(ev));
    document.addEventListener("keyup", (ev) => this.handleKeyUp(ev));
  }
  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    // if (button) {
    // console.info("removing event click on button : " + button.innerText);
    // button.removeEventListener("click", this.loginEvent);
    // }

    document.querySelectorAll('[data-link="view"]').forEach((button) => {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleClick);
    });
  }

  removeCss() {
    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.remove();
    });
  }
  destroy() {
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
  }
}
