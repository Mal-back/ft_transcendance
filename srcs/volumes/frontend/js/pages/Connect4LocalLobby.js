import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import {
  removeSessionStorage,
  setSessionStorage,
  showModal,
} from "../Utils/Utils.js";
import CustomError from "../Utils/CustomError.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.playerInputs = [];
    this.handleGeneratePlayers = this.handleGeneratePlayers.bind(this);
    this.handleValidatePlayerInput = this.handleValidatePlayerInput.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/tournament-local.css");
  }

  async getHtml() {
    this.setTitle(
      `${this.lang.getTranslation(["title", "c4"])} ${this.lang.getTranslation(["title", "lobby"])}`,
    );
    return `
      <div class="background removeElem"  style="background-image:url('../img/forest.png');">
        <h1 class="removeElem mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
          ${this.lang.getTranslation(["title", "c4"]).toUpperCase()} - ${this.lang.getTranslation(["title", "local"]).toUpperCase()} - ${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</h1>
        <br>
        <div class="tournament-creation removeElem">
        <div class="text-white text-center mv-80 removeElem">
          <div class="removeElem">
            <h5 class="form-label removeElem" id="SelectPlayersTitle">${this.lang.getTranslation(["game", "selectNbPlayer"])}</h5>
            <input class="removeElem" type="number" id="usernameCount" class="form-control" min="3" max="10" value="3">
          </div>
        </div>
        <div id="usernameTemplates" class="mt-4 mv-80 removeElem">
          <div id="usernameScroll" class="mt-2 removeElem">
            <div class="username-input removeElem" id="username1-input"><label for="username1">${this.lang.getTranslation(["game", "player"])} 1:</label>
              <input name="username1" type="text" id="username1" class="form-control removeElem" placeholder="${this.lang.getTranslation(["game", "player"])} 1">
              <div id="username1Error" class="removeElem"></div>
            </div>
            <div class="username-input removeElem" id="username2-input"><label for="username2">${this.lang.getTranslation(["game", "player"])} 2:</label>
              <input name="username2" type="text" id="username2" class="form-control removeElem" placeholder="${this.lang.getTranslation(["game", "player"])} 2">
              <div id="username2Error" class="removeElem"></div>
            </div>
            <div class="username-input removeElem" id="username3-input"><label for="username3">${this.lang.getTranslation(["game", "player"])} 3:</label>
              <input name="username3" type="text" id="username3" class="form-control removeElem" placeholder="${this.lang.getTranslation(["game", "player"])} 3">
              <div id="username3Error" class="removeElem"></div>
            </div>
          </div>
        </div>
        <div class="text-center mv-80 removeElem">
          <button id="startGameBtn" class="btn btn-success mt-3 removeElem">${this.lang.getTranslation(["game", "start"])}</button>
        </div>
      </div>
              `;
  }

  createPlayerDiv(count) {
    return `
    <div id="username${count}-input" class="username-input removeElem"><label for="username${count}">${this.lang.getTranslation(["game", "player"])} ${count}:</label><input name="username${count}" type="text"
      id="username${count}" class="removeElem form-control" placeholder="${this.lang.getTranslation(["game", "player"])} ${count}">
      <div id="username${count}Error" class="removeElem"></div>
    </div>
            `;
  }

  async checkLogin() {
    try {
      const username = sessionStorage.getItem("username_transcendence");
      if (username) {
        const error = await this.fetchNotifications();
        if (error instanceof CustomError) {
          throw new CustomError(
            `${this.lang.getTranslation(["modal", "title", "error"])}`,
            `${this.lang.getTranslation(["modal", "message", "authError"])}`,
          );
        }
      }
    } catch (error) {
      removeSessionStorage();
      this.handleCatch(error);
    }
  }

  checkUnique(playerName) {
    let count = 0;
    this.playerInputs.forEach((input) => {
      if (input.value == playerName) count++;
    });
    return count == 1;
  }

  validatePlayerInput(target) {
    const errorDiv = document.querySelector(`#${target.id}Error`);
    let errorMessage = "";
    errorDiv.innerHTML = "";
    if (target.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
    } else if (!this.sanitizeInput(target.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "invalidChar"])}`;
    } else if (!this.checkUnique(target.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "unique"])}`;
    }
    if (errorMessage) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = "red";
      errorDiv.style.fontStyle = "italic";
    }
    errorDiv.classList.add("removeElem");
    return errorMessage;
  }

  handleValidatePlayerInput(ev) {
    this.validatePlayerInput(ev.target);
  }

  cleanUpPlayersInput() {
    if (this.playerInputs) {
      this.playerInputs.forEach((input) => {
        input.value = "";
        let inputError = document.querySelector(`#${input.id}Error`);
        inputError.innerText = "";
        input.removeEventListener("input", this.handleValidatePlayerInput);
      });
      this.playerInputs = [];
    }
  }

  handleGeneratePlayers() {
    this.cleanUpPlayersInput();
    const countInput = document.getElementById("usernameCount");
    let count = parseInt(countInput.value);
    if (isNaN(count) || count < 3) {
      countInput.value = 3;
      count = 3;
    }
    if (count > 10) {
      count = 10;
      countInput.value = 10;
    }
    const playerArray = document.createElement("div");
    for (let i = 0; i < count; i++) {
      playerArray.innerHTML += this.createPlayerDiv(i + 1);
    }
    const scroll = document.getElementById("usernameScroll");
    scroll.innerHTML = "";
    scroll.innerHTML = playerArray.innerHTML;
    const inputs = scroll.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("input", this.handleValidatePlayerInput);
      this.playerInputs.push(input);
    });
  }

  setPlayersName() {
    const maxRound =
      this.playerInputs.length % 2 == 0
        ? this.playerInputs.length - 1
        : this.playerInputs.length;
    const playerValues = Array.from(this.playerInputs).map(
      (input) => input.value,
    );

    function players() {
      const players = playerValues.reduce((acc, playerName, index) => {
        acc[`player${index + 1}`] = {
          name: playerName,
          win: 0,
          loss: 0,
          winRate: 0,
          rank: index + 1,
        };
        return acc;
      }, {});
      return players;
    }

    function teams() {
      const playerList = Object.values(players());
      const n = playerList.length;
      const mid = Math.floor(n / 2);

      const firstHalf = playerList.slice(0, mid);
      const secondHalf = playerList.slice(mid, n);

      if (n % 2 !== 0) {
        firstHalf.push(undefined);
      }

      return [firstHalf, secondHalf];
    }

    const playersTemp = teams();
    const tournament = {
      PlayerA: playersTemp[0],
      PlayerB: playersTemp[1],
      round: {
        current: 0,
        max: maxRound,
        currentMatch: 0,
      },
    };
    sessionStorage.setItem(
      "tournament_transcendence_local",
      JSON.stringify(tournament),
    );
  }

  handleStartGame(ev) {
    ev.preventDefault();
    let isValid = true;
    this.playerInputs.forEach((input) => {
      if (this.validatePlayerInput(input)) isValid = false;
    });
    if (!isValid) return;
    this.setPlayersName();
    navigateTo("/c4-local-tournament");
  }

  async addEventListeners() {
    const generateBtn = document.getElementById("usernameCount");
    generateBtn.addEventListener("input", this.handleGeneratePlayers);
    generateBtn.addEventListener("change", this.handleGeneratePlayers);

    const scroll = document.getElementById("usernameScroll");
    const inputs = scroll.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("input", this.handleValidatePlayerInput);
      this.playerInputs.push(input);
    });
    const startGameBtn = document.querySelector("#startGameBtn");
    startGameBtn.addEventListener("click", this.handleStartGame);
  }

  removeEventListeners() {
    const generateBtn = document.getElementById("usernameCount");
    if (generateBtn) {
      generateBtn.removeEventListener("input", this.handleGeneratePlayers);
      generateBtn.removeEventListener("change", this.handleGeneratePlayers);
    }
    const startGameBtn = document.querySelector("#startGameBtn");
    if (startGameBtn)
      startGameBtn.removeEventListener("click", this.handleStartGame);
    this.cleanUpPlayersInput();
  }
}
