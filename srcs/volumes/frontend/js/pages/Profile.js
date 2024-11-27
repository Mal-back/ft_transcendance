import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";
import {
  removeSessionStorage,
  showModal,
  formateDate,
} from "../Utils/Utils.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.handleSettingButton = this.handleSettingButton.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-profile.css");
  }


  async loadUserData() {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest(`/api/users/${username}/`, "GET");
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const userData = await response.json();
        return userData;
      }
      return null;
    } catch (error) {
      this.handleCatch(error);
    }
  }


  async createMatchElement(data, userData) {
    try {
      const boolWin = userData.username == data.winner ? true : false;
      const opponentName = boolWin ? data.looser : data.winner;
      const opponentInfo = await this.getUserInfo(opponentName);
      const color = boolWin ? "bg-dark" : "bg-gray";
      let lostWin = boolWin
        ? this.lang.getTranslation(["game", "won"]).toUpperCase()
        : this.lang.getTranslation(["game", "lost"]).toUpperCase();
      lostWin += "-";
      lostWin = boolWin
        ? this.lang.getTranslation(["game", "won"]).toUpperCase()
        : this.lang.getTranslation(["game", "lost"]).toUpperCase();
      return `
  <div class="${color} text-white text-center px-3 py-1 mb-1 rounded">
    <div class="d-flex justify-content-around align-items-center">
      <div class="text-center player-container">
        <div class="player-circle mx-auto mb-2" style="background-image: url('${userData.profilePic}')"></div>
        <div class="player-name">
          <span>${userData.username}</span>
        </div>
      </div>
      <div class="text-center match-info">
        <h5>${lostWin}</h5> 
        <h4>${boolWin ? data.winner_points : data.looser_points} - ${boolWin ? data.looser_points : data.winner_points}</h4>
        <p id="matchDate">${formateDate(data.played_at)}</p>
      </div>
        <div class="text-center player-container">
          <div class="player-circle mx-auto mb-2" style="background-image: url('${opponentInfo.profilePic}')"></div>
          <div class="player-name">
            <span>${opponentName}</span>
          </div>
        </div>
      </div>
    </div> 
          `;
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }


  async getMatchHistory(userData, gameType) {
    const mainDiv = document.createElement("div");
    try {
      const mainRequest = await this.makeRequest(
        `/api/history/match/?username=${userData.username}&game_type=` + gameType,
      );
      const mainResponse = await fetch(mainRequest);
      if (await this.handleStatus(mainResponse)) {
        const data = await this.getDatafromRequest(mainResponse);

        let matchesArray = data.results;
        const matchesHTMLArray = await Promise.all(
          matchesArray.map((matchData) =>
            this.createMatchElement(matchData, userData),
          ),
        );
        mainDiv.innerHTML = matchesHTMLArray.join("");
        let nextPage = data.next;
        while (nextPage) {
          const request = await this.makeRequest(nextPage, "GET");
          const response = await fetch(request);
          if (await this.handleStatus(response)) {
            const pageData = await response.json();
            matchesArray = pageData.results;
            const newMatchHtmlArray = await Promise.all(
              matchesArray.map((matchData) =>
                this.createMatchElement(matchData, userData),
              ),
            );
            mainDiv.innerHTML += newMatchHtmlArray.join("");
            nextPage = pageData.next;
          } else {
            break;
          }
        }
        return mainDiv.innerHTML;
      }
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }


  async createTournamentElement(data, userData) {
    try {
      const color = "bg-midnightblue";
      const rank = data.final_ranking.findIndex(user => user.username === userData.username) + 1;
      const total_ranks = data.final_ranking.length;
      return `
  <div class="${color} text-white text-center px-3 py-1 mb-1 rounded">
    <div class="d-flex justify-content-around align-items-center">
      <div class="text-center player-container mt-1">
        <div class="player-circle mx-auto mb-2" style="background-image: url('${userData.profilePic}')"></div>
        <div class="player-name">
          <span>${userData.username}</span>
        </div>
      </div>
      <div class="text-center match-info mt-1">
          <h4 style="margin-bottom: 0;">${this.lang.getTranslation(["title", "rank"]).toUpperCase()}: ${rank} / ${total_ranks}</h4>
          <button class="btn text-decoration-none text-white color text-decoration-underline"
            style="cursor: text; user-select: text; border: none; background: none;">
            ${formateDate(data.played_at)}
          </button>
      </div>
      </div>
    </div> 
          `;
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }


  async getTournamentHistory(userData, gameType) {
    const mainDiv = document.createElement("div");
    try {
      const mainRequest = await this.makeRequest(
        `/api/history/tournament/?username=${userData.username}&game_type=` + gameType,
      );
      const mainResponse = await fetch(mainRequest);
      if (await this.handleStatus(mainResponse)) {
        const data = await this.getDatafromRequest(mainResponse);

        let tournamentsArray = data.results;
        const tournamentsHTMLArray = await Promise.all(
          tournamentsArray.map((tournamentData) =>
            this.createTournamentElement(tournamentData, userData),
          ),
        );
        mainDiv.innerHTML = tournamentsHTMLArray.join("");
        let nextPage = data.next;
        while (nextPage) {
          const request = await this.makeRequest(nextPage, "GET");
          const response = await fetch(request);
          if (await this.handleStatus(response)) {
            const pageData = await response.json();
            tournamentsArray = pageData.results;
            const newTournamentHtmlArray = await Promise.all(
              tournamentsArray.map((matchData) =>
                this.createTournamentElement(matchData, userData),
              ),
            );
            mainDiv.innerHTML += newTournamentHtmlArray.join("");
            nextPage = pageData.next;
          } else {
            break;
          }
        }
        return mainDiv.innerHTML;
      }
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["title", "profile"])}`);
    let userData = null;
    try {
      userData = await this.loadUserData();
      const battleHistory =
        this.lang.getTranslation(["game", "gameHistory"]);

      let fillModalMatchPong = await this.getMatchHistory(userData, "pong");
      if (!fillModalMatchPong)
        fillModalMatchPong = `<p class="text-center">${this.lang.getTranslation(["game", "n/a"])}</p>`;

      let fillModalMatchC4 = await this.getMatchHistory(userData, "c4");
      if (!fillModalMatchC4)
        fillModalMatchC4 = `<p class="text-center">${this.lang.getTranslation(["game", "n/a"])}</p>`;

      let fillModalTournamentPong = await this.getTournamentHistory(userData, "pong");
      if (!fillModalTournamentPong)
        fillModalTournamentPong = `<p class="text-center">${this.lang.getTranslation(["game", "n/a"])}</p>`;

      let fillModalTournamentC4 = await this.getTournamentHistory(userData, "c4");
      if (!fillModalTournamentC4)
        fillModalTournamentC4 = `<p class="text-center">${this.lang.getTranslation(["game", "n/a"])}</p>`;

      const winRatePong = userData.total_single_games_pong
        ? `${userData.single_games_pong_win_rate * 100} %`
        : `${this.lang.getTranslation(["game", "n/a"])}`;

      const winRateC4 = userData.total_single_games_c4
        ? `${userData.single_games_c4_win_rate * 100} %`
        : `${this.lang.getTranslation(["game", "n/a"])}`;

      const htmlContent = `
<div class="background">
  <div class="mt-4 text-white d-flex justify-content-center align-items-center">
    <h3>${this.lang.getTranslation(["title", "profile"]).toUpperCase()}</h3>
  </div>
  <div class="Profile container box-gold">
    <div class="d-flex justify-content-center w-100">
      <div
        class="top-profile d-flex flex-column justify-content-center align-items-center"
      >
        <div class="rounded-circle Avatar status-playing" alt="Avatar" style="background-image: url(${userData.profilePic})"></div>
        <h5 class="black-txt text-decoration-underline">
          ${userData.username}
        </h5>
      </div>
    </div>

    <div class="align-items-left mt-3 w-100">
      <div class="d-flex row justify-content-center align-items-center box">
        <p class="black-txt">
          ${this.lang.getTranslation(["game", "winRate"])} ${this.lang.getTranslation(["title", "pong"])}:<span id="winRatePong"> ${winRatePong}</span>
        </p>
        <p class="black-txt">
          ${this.lang.getTranslation(["title", "pong"])} : ${battleHistory}:
          <span
            ><button
              class="text-decoration-none text-primary color"
              data-bs-toggle="modal"
              data-bs-target="#pongBattleHistoryModal"
            >
              ${this.lang.getTranslation(["button", "show"]).toUpperCase()}
            </button></span
          >
        </p>
      </div>
      <div class="d-flex row justify-content-center align-items-center box">
        <p class="black-txt">
          ${this.lang.getTranslation(["game", "winRate"])} ${this.lang.getTranslation(["title", "c4"])}: <span id="winRateConnect4">${winRateC4}</span>
        </p>
        <p class="black-txt">
          ${this.lang.getTranslation(["title", "c4"])} : ${battleHistory}:
          <span
            ><button
              class="text-decoration-none text-primary color"
              data-bs-toggle="modal"
              data-bs-target="#connect4BattleHistoryModal"
            >
              ${this.lang.getTranslation(["button", "show"]).toUpperCase()}
            </button></span
          >
        </p>
      </div>
    </div>
    <div class="align-items-right mt-3 w-100">
      <a type="button" class="btn bg-lightgray" id="settingsButton">${this.lang.getTranslation(["title", "settings"])}</a>
    </div>
  </div>
</div>

<div
  class="modal fade"
  id="pongBattleHistoryModal"
  tabindex="-1"
  aria-labelledby="termsOfUseModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-lg modal-80 modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="pongBattleHistoryModal">
          ${this.lang.getTranslation(["title", "pong"])} : ${battleHistory}
        </h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body overflow-auto" style="max-height: 70vh">
        <div class="row justify-content-center align-items-start">
          <div class="col-6">
            <h5 class="text-center mb-3">${this.lang.getTranslation(["title", "remoteBattle"])} :</h5>
            <div class="box bg-light history">
              ${fillModalMatchPong}
            </div>
          </div>
          <div class="col-6">
            <h5 class="text-center mb-3">${this.lang.getTranslation(["title", "remoteTournament"])} :</h5>
            <div class="box bg-light history">
            ${fillModalTournamentPong}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          ${this.lang.getTranslation(["button", "close"])}
        </button>
      </div>
    </div>
  </div>
</div>
<div
  class="modal fade"
  id="connect4BattleHistoryModal"
  tabindex="-1"
  aria-labelledby="termsOfUseModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-lg modal-80 modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="connect4BattleHistoryModal">
          ${this.lang.getTranslation(["title", "c4"])} : ${battleHistory}
        </h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body overflow-auto" style="max-height: 70vh">
        <div class="row justify-content-center align-items-start">
          <div class="col-6">
            <h5 class="text-center mb-3">${this.lang.getTranslation(["title", "remoteBattle"])} :</h5>
            <div class="box bg-light history">
			${fillModalMatchC4}
            </div>
          </div>
          <div class="col-6">
            <h5 class="text-center mb-3">${this.lang.getTranslation(["title", "remoteTournament"])} :</h5>
            <div class="box bg-light history">
            ${fillModalTournamentC4}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          ${this.lang.getTranslation(["button", "close"])}
        </button>
      </div>
    </div>
  </div>
</div>
`;
      return htmlContent;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  handleSettingButton(ev) {
    ev.preventDefault();
    navigateTo("/settings");
  }

  async addEventListeners() {
    const button = document.querySelector("#settingsButton");
    if (button) {
      button.addEventListener("click", this.handleSettingButton);
    }
  }

  removeEventListeners() {
    const button = document.querySelector("#settingsButton");
    if (button) {
      button.removeEventListener("click", this.handleSettingButton)
    }
  }
}
