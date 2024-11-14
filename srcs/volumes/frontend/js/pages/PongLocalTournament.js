import { navigateTo } from "../router.js";
import { showModal, removeSessionStorage } from "../Utils/Utils.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.tournament = null;
    this.handleStartGame = this.handleStartGame.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/tournament-local.css");
    this.createPageCss("../css/connect-local.css");
    this.createPageCss("../css/ranking-tournament.css");
  }

  async checkLogin() {
    const username = sessionStorage.getItem("username_transcendence");
    if (username) {
      try {
        if ((await this.fetchNotifications()) === undefined) {
          throw new CustomError(
            `${this.lang.getTranslation(["modal", "title", "error"])}`,
            `${this.lang.getTranslation(["modal", "message", "authError"])}`,
          );
        }
      } catch (error) {
        removeSessionStorage();
        this.handleCatch(error);
      }
    }
  }

  async getHtml() {
    this.setTitle(
      `${this.lang.getTranslation(["title", "pong"])} ${this.lang.getTranslation(["title", "local"])} ${this.lang.getTranslation(["title", "tournament"])}`,
    );
    let listPlayer = null;
    try {
      this.actualizeTournament();
      listPlayer = this.getListPlayer();
    } catch (error) {
      this.handleCatch(error);
    }
    return `
    <div class="background" style="background-image:url('../img/ow.jpg');">
      <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
        ${this.lang.getTranslation(["title", "pong"]).toUpperCase()}-${this.lang.getTranslation(["title", "local"]).toUpperCase()}-${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</h1>
      <br>
      <div class="tournament-creation list-group ranking">
      ${listPlayer}
      </div>
      <div class="d-flex align-items-center justify-content-center mt-2">
        <button type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button" data-bs-toggle="modal"
              data-bs-target="#next-game-modal">${this.lang.getTranslation(["game", "next"])} ${this.lang.getTranslation(["game", "match"])}</button>
      </div>
    </div>
    <div class="modal fade" id="next-game-modal" tabindex="-1" aria-labelledby="next-game-modalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered loading-modal-diag">
          <div class="modal-content">
              <div class="modal-body next-battle-modal-body text-center">
                  ${this.getNextMatch()}
              </div>
              <div class="modal-footer justify-content-center">
                  <button id="startBattle" type="button" class="btn btn-secondary">${this.lang.getTranslation(["game", "start"])} ${this.lang.getTranslation(["game", "battle"])}</button>
              </div>
          </div>
      </div>
    </div>
        `;
  }

  updateRank() {
    const listPlayer = [];
    this.tournament.PlayerA.forEach((element) => {
      if (element != undefined) listPlayer.push(element);
    });
    this.tournament.PlayerB.forEach((element) => {
      if (element != undefined) listPlayer.push(element);
    });
    listPlayer.sort((a, b) => b.winRate - a.winRate);
    for (let index = 0; index < listPlayer.length; index++) {
      const current = listPlayer[index];
      current.rank = index + 1;

      const playerIndexInA = this.tournament.PlayerA.findIndex(
        (player) => player && player.name === current.name,
      );
      if (playerIndexInA !== -1) {
        this.tournament.PlayerA[playerIndexInA].rank = current.rank;
      }
      const playerIndexInB = this.tournament.PlayerB.findIndex(
        (player) => player && player.name === current.name,
      );
      if (playerIndexInB !== -1) {
        this.tournament.PlayerB[playerIndexInB].rank = current.rank;
      }
    }
  }

  getNextMatch() {
    console.log(this.tournament.round.currentMatch);
    if (this.tournament.round.current == this.tournament.round.max) {
      return `<h4> <strong>${this.lang.getTranslation(["title", "tournament"])} ${this.lang.getTranslation(["modal", "message", "over"])}</strong></h4>
              <br>
              <h5><strong>${this.lang.getTranslation(["modal", "message", "clickNewTourn"])}</strong></h5>
             `;
    }
    return `
  <strong role="text">${this.tournament.PlayerA[this.tournament.round.currentMatch].name}</strong>
  <br>
  <strong role="text">VS</strong>
  <br>
  <strong role="text">${this.tournament.PlayerB[this.tournament.round.currentMatch].name}</strong>
          `;
  }

  handleStartGame(ev) {
    ev.preventDefault();
    if (this.tournament.round.current == this.tournament.round.max) {
      sessionStorage.removeItem("tournament_transcendence_local");
      navigateTo("/pong-local-lobby");
      return;
    }
    sessionStorage.setItem(
      "tournament_transcendence_local",
      JSON.stringify(this.tournament),
    );
    this.tournament = null;
    navigateTo("/pong?connection=local&mode=tournament");
  }

  getPlayerByRank(count) {
    let nextPlayerRank = null;
    for (let i = 0; i < this.tournament.PlayerA.length; i++) {
      if (
        this.tournament.PlayerA[i] &&
        this.tournament.PlayerA[i].rank === count
      ) {
        nextPlayerRank = this.tournament.PlayerA[i];
        break;
      } else if (
        this.tournament.PlayerB[i] &&
        this.tournament.PlayerB[i].rank === count
      ) {
        nextPlayerRank = this.tournament.PlayerB[i];
        break;
      }
    }
    return nextPlayerRank;
  }
  getNextRankDivPlayer(count) {
    const nextPlayerRank = this.getPlayerByRank(count);
    let color;
    switch (count) {
      case 1:
        if (!color) color = "gold";
      case 2:
        if (!color) color = "silver";
      case 3:
        if (!color) color = "bronze";
      default:
        if (!color) color = "black";
    }
    if (nextPlayerRank == null) return "";
    return `
        <div>
          <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
            <div class="d-flex align-items-center">
              <div class="ranking-number ${color}">${nextPlayerRank.rank}</div>
              <div class="Avatar status-online me-3"></div>
              <div class="flex-fill">
                <h5 class="mb-0">${nextPlayerRank.name}</h5>
              </div>
            </div>
            <div class="score">
              <span>${this.lang.getTranslation(["game", "win"]).toUpperCase()}: ${nextPlayerRank.win}</span>
              <br>
              <span>${this.lang.getTranslation(["game", "loss"]).toUpperCase()}: ${nextPlayerRank.loss}</span>
            </div>
          </div>
        </div>
          `;
  }

  getListPlayer() {
    const divList = document.createElement("div");
    divList.innerHTML = "";
    for (let count = 1; count <= this.tournament.PlayerA.length * 2; count++) {
      divList.innerHTML += this.getNextRankDivPlayer(count);
    }
    return divList.innerHTML;
  }

  rotatePlayers() {
    const immovable = this.tournament.PlayerA.shift();
    const toPushInB = this.tournament.PlayerA.pop();
    const toPushInA = this.tournament.PlayerB.shift();
    this.tournament.PlayerA.unshift(toPushInA);
    this.tournament.PlayerA.unshift(immovable);
    this.tournament.PlayerB.push(toPushInB);
  }

  getNextRound() {
    this.tournament.round.current++;
    this.tournament.round.currentMatch = 0;
    this.rotatePlayers();
  }

  skipByeMatch() {
    const playerA = this.tournament.PlayerA;
    const playerB = this.tournament.PlayerB;
    while (
      !playerA[this.tournament.round.currentMatch] ||
      !playerB[this.tournament.round.currentMatch]
    ) {
      this.tournament.round.currentMatch += 1;
      if (this.tournament.round.currentMatch >= this.tournament.PlayerA.length)
        this.getNextRound();
      if (this.tournament.round.current >= this.tournament.round.max) break;
    }
  }

  actualizeTournament() {
    this.tournament = JSON.parse(
      sessionStorage.getItem("tournament_transcendence_local"),
    );
    if (!this.tournament) {
      throw new CustomError(
        `${this.lang.getTranslation(["modal", "title", "error"])}`,
        `${this.lang.getTranslation(["modal", "message", "failTournament"])}`,
        "/pong-local-lobby",
      );
    }
    this.updateRank();
    this.skipByeMatch();
    if (this.tournament.round.currentMatch >= this.tournament.PlayerA.length)
      this.getNextRound();
    if (this.tournament.round.current >= this.tournament.round.max) {
      showModal(
        `${this.lang.getTranslation(["moda", "title", "congrats"])}`,
        `${this.getPlayerByRank(1).name} ${this.lang.getTranslation(["modal", "message", "wonTournament"])}`,
      );
      sessionStorage.removeItem("tournament_transcendence_local");
      return;
    }
  }

  async addEventListeners() {
    const startGameButton = document.querySelector("#startBattle");
    if (startGameButton)
      startGameButton.addEventListener("click", this.handleStartGame);
  }

  removeEventListeners() {
    const startGameButton = document.querySelector("#startBattle");
    if (startGameButton)
      startGameButton.removeEventListener("click", this.handleStartGame);
  }
}
