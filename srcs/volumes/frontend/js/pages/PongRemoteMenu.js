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
    this.handleRemoteTournamentRedirection =
      this.handleRemoteTournamentRedirection.bind(this);
    this.handleShowInviteModal = this.handleShowInviteModal.bind(this);
    this.handleMatchRemote = this.handleMatchRemote.bind(this);
    this.handleInputOpponent = this.handleInputOpponent.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["title", "pong"])} ${this.lang.getTranslation(["title", "remote"])}`);
    return `
      <div class="background removeElem">
        <div class=" removeElem custom-container d-flex flex-column justify-content-center align-items-center">
          <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
            ${this.lang.getTranslation(["title", "pong"]).toUpperCase()} - ${this.lang.getTranslation(["title", "remote"]).toUpperCase()}</h1>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
            id="PongRemotePlayButton">${this.lang.getTranslation(["game", "play"]).toUpperCase()}</button>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
            id="PongRemoteTournamentButton">${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</button>
          <br>
        </div>
      </div>
      <div class="modal fade" id="invitePongModal" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="inviteModalLabel">${this.lang.getTranslation(["game", "inviteMatch"])}:</h5>
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
              `;
  }

  handleRemoteTournamentRedirection(ev) {
    ev.preventDefault();
    navigateTo("/pong-remote-lobby");
  }

  handleShowInviteModal(ev) {
    ev.preventDefault();
    const modalId = document.getElementById("invitePongModal");
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
        { player2: opponent.value, game_type: "pong" },
      );
      const response = await fetch(request);
      console.log("Request:", request);
      console.log("response:", response);
      if (!response.ok) {
        const dataError = await this.getErrorLogfromServer(response)
        showModal(`${this.lang.getTranslation(["modal","title", "error"])}`, dataError);
      } else {
      const data = await this.getErrorLogfromServer(response, true);
      console.log("data:", data);
        const modalInviteMatchId = document.getElementById("invitePongModal");
        const  modalElemInvite = bootstrap.Modal.getInstance(modalInviteMatchId);
        modalElemInvite.hide();
        const buttonOnGoingGame = document.querySelector("#buttonOnGoingGame");
        buttonOnGoingGame.innerText = `${this.lang.getTranslation(["button", "cancel"])}`;
        buttonOnGoingGame.dataset.redirectUrl = `/api/matchmaking/match/${data.id}/delete/`;
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("PongRemoteMenu:handleMatchRemote:", error);
      }
    }
  }

  handleInputOpponent(ev) {
    ev.preventDefault();
    this.validateOpponentName(document.querySelector("#opponentUsername"));
  }

  async addEventListeners() {
    const playButton = document.querySelector("#PongRemotePlayButton");
    playButton.addEventListener("click", this.handleShowInviteModal);
    const tournament = document.querySelector("#PongRemoteTournamentButton");
    tournament.addEventListener(
      "click",
      this.handleRemoteTournamentRedirection,
    );

    const opponentInput = document.getElementById("opponentUsername");
    opponentInput.addEventListener("input", this.handleInputOpponent);

    const inviteButton = document.querySelector("#inviteButton");
    inviteButton.addEventListener("click", this.handleMatchRemote);
  }

  removeEventListeners() {
    const remote = document.querySelector("#PongRemotePlayButton");
    if (remote) remote.removeEventListener("click", this.handleShowInviteModal);

    const tournament = document.querySelector("#PongRemoteTournamentButton");
    if (tournament)
      tournament.removeEventListener(
        "click",
        this.handleRemoteTournamentRedirection,
      );

    const opponentInput = document.getElementById("opponentUsername");
    opponentInput.removeEventListener("input", this.handleInputOpponent);
    const inviteButton = document.querySelector("#inviteButton");
    if (inviteButton)
      inviteButton.removeEventListener("click", this.handleMatchRemote);
  }
}
