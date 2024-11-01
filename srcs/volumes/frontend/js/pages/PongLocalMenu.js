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
    this.setTitle("Pong Local");
    this.handleLocalGameRedirection =
      this.handleLocalGameRedirection.bind(this);
    this.handleLocalTournamentRedirection =
      this.handleLocalTournamentRedirection.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
  }

  async getHtml() {
    return `
      <div class="background removeElem">
        <div class=" removeElem custom-container d-flex flex-column justify-content-center align-items-center">
          <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
            ${this.lang.getTranslation(["pong", "maj", "title"])} - ${this.lang.getTranslation(["pong", "maj", "local"])}</h1>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
            id="PongLocalPlayButton">${this.lang.getTranslation(["pong", "maj", "play"])}</button>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
            id="PongLocalTournamentButton">${this.lang.getTranslation(["pong", "maj", "tournament"])}</button>
          <br>
        </div>
      </div>
              `;
  }

  handleLocalGameRedirection(ev) {
    ev.preventDefault();
    navigateTo("/pong?connection=local");
  }

  handleLocalTournamentRedirection(ev) {
    ev.preventDefault();
    navigateTo("/pong-local-lobby");
  }

  async addEventListeners() {
    const local = document.querySelector("#PongLocalPlayButton");
    local.addEventListener("click", this.handleLocalGameRedirection);

    const tournament = document.querySelector("#PongLocalTournamentButton");
    tournament.addEventListener("click", this.handleLocalTournamentRedirection);
  }

  removeEventListeners() {
    const local = document.querySelector("#PongLocalPlayButton");
    local.removeEventListener("click", this.handleLocalGameRedirection);

    const tournament = document.querySelector("#PongLocalTournamentButton");
    tournament.removeEventListener(
      "click",
      this.handleLocalTournamentRedirection,
    );
  }
}
