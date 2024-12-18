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
    this.handleLocalGameRedirection =
      this.handleLocalGameRedirection.bind(this);
    this.handleLocalTournamentRedirection =
      this.handleLocalTournamentRedirection.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
  }

  async getHtml() {
    this.setTitle(
      `${this.lang.getTranslation(["title", "c4"])} ${this.lang.getTranslation(["title", "local"])}`,
    );
    return `
      <div class="background removeElem">
        <div class=" removeElem custom-container d-flex flex-column justify-content-center align-items-center">
          <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
            ${this.lang.getTranslation(["title", "c4"]).toUpperCase()} - ${this.lang.getTranslation(["title", "local"]).toUpperCase()}</h1>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
            id="c4LocalPlayButton">${this.lang.getTranslation(["game", "play"]).toUpperCase()}</button>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
            id="c4LocalTournamentButton">${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</button>
          <br>
        </div>
      </div>
              `;
  }

  async checkLogin() {
    try {
      const username = sessionStorage.getItem("username_transcendence");
      if (username) {
        const error = await this.fetchNotifications();
        if (error instanceof CustomError) {
          throw new CustomError(
            `${this.lang.getTranslation(["modal", "title", "error"])}`,
            `${this.lang.getTranslation(["modal", "message", "authError"])}`,
          );
        }
      }
    } catch (error) {
      removeSessionStorage();
      this.handleCatch(error);
    }
  }

  handleLocalGameRedirection(ev) {
    ev.preventDefault();
    navigateTo("/c4?connection=local&mode=simple");
  }

  handleLocalTournamentRedirection(ev) {
    ev.preventDefault();
    navigateTo("/c4-local-lobby");
  }

  async addEventListeners() {
    const local = document.querySelector("#c4LocalPlayButton");
    local.addEventListener("click", this.handleLocalGameRedirection);

    const tournament = document.querySelector("#c4LocalTournamentButton");
    tournament.addEventListener("click", this.handleLocalTournamentRedirection);
  }

  removeEventListeners() {
    const local = document.querySelector("#c4LocalPlayButton");
    if (local)
      local.removeEventListener("click", this.handleLocalGameRedirection);

    const tournament = document.querySelector("#c4LocalTournamentButton");
    if (tournament)
      tournament.removeEventListener(
        "click",
        this.handleLocalTournamentRedirection,
      );
  }
}
