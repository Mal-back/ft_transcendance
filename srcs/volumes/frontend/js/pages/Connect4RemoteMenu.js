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

    this.matchMakingInterval = null;

    this.handleRemoteTournamentRedirection =
      this.handleRemoteTournamentRedirection.bind(this);
    this.handleShowInviteModal = this.handleShowInviteModal.bind(this);
    this.handleMatchRemote = this.handleMatchRemote.bind(this);
    this.handleInputOpponent = this.handleInputOpponent.bind(this);
    this.handleShowMatchmakingModal =
      this.handleShowMatchmakingModal.bind(this);
    // this.handleUnloadQueue = this.handleUnloadQueue.bind(this);
    this.redirectToGame = this.redirectToGame.bind(this);
    this.handleStopMatchmaking = this.handleStopMatchmaking.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
  }

  async getHtml() {
    this.setTitle(
      `${this.lang.getTranslation(["title", "pong"])} ${this.lang.getTranslation(["title", "remote"])}`,
    );
    return `
      <div class="background removeElem">
        <div class=" removeElem custom-container d-flex flex-column justify-content-center align-items-center">
          <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
            ${this.lang.getTranslation(["title", "c4"]).toUpperCase()} - ${this.lang.getTranslation(["title", "remote"]).toUpperCase()}</h1>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
            id="Connect4RemotePlayButton">${this.lang.getTranslation(["game", "play"]).toUpperCase()}</button>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-maroon custom-button" data-bs-toggle="modal" data-bs-target="#loading-modal"
            id="C4MatchmakingButton">${this.lang.getTranslation(["title", "matchmaking"]).toUpperCase()}</button>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
            id="Connect4RemoteTournamentButton">${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</button>
          <br>
        </div>
      </div>
      <div class="modal fade" id="inviteC4Modal" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="inviteModalLabel">${this.lang.getTranslation(["game", "inviteMatch"])}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="text" id="opponentUsername" class="form-control" placeholder="${this.lang.getTranslation(["input", "preview", "opponent"])}">
              <div id="opponentUsernameError"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="inviteButton">${this.lang.getTranslation(["button", "invite"])}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="loading-modal" tabindex="-1" aria-labelledby="loading-modalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered loading-modal-diag">
          <div class="modal-content">
            <div class="modal-body loading-modal-body">
              <div class="d-flex align-items-center justify-content-center">
                <strong role="status">${this.lang.getTranslation(["game", "loading"])}...</strong>
                <div class="spinner-border ms-2" aria-hidden="true"></div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="stopMatchmaking">${this.lang.getTranslation(["button", "stop"])}
                ${this.lang.getTranslation(["title", "matchmaking"])}</button>
            </div>
          </div>
        </div>
      </div>
  <div class="modal fade" id="matchFoundModal" tabindex="-1" aria-labelledby="matchFoundModalLabel"
    aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered loading-modal-diag">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="matchFoundTitle">${this.lang.getTranslation(["game", "match"])}
              ${this.lang.getTranslation(["game", "found"])}!</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex align-items-center justify-content-center row">
              <img id="opponentMatchFoundAvatar" class="rounded-circle Avatar" max-width="50px"
                max-height="50px">
              <div class="text-center mx-3">
                <h5><strong id="opponentMatchFoundId"></strong></h5>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="matchFoundJoin">
              ${this.lang.getTranslation(["button", "join"]).toUpperCase()}
            </button>
          </div>
        </div>
      </div>
  </div>
              `;
  }

  handleRemoteTournamentRedirection(ev) {
    ev.preventDefault();
    navigateTo("/c4-remote-lobby");
  }

  handleShowInviteModal(ev) {
    ev.preventDefault();
    const modalId = document.getElementById("inviteC4Modal");
    console.log(modalId);
    let inviteModal = bootstrap.Modal.getInstance(modalId);
    if (!inviteModal) inviteModal = new bootstrap.Modal(modalId);
    inviteModal.show();
  }

  validateOpponentName(opponentInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#opponentUsernameError");
    errorDiv.innerHTML = "";
    if (opponentInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
    } else if (!this.sanitizeInput(opponentInput.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "invalidChar"])}`;
    }
    if (errorMessage) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = "red";
      errorDiv.style.fontStyle = "italic";
    }
    errorDiv.classList.add("removeElem");
    return errorMessage;
  }

  async handleMatchRemote(ev) {
    ev.preventDefault();
    const opponent = document.querySelector("#opponentUsername");
    if (this.validateOpponentName(opponent)) return;
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/match/create/",
        "POST",
        { player2: opponent.value, game_type: "c4" },
      );
       const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        const modalInviteMatchId = document.getElementById("inviteC4Modal");
        const modalElemInvite = bootstrap.Modal.getInstance(modalInviteMatchId);
        modalElemInvite.hide();
        const buttonOnGoingGame = document.querySelector("#buttonOnGoingGame");
        buttonOnGoingGame.innerText = `${this.lang.getTranslation(["button", "cancel"])}`;
        buttonOnGoingGame.dataset.redirectUrl = `/api/matchmaking/match/${data.id}/delete/`;
      }
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      } else {
        console.error("PongRemoteMenu:handleMatchRemote:", error);
      }
    }
  }

  handleInputOpponent(ev) {
    ev.preventDefault();
    this.validateOpponentName(document.querySelector("#opponentUsername"));
  }

  async fetchMatchmakingQueue() {
    try {
      const request = await this.makeRequest(
        `/api/matchmaking/matchmaking/get_match/`,
        "POST",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        if (response.status == 204) return;

        clearInterval(this.matchMakingInterval);
        this.matchMakingInterval = null;
        const modalLoadingDiv = document.querySelector("#loading-modal");
        const modalLoading = bootstrap.Modal.getInstance(modalLoadingDiv);
        modalLoading.hide();

        if (response.status == 409) return;
        // console.log("success matchmaking/get_match:response", response);
        const data = await this.getDatafromRequest(response);
        this.showModalMatch(data);
        // console.log("success matchmaking/get_match:data", data);
      }

      clearInterval(this.matchMakingInterval);
      this.matchMakingInterval = null;

      const modalLoadingDiv = document.querySelector("#loading-modal");
      const modalLoading = bootstrap.Modal.getInstance(modalLoadingDiv);
      modalLoading.hide();
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async showModalMatch(data) {
    try {
      const modalLoadingDiv = document.querySelector("#loading-modal");
      const modalLoading = bootstrap.Modal.getInstance(modalLoadingDiv);
      modalLoading.hide();

      clearInterval(this.matchMakingInterval);
      this.matchMakingInterval = null;

      const modalMatchFoundDiv = document.querySelector("#matchFoundModal");
      let modalMatchFound = bootstrap.Modal.getInstance(modalMatchFoundDiv);
      if (!modalMatchFound)
        modalMatchFound = new bootstrap.Modal(modalMatchFoundDiv);

      const opponentId = document.querySelector("#opponentMatchFoundId");
      const username = sessionStorage.getItem("username_transcendence");
      const opponent = username == data.player1 ? data.player2 : data.player1;
      opponentId.innerText = opponent;

      const dataOpponent = await this.getUserInfo(opponent);
      const opponentAvatar = document.querySelector(
        "#opponentMatchFoundAvatar",
      );
      opponentAvatar.style = `background-image: url(${dataOpponent.profilePic})`;

      const joinButton = document.getElementById("matchFoundJoin");
      joinButton.dataset.gameId = data.matchId;
      modalMatchFound.show();
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async joinMatchmakingQueue() {
    try {
      const request = await this.makeRequest(
        `/api/matchmaking/matchmaking/join/`,
        "POST",
        { game_type: "pong" },
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        if (response.status == 204) return true;
        const data = await this.getDatafromRequest(response);
        return true;
      }
      return false;
    } catch (error) {
      this.handleCatch(error);
      return false;
    }
  }

  async handleShowMatchmakingModal(ev) {
    ev.preventDefault();
    try {
      const modalMatchmakingDiv = document.querySelector("#loading-modal");
      const modalMatchmaking = bootstrap.Modal.getInstance(modalMatchmakingDiv);
      if (!modalMatchmaking) {
        modalMatchmaking = new bootstrap.Modal(modalMatchmakingDiv, {
          backdop: "static",
          keyboard: false,
        });
      } else {
        modalMatchmaking._config.backdrop = "static";
        modalMatchmaking._config.keyboard = false;
      }
      modalMatchmaking.show();
      if ((await this.joinMatchmakingQueue()) == false) return;
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      } else console.error("startNotificationPolling: ", error);
      return;
    }
    if (!this.matchMakingInterval) {
      this.matchMakingInterval = setInterval(async () => {
        try {
          await this.fetchMatchmakingQueue();
        } catch (error) {
          clearInterval(this.matchMakingInterval);
          this.matchMakingInterval = null;
          if (error instanceof CustomError) {
            showModal(error.title, error.message);
            navigateTo(error.redirect);
          } else console.error("handleShowMatchmakingModal: ", error);
        }
      }, 500);
    }
  }

  async leaveMatchmakingQueue() {
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/matchmaking/leave/",
        "DELETE",
      );
      const response = await fetch(request);
      console.log("leaveMatchmakingQueue: response", response);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        console.log("leaveMatchmakingQueue: data", data);
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async handleStopMatchmaking(ev) {
    ev.preventDefault();
    if (this.matchMakingInterval) {
      clearInterval(this.matchMakingInterval);
      this.matchMakingInterval = null;
    }
    const modalMatchmakingDiv = document.querySelector("#loading-modal");
    const modalMatchmaking = bootstrap.Modal.getInstance(modalMatchmakingDiv);
    if (modalMatchmaking) modalMatchmaking.hide();
    try {
      await this.leaveMatchmakingQueue();
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      } else {
        console.error("handleStopMatchmaking:", error);
      }
    }
  }

  redirectToGame(ev) {
    ev.preventDefault();
    sessionStorage.setItem(
      "transcendence_game_id",
      ev.currentTarget.dataset.gameId,
    );
    navigateTo("/pong?connection=remote");
  }

  async addEventListeners() {
    const playButton = document.querySelector("#Connect4RemotePlayButton");
    playButton.addEventListener("click", this.handleShowInviteModal);
    const tournament = document.querySelector(
      "#Connect4RemoteTournamentButton",
    );
    tournament.addEventListener(
      "click",
      this.handleRemoteTournamentRedirection,
    );

    const opponentInput = document.getElementById("opponentUsername");
    opponentInput.addEventListener("input", this.handleInputOpponent);

    const inviteButton = document.querySelector("#inviteButton");
    inviteButton.addEventListener("click", this.handleMatchRemote);

        const matchmakingModalShow = document.querySelector(
      "#C4MatchmakingButton",
    );
    if (matchmakingModalShow) {
      matchmakingModalShow.addEventListener(
        "click",
        this.handleShowMatchmakingModal,
      );
    }

    const stopMatchmaking = document.querySelector("#stopMatchmaking");
    if (stopMatchmaking) {
      stopMatchmaking.addEventListener("click", this.handleStopMatchmaking);
    }

    const joinButtonMatchFound = document.querySelector("#matchFoundJoin");
    joinButtonMatchFound.addEventListener("click", this.redirectToGame);

    // document.addEventListener("beforeunload", this.handleUnloadQueue);
  }

  removeEventListeners() {
    const remote = document.querySelector("#Connect4RemotePlayButton");
    if (remote) remote.removeEventListener("click", this.handleShowInviteModal);

    const tournament = document.querySelector(
      "#Connect4RemoteTournamentButton",
    );
    if (tournament)
      tournament.removeEventListener(
        "click",
        this.handleRemoteTournamentRedirection,
      );

    const opponentInput = document.getElementById("opponentUsername");
    if (opponentInput)
      opponentInput.removeEventListener("input", this.handleInputOpponent);
    const inviteButton = document.querySelector("#inviteButton");
    if (inviteButton)
      inviteButton.removeEventListener("click", this.handleMatchRemote);

    const matchmakingModalShow = document.querySelector(
      "#C4MatchmakingButton",
    );
    if (matchmakingModalShow)
      matchmakingModalShow.removeEventListener(
        "click",
        this.handleShowMatchmakingModal,
      );

    const joinButtonMatchFound = document.querySelector("#matchFoundJoin");
    if (joinButtonMatchFound)
      joinButtonMatchFound.removeEventListener("click", this.redirectToGame);

    // document.removeEventListener("beforeunload", this.handleUnloadQueue);

  }
}
