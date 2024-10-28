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
    this.boolLogin = true;
    this.setTitle("Pong Remote");
    this.handleRemoteTournamentRedirection =
      this.handleRemoteTournamentRedirection.bind(this);
    this.handleShowInviteModal = this.handleShowInviteModal.bind(this);
    this.handleMatchRemote = this.handleMatchRemote.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
  }

  async getHtml() {
    return `
      <div class="background removeElem">
        <div class=" removeElem custom-container d-flex flex-column justify-content-center align-items-center">
          <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
            ${this.lang.getTranslation(["pong", "maj", "title"])} - ${this.lang.getTranslation(["pong", "maj", "remote"])}</h1>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
            id="PongRemotePlayButton">${this.lang.getTranslation(["pong", "maj", "play"])}</button>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
            id="PongRemoteTournamentButton">${this.lang.getTranslation(["pong", "maj", "tournament"])}</button>
          <br>
        </div>
      </div>
      <div class="modal fade" id="invitePongModal" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="inviteModalLabel">Invite to a Match</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="text" id="opponentUsername" class="form-control" placeholder="Enter opponent's username">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="inviteButton">Invite</button>
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

  async handleMatchRemote(ev) {
    console.log("HANDLEMATCHREMOTE");
    ev.preventDefault();
    //validate username
    try {
      const request = await this.makeRequest(
        "api/matchmaking/match/create/",
        "POST",
        { player2: "toi", game_type: "pong" },
      );
      const response = await fetch(request);
      console.log("Request:", request);
      console.log("response:", response);
      const data = await this.getErrorLogfromServer(response);
      console.log("data:", data);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("PongRemoteMenu:handleMatchRemote:", error);
      }
    }
  }

  async addEventListeners() {
    const playButton = document.querySelector("#PongRemotePlayButton");
    playButton.addEventListener("click", this.handleShowInviteModal);
    const tournament = document.querySelector("#PongRemoteTournamentButton");
    tournament.addEventListener(
      "click",
      this.handleRemoteTournamentRedirection,
    );
    const inviteButton = document.querySelector("#inviteButton");
    inviteButton.addEventListener("click", this.handleMatchRemote);
  }

  removeEventListeners() {
    const remote = document.querySelector("#PongRemotePlayButton");
    remote.removeEventListener("click", this.handleShowInviteModal);

    const tournament = document.querySelector("#PongRemoteTournamentButton");
    tournament.removeEventListener(
      "click",
      this.handleRemoteTournamentRedirection,
    );

    const inviteButton = document.querySelector("#inviteButton");
    inviteButton.removeEventListener("click", this.handleMatchRemote);
  }

  destroy() {
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
    this.removeElem();
  }
}
