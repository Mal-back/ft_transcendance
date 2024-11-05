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
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-profile.css");
  }

  removeEventListeners() {
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
    this.removeEventListeners();
    this.removeCss();
  }

  async loadUserData() {
    const username = sessionStorage.getItem("username_transcendence");
    console.log("username = ", username);
    try {
      const request = await this.makeRequest(`/api/users/${username}`, "GET");
      const response = await fetch(request);
      if (response.ok) {
        const userData = await response.json();
        console.log("userData", userData);
        return userData;
      } else {
        const log = await this.getErrorLogfromServer(response);
        console.debug(log);
        return null;
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.debug("Error: ", error);
      throw error;
    }
  }

  async createMatchElement(data, userData) {
    try {
      const boolWin = userData.username == data.winner ? true : false;
      const opponentName = boolWin ? data.looser : data.winner;
      const opponentInfo = await this.getUserInfo(opponentName);
      const color = boolWin ? "bg-dark" : "bg-gray";
      return `
<!-- match div -->
  <div class="${color} text-white text-center px-3 py-1 mb-1 rounded">
    <div class="d-flex justify-content-around align-items-center">
      <!-- Player 1 -->
      <div class="text-center player-container">
        <div class="player-circle mx-auto mb-2" style="background-image: url('${opponentInfo.profilePic}')"></div>
        <div class="player-name">
          <span>${userData.username}</span>
        </div>
      </div>
      <!-- Match Info -->
      <div class="text-center match-info">
        <h5>${boolWin ? "WON-LOST" : "LOST-WON"}</h5> 
        <h4>${boolWin ? data.winner_points : data.looser_points} - ${boolWin ? data.looser_points : data.winner_points}</h4>
        <p id="matchDate">${formateDate(data.played_at)}</p>
      </div>
        <!-- Player 2 -->
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
      if (error instanceof CustomError) throw error;
      else {
        console.error("MatchElement", error);
        return "";
      }
    }
  }
  async pongMatchHistory(userData) {
    const mainDiv = document.createElement("div");
    try {
      const mainRequest = await this.makeRequest(
        `/api/history/match/?username=${userData.username}`,
      );
      const mainResponse = await fetch(mainRequest);
      if (!mainResponse.ok) {
        console.error("pongMatchHistory: ", mainResponse);
        const dataError = await this.getErrorLogfromServer(mainResponse);
        console.error("pongMatchHistory: ", dataError);
        return;
      }
      console.log("pongMatchHistory: response", mainResponse);
      const data = await this.getErrorLogfromServer(mainResponse, true);
      console.log("pongMatchHistory: data", data);

      let matchesArray = data.results;
      const matchesHTMLArray = await Promise.all(
        matchesArray.map((matchData) =>
          this.createMatchElement(matchData, userData),
        ),
      );
      mainDiv.innerHTML = matchesHTMLArray.join("");
      console.log("mainDiv first fill: ");
      let nextPage = data.next;
      while (nextPage) {
        const request = await this.makeRequest(nextPage, "GET");
        const response = await fetch(request);
        if (response.ok) {
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
          const log = await this.getErrorLogfromServer(response);
          console.error(log);
          break;
        }
      }
      return mainDiv.innerHTML;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("pongMatchHistory:", error);
        return "";
      }
    }
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["title", "profile"])}`);
    let userData = null;
    try {
      userData = await this.loadUserData();
    } catch (error) {
      throw error;
    }
    const battleHistory =
      this.lang.getTranslation(["title", "pong"]) +
      " " +
      this.lang.getTranslation(["game", "battle"]) +
      " " +
      this.lang.getTranslation(["game", "history"]);
    const fillModal = await this.pongMatchHistory(userData);
    const winRatePong = userData.total_games
      ? `${userData.single_games_win_rate * 100} %`
      : `n/a`;
    const winRateC4 = userData.total_games
      ? `${userData.single_games_win_rate * 100} %`
      : `n/a`;
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
          ${this.lang} Pong: <span id="winRatePong">${winRatePong}</span>
        </p>
        <p class="black-txt">
          Pong Battle History:
          <span
            ><button
              class="text-decoration-none text-primary color"
              data-bs-toggle="modal"
              data-bs-target="#pongBattleHistoryModal"
            >
              SHOW
            </button></span
          >
        </p>
      </div>
      <div class="d-flex row justify-content-center align-items-center box">
        <p class="black-txt">
          Win Rate Connect4: <span id="winRateConnect4">${winRateC4}</span>
        </p>
        <p class="black-txt">
          Connect4 Battle History:
          <span
            ><button
              class="text-decoration-none text-primary color"
              data-bs-toggle="modal"
              data-bs-target="#connect4BattleHistoryModal"
            >
              SHOW
            </button></span
          >
        </p>
      </div>
    </div>
    <div class="align-items-right mt-3 w-100">
      <a type="button" class="btn bg-lightgray" id="settingsButton">Settings</a>
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
          Pong Battle History
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
            <h5 class="text-center mb-3">Remote Battles :</h5>
            <div class="box bg-light history">
              <!-- match div -->
              ${fillModal}
            </div>
          </div>
          <div class="col-6">
            <h5 class="text-center mb-3">Remote Tournaments :</h5>
            <div class="box bg-light">
              <p class="text-center">n/a</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Close
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
          Connect4 Battle History
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
            <h5 class="text-center mb-3">Remote Battles :</h5>
            <div class="box bg-light history">
              <p class="text-center">n/a</p>
            </div>
          </div>
          <div class="col-6">
            <h5 class="text-center mb-3">Remote Tournaments :</h5>
            <div class="box bg-light">
              <!-- match div -->
              <div
                class="bg-dark text-white text-center px-3 py-1 mb-1 rounded"
              >
                <div class="d-flex justify-content-around align-items-center">
                  <!-- Player 1 -->
                  <div class="text-center player-container">
                    <div class="player-circle mx-auto mb-2"></div>
                    <div class="player-name">
                      <span>coucouuuuuuuuuuuuuuuu</span>
                    </div>
                  </div>
                  <!-- Match Info -->
                  <div class="text-center match-info">
                    <h5>WIN-LOSE</h5>
                    <h4>1 - 0</h4>
                    <p id="matchDate">DATE</p>
                  </div>
                  <!-- Player 2 -->
                  <div class="text-center player-container">
                    <div class="player-circle mx-auto mb-2"></div>
                    <div class="player-name">
                      <span>helloooooooooooo</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- match div -->
              <div
                class="bg-gray text-white text-center px-3 py-1 mb-1 rounded"
              >
                <div class="d-flex justify-content-around align-items-center">
                  <!-- Player 1 -->
                  <div class="text-center player-container">
                    <div class="player-circle mx-auto mb-2"></div>
                    <div class="player-name">
                      <span>coucouuuuuuuuuuuuuuuu</span>
                    </div>
                  </div>
                  <!-- Match Info -->
                  <div class="text-center match-info">
                    <h5>WIN-LOSE</h5>
                    <h4>1 - 0</h4>
                    <p id="matchDate">DATE</p>
                  </div>
                  <!-- Player 2 -->
                  <div class="text-center player-container">
                    <div class="player-circle mx-auto mb-2"></div>
                    <div class="player-name">
                      <span>helloooooooooooo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Close
        </button>
      </div>
    </div>
  </div>
</div>
`;
    return htmlContent;
  }

  async addEventListeners() {
    const button = document.querySelector("#settingsButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        navigateTo("/settings");
      });
    }
  }

  removeEventListeners() {
    const button = document.querySelector("#settingsButton");
    if (button) {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.loginEvent);
    }
    document.querySelectorAll('[data-link="view"]').forEach((button) => {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleClick);
    });
  }
}
