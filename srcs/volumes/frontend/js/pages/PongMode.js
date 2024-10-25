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
    this.setTitle("Pong mode");
    this.handleLocalRedirection = this.handleLocalRedirection.bind(this);
    this.handleRemoteRedirection = this.handleRemoteRedirection.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
  }

  async getHtml() {
    try {
      return `
    <div class="background removeElem">
      <div class="custom-container d-flex flex-column justify-content-center align-items-center removeElem">
        <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
          ${this.lang.getTranslation(["pong", "maj", "title"])}</h1>
        <br>
        <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
         id="pongLocalButton">${this.lang.getTranslation(["pong", "maj", "local"])}</button>
        <br>
        <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
          id="pongRemoteButton">${this.lang.getTranslation(["pong", "maj", "remote"])}</button>
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
    local.removeEventListener("click", this.handleLocalRedirection);

    const remote = document.querySelector("#pongRemoteButton");
    remote.removeEventListener("click", this.handleRemoteRedirection);
  }

  destroy() {
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
    this.removeElem();
  }
}
