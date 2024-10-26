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
    this.setTitle("Pong Lobby");
    this.handleShowFriendsModal = this.handleShowFriendsModal.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/tournament-local.css");
  }

  async getHtml() {
    try {
      return `
      <div class="background ">
        <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
          PONG - REMOTE - TOURNAMENT</h1>
        <br>
        <div class="tournament-creation ranking ">
          <div class=" text-center text-white  rounded">
            <h3 class="form-label text-decoration-underline" id="SelectPlayersTitle">Invite Friend:</h3>
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="Friend's username"
                aria-label="Recipient's username" aria-describedby="basic-addon2">
              <div class="input-group-append">
                <button class="btn btn-outline-primary" type="submit">Invite</button>
              </div>
            </div>
            <button type="button" class="btn btn-light white-txt btn-lg bg-green custom-button"
              style="max-height: 6vh; min-height: 50px; margin-bottom: 0px;"
                id="friend-list">Friends</button>
          </div>
        </div>
        <br>
        <h3 class="form-label text-center text-white text-decoration-underline" id="SelectPlayersTitle">
          Players:</h3>
        <div class="tournament-creation list-group ranking" style="margin-bottom: 0px;">
          <div>
            <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
              <div class="d-flex align-items-center">
                <div class="ranking-number gold">1</div>
                <div class="Avatar status-online me-3"></div>
                <div class="flex-fill">
                  <h5 class="mb-0">USERNAME</h5>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
              <div class="d-flex align-items-center">
                <div class="ranking-number black">2</div>
                <div class="Avatar status-online me-3"></div>
                <div class="flex-fill">
                  <h5 class="mb-0">USERNAME2</h5>
                </div>
              </div>
              <button class="btn btn-sm btn-danger ms-auto"><i class="bi bi-x-circle"></i>
                Remove</button>
            </div>
          </div>
          <div class="d-flex align-items-center justify-content-center mt-2">
            <button type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button"
              style="max-height: 6vh; min-height: 50px; margin-bottom: 0; margin-top: 10px;"
              id="startTournamentBtn">Start
              Tournament</button>
          </div>
        </div>
      </div>
                      `;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        showModal(this.lang.getTranslation(["modal", "error"], error.message));
        console.error("PongRemoteLobby:GetHtml:", error);
      }
    }
  }

  async addEventListeners() {
    const startTournamentBtn = document.querySelector("#startTournamentBtn");
    startTournamentBtn.addEventListener("click", this.handleStartTournament);

    const showFriends = document.querySelector("#friend-list");
    showFriends.addEventListener("click", this.handleShowFriendsModal);
  }
}
