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
    this.handleLocalRedirection = this.handleLocalRedirection.bind(this);
    this.handleRemoteRedirection = this.handleRemoteRedirection.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
  }

  async getHtml() {
    this.setTitle(
      `${this.lang.getTranslation(["title", "pong"])} ${this.lang.getTranslation(["title", "mode"])}`,
    );
    return `
    <div class="background removeElem">
      <div class="custom-container d-flex flex-column justify-content-center align-items-center removeElem">
        <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
          ${this.lang.getTranslation(["title", "pong"]).toUpperCase()}</h1>
        <br>
        <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
         id="pongLocalButton">${this.lang.getTranslation(["title", "local"]).toUpperCase()}</button>
        <br>
        <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
          id="pongRemoteButton">${this.lang.getTranslation(["title", "remote"]).toUpperCase()}</button>
        <br>
      </div>
    </div> 
              `;
  }

  async checkLogin() {
    const username = sessionStorage.getItem("username_transcendence");
    if (username) {
      try {
        if ((await this.fetchNotifications()) === undefined) {
          throw new CustomError(
            `${this.lang.getTranslation(["modal", "title", "error"])}`,
            `${this.lang.getTranslation(["modal", "message", "authError"])}`,
          );
        }
      } catch (error) {
        removeSessionStorage();
        this.handleCatch(error);
      }
    }
  }

  handleLocalRedirection(ev) {
    ev.preventDefault();
    navigateTo("/pong-local-menu");
  }

  handleRemoteRedirection(ev) {
    ev.preventDefault();
    navigateTo("/pong-remote-menu");
  }

  async addEventListeners() {
    const local = document.querySelector("#pongLocalButton");
    local.addEventListener("click", this.handleLocalRedirection);

    const remote = document.querySelector("#pongRemoteButton");
    remote.addEventListener("click", this.handleRemoteRedirection);
  }

  removeEventListeners() {
    const local = document.querySelector("#pongLocalButton");
    if (local) local.removeEventListener("click", this.handleLocalRedirection);

    const remote = document.querySelector("#pongRemoteButton");
    if (remote)
      remote.removeEventListener("click", this.handleRemoteRedirection);
  }
}
