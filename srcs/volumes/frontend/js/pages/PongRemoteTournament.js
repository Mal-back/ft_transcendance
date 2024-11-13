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
    this.refreshInterval = null;
    this.isFinished = false;
    this.handleStartNextRound = this.handleStartNextRound.bind(this);
  }
  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/tournament-local.css");
    this.createPageCss("../css/connect-remote.css");
    this.createPageCss("../css/ranking-remote-hp.css");
    this.createPageCss("../css/remote-tournament-avatar.css");
    this.createPageCss("../css/tournament-remote.css");
    this.createPageCss("../css/remote-button-tournment.css");
  }
  async getHtml() {
    this.setTitle(
      `${this.lang.getTranslation(["title", "pong"])} ${this.lang.getTranslation(["title", "remote"])} ${this.lang.getTranslation(["title", "tournament"])}`,
    );
    let html_loaded;
    try {
      html_loaded = await this.actualizeTournament();
    } catch (error) {
      this.handleCatch(error);
    }
    return `
    <div class="background" style="background-image:url('../img/ow.jpg');">
      <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
        ${this.lang.getTranslation(["title", "pong"]).toUpperCase()}-${this.lang.getTranslation(["title", "local"]).toUpperCase()}-${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</h1>
      <br>
      <div class="tournament-creation list-group ranking" id="playersTournament">
      ${html_loaded.players}
      </div>
      <div class="d-flex align-items-center justify-content-center mt-2">
        <button id="nextRoundBtn" type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button" style="display: none;">
          Next Round</button>
        <button type="button" class="btn btn-light white-txt btn-lg bg-red custom-button ms-2" data-bs-toggle="modal"
              data-bs-target="#current-round-modal">${this.lang.getTranslation(["game", "next"])} ${this.lang.getTranslation(["game", "match"])}</button>
      </div>
    </div>
    <div class="modal fade" id="next-game-modal" tabindex="-1" aria-labelledby="next-game-modalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered loading-modal-diag">
          <div class="modal-content">
              <div class="modal-body next-battle-modal-body text-center">
                ${"N"}
              </div>
              <div class="modal-footer justify-content-center">
                  <button id="startBattle" type="button" class="btn btn-secondary">${this.lang.getTranslation(["game", "start"])} ${this.lang.getTranslation(["game", "battle"])}</button>
              </div>
          </div>
      </div>
    </div>
    <div class="modal fade" id="current-round-modal" tabindex="-1" aria-labelledby="current-round-modalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered loading-modal-diag">
          <div class="modal-content">
              <div class="modal-header" id="roundTitle">${html_loaded.roundTitle}</div>
              <div class="modal-body next-battle-modal-body text-center" id="roundBody">
                ${html_loaded.round}
              </div>
          </div>
      </div>
    </div>

        `;
  }

  async getRankDivPlayer(player, rank) {
    let color;
    switch (rank) {
      case 1:
        if (!color) color = "gold";
      case 2:
        if (!color) color = "silver";
      case 3:
        if (!color) color = "bronze";
      default:
        if (!color) color = "black";
    }
    const playerAvatar = await this.getUserInfo(player.username);
    return `
        <div>
          <div class="list-group-item d-flex align-items-center justify-content-between mb-2 rounded w-100">
            <div class="d-flex align-items-center">
              <div class="ranking-number ${color}">${rank}</div>
              <div class="Avatar status-online me-3" style="background-image: url(${playerAvatar.profilePic})"></div>
              <div class="flex-fill">
                <h5 class="mb-0">${player.username}</h5>
              </div>
            </div>
            <div class="score">
              <span>${this.lang.getTranslation(["game", "win"]).toUpperCase()}: ${player.matches_won}</span>
              <br>
              <span>${this.lang.getTranslation(["game", "loss"]).toUpperCase()}: ${player.matches_lost}</span>
            </div>
          </div>
        </div>
          `;
  }

  async createPlayersDiv(data) {
    try {
      let count = 0;
      const playerDivs = await Promise.all(
        data.map(async (player) => {
          count++;
          return await this.getRankDivPlayer(player, count);
        }),
      );
      const allPlayerDivsHTML = `${playerDivs.join("")}`;
      return allPlayerDivsHTML;
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }

  getRoundDiv(round) {
    let html = "Matches: ";
    console.log(round);
    round.forEach((element) => {
      console.log(element);
      html += `${element[0]} vs ${element[1]}<br>`;
    });
    return html;
  }

  updateNextRound(urlNextRound) {
    console.log("OWNER");
    try {
      const nextRoundBtn = document.querySelector("#nextRoundBtn");
      if (urlNextRound == null) {
        nextRoundBtn.style.dispay = "none";
      } else {
        console.log("BLOCK");
        nextRoundBtn.style.display = "block";
        nextRoundBtn.dataset.redirectUrl = `${urlNextRound}`;
      }
    } catch (error) {}
  }

  async actualizeTournament() {
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/tournament/detail/",
        "GET",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        let data = await this.getDatafromRequest(response);
        console.log("data:", data);
        if (response.status == 204 || data.status != "in_progress")
          return undefined;
        const players = await this.createPlayersDiv(data.players_order);
        const roundTitle = ` Round ${data.round_number}:`;
        console.log("data.round_schule = ", data.rounds_schedule);
        const round = this.getRoundDiv(
          data.rounds_schedule[data.round_number - 1],
        );
        if (data.player_type == "Owner")
          this.updateNextRound(data.launch_next_round);
        return { players, roundTitle, round };
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async refreshTournament() {
    try {
      const data = await this.actualizeTournament();
      const playersDiv = document.querySelector("#playersTournament");
      playersDiv.innerHTML = "";
      playersDiv.innerHTML = data.players;

      const roundTitle = document.querySelector("#roundTitle");
      roundTitle.innerText = "";
      roundTitle.innerText = data.roundTitle;

      const roundBody = document.querySelector("#roundBody");
      roundBody.innerText = "";
      roundBody.innerText = data.round;
    } catch (error) {
      return error;
    }
  }

  clearTournamentInterval(ev) {
    clearInterval(this.refreshInterval);
    this.refreshInterval = null;
  }

  async setUpdateTournament() {
    let countError = 0;
    this.refreshInterval = setInterval(async () => {
      const error = await this.refreshTournament();
      if (!error) countError = 0;
      else {
        countError++;
      }
      if (countError == 5) {
        this.clearTournamentInterval();
        removeSessionStorage();
        if (error instanceof CustomError) {
          error.showModalCustom();
          navigateTo(error.redirect);
        } else console.error("startNotificationPolling: ", error);
      }
    }, 1000);
  }

  async handleStartNextRound(ev) {
    ev.preventDefault();
    try {
      const request = await this.makeRequest(
        `${ev.target.dataset.redirectUrl}`,
        "PATCH",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
      }
    } catch (error) {
      if (error instanceof CustomError) {
        error.showModalCustom();
        navigateTo(error.redirect);
      }
    }
  }

  async addEventListeners() {
    const nextRoundBtn = document.querySelector("#nextRoundBtn");
    nextRoundBtn.addEventListener("click", this.handleStartNextRound);

    try {
      if (this.isFinished == false) await this.setUpdateTournament();
    } catch (error) {
      this.handleCatch(error);
    }
  }

  removeEventListeners() {
    const nextRoundBtn = document.querySelector("#nextRoundBtn");
    if (nextRoundBtn)
      nextRoundBtn.removeEventListener("click", this.handleStartNextRound);

    this.clearTournamentInterval();
  }
}
