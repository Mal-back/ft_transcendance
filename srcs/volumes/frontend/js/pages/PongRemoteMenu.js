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
    this.setTitle("Pong Remote");
    this.handleRemoteGameRedirection =
      this.handleRemoteGameRedirection.bind(this);
    this.handleRemoteTournamentRedirection =
      this.handleRemoteTournamentRedirection.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
  }

  async getHtml() {
    try {
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
              `;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        showModal(this.lang.getTranslation(["modal", "error"], error.message));
        console.error("PongMode:getHtml:", error);
      }
    }
  }

  handleRemoteGameRedirection(ev) {
    ev.preventDefault();
    navigateTo("/pongremote");
  }

  handleRemoteTournamentRedirection(ev) {
    ev.preventDefault();
    navigateTo("/pong-remote-tournament");
  }

  async addEventListeners() {
    const remote = document.querySelector("#PongRemotePlayButton");
    remote.addEventListener("click", this.handleRemoteGameRedirection);

    const tournament = document.querySelector("#PongRemoteTournamentButton");
    tournament.addEventListener(
      "click",
      this.handleRemoteTournamentRedirection,
    );
  }

  removeEventListeners() {
    const remote = document.querySelector("#PongRemotePlayButton");
    remote.removeEventListener("click", this.handleRemoteGameRedirection);

    const tournament = document.querySelector("#PongRemoteTournamentButton");
    tournament.removeEventListener(
      "click",
      this.handleRemoteTournamentRedirection,
    );
  }

  destroy() {
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
    this.removeElem();
  }
}
