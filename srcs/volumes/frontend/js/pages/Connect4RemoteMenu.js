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
        this.setTitle("Conect4 Remote");
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
        return `
      <div class="background removeElem">
        <div class=" removeElem custom-container d-flex flex-column justify-content-center align-items-center">
          <h1 class="removeElem mb-3 text-center white-txt text-decoration-underline" id="GameTitle">
            ${this.lang.getTranslation(["game", "c4", "title"])} - ${this.lang.getTranslation(["game", "remote"])}</h1>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-green custom-button"
            id="Connect4RemotePlayButton">${this.lang.getTranslation(["game", "play"])}</button>
          <br>
          <button type="button" class="removeElem btn btn-light white-txt btn-lg bg-midnightblue custom-button"
            id="Connect4RemoteTournamentButton">${this.lang.getTranslation(["game", "tournament"])}</button>
          <br>
        </div>
      </div>
      <div class="modal fade" id="inviteC4Modal" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="inviteModalLabel">Invite to a Match</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="text" id="opponentUsername" class="form-control" placeholder="Enter opponent's username">
              <div id="opponentUsernameError"></div>
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
            errorMessage = `${this.lang.getTranslation(["input", "username", "empty"])}`;
        } else if (!this.sanitizeInput(opponentInput.value)) {
            errorMessage = `${this.lang.getTranslation(["input", "username", "invalid"])}`;
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
                { player2: opponent.value, game_type: "connect_4" },
            );
            const response = await fetch(request);
            console.log("Request:", request);
            console.log("response:", response);
            const data = await this.getErrorLogfromServer(response, true);
            console.log("data:", data);
            if (!response.ok) {
                console.log("Error invite: ", data);
                console.log("Error invite: ", response);
                showModal(`${this.lang.getTranslation(["modal", "error"])}`, data);
            } else {
                AbstractView.AcceptInterval = setInterval(async () => {
                    try {
                        const requestInvite = await this.makeRequest(
                            `/api/matchmaking/match/get_accepted`,
                            "GET",
                        );
                        const responseInvite = await fetch(requestInvite);
                        const dataInvite = await this.getErrorLogfromServer(
                            responseInvite,
                            true,
                        );
                        console.log("Response sent invite:", dataInvite);
                        if (responseInvite.ok) {
                            clearInterval(AbstractView.AcceptInterval);
                            sessionStorage.setItem(
                                "transcendence_game_id",
                                dataInvite.matchId,
                            );
                            navigateTo("/c4?connection=remote");
                        }
                    } catch (error) {
                        clearInterval(AbstractView.AcceptInterval);
                        if (error instanceof CustomError) throw error;
                        else {
                            console.error("error in AcceptInterval", error);
                        }
                    }
                }, 1000);
            }
        } catch (error) {
            if (error instanceof CustomError) throw error;
            else {
                console.error("Connect4RemoteMenu:handleMatchRemote:", error);
            }
        }
    }

    handleInputOpponent(ev) {
        ev.preventDefault();
        this.validateOpponentName(document.querySelector("#opponentUsername"));
    }

    async addEventListeners() {
        const playButton = document.querySelector("#Connect4RemotePlayButton");
        playButton.addEventListener("click", this.handleShowInviteModal);
        const tournament = document.querySelector("#Connect4RemoteTournamentButton");
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
        const remote = document.querySelector("#Connect4RemotePlayButton");
        if (remote) remote.removeEventListener("click", this.handleShowInviteModal);

        const tournament = document.querySelector("#Connect4RemoteTournamentButton");
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
