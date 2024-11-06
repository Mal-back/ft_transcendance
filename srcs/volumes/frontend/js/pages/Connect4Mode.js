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
        this.setTitle("Connect4 mode");
        this.handleLocalRedirection = this.handleLocalRedirection.bind(this);
        this.handleRemoteRedirection = this.handleRemoteRedirection.bind(this);
    }

    async loadCss() {
        this.createPageCss("../css/game-menu-buttons.css");
    }

    async getHtml() {
        return `
    <div class="background removeElem">
      <div class="custom-container d-flex flex-column justify-content-center align-items-center removeElem">
        <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
          ${this.lang.getTranslation(["game", "c4", "title"])}</h1>
        <br>
        <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
         id="c4LocalButton">${this.lang.getTranslation(["game", "local"])}</button>
        <br>
        <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
          id="c4RemoteButton">${this.lang.getTranslation(["game", "remote"])}</button>
        <br>
      </div>
    </div> 
              `;
    }

    handleLocalRedirection(ev) {
        ev.preventDefault();
        navigateTo("/c4-local-menu");
    }

    handleRemoteRedirection(ev) {
        ev.preventDefault();
        navigateTo("/c4-remote-menu");
    }

    async addEventListeners() {
        const local = document.querySelector("#c4LocalButton");
        local.addEventListener("click", this.handleLocalRedirection);

        const remote = document.querySelector("#c4RemoteButton");
        remote.addEventListener("click", this.handleRemoteRedirection);
    }

    removeEventListeners() {
        const local = document.querySelector("#c4LocalButton");
        if (local) local.removeEventListener("click", this.handleLocalRedirection);

        const remote = document.querySelector("#c4RemoteButton");
        if (remote)
            remote.removeEventListener("click", this.handleRemoteRedirection);
    }
}