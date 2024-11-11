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
    // this.handleShowFriendsModal = this.handleShowFriendsModal.bind(this);

    this.acceptedTournamentInvites = [];
    this.pendingTournamentInvites = [];

    this.handleInvitePlayerTournament =
      this.handleInvitePlayerTournament.bind(this);
    this.handleInputUsername = this.handleInputUsername.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/tournament-local.css");
  }

  async getHtml() {
    try {
      this.setTitle(
        `${this.lang.getTranslation(["title", "pong"])} ${this.lang.getTranslation(["title", "lobby"])}`,
      );
      const username = sessionStorage.getItem("username_transcendence");
      let data = await this.checkTournament();
      return `
      <div class="background ">
        <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
          ${this.lang.getTranslation(["title", "pong"]).toUpperCase()} - ${this.lang.getTranslation(["title", "remote"]).toUpperCase()} - ${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</h1>
        <br>
        <div class="tournament-creation ranking ">
          <div class=" text-center text-white  rounded">
            <h3 class="form-label text-decoration-underline" id="SelectPlayersTitle">Invite Player</h3>
            <div class="input-group mb-3">
              <input type="text" id="inputInvitePlayerTournament" class="form-control" placeholder="Player's username"
                aria-label="Recipient's username" aria-describedby="basic-addon2">
              <div class="input-group-append">
                <button id="invitePlayerTournamentButton" class="btn btn-outline-primary" type="submit">Invite</button>
              </div>
            </div>
            <button type="button" class="btn btn-light white-txt btn-lg bg-green custom-button"
              style="max-height: 6vh; min-height: 50px; margin-bottom: 0px;"
                id="friend-list">Friends</button>
          </div>
        </div>
        <br>
        <h3 class="form-label text-center text-white text-decoration-underline" id="SelectPlayersTitle">
          Players:</h3>
        <div class="tournament-creation list-group ranking" style="margin-bottom: 0px;">
          <div>
            <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
              <div class="d-flex align-items-center">
                <div class="ranking-number gold">1</div>
                <div class="Avatar status-online me-3"></div>
                <div class="flex-fill">
                  <h5 class="mb-0">${username}</h5>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
              <div class="d-flex align-items-center">
                <div class="ranking-number black">2</div>
                <div class="Avatar status-online me-3"></div>
                <div class="flex-fill">
                  <h5 class="mb-0">USERNAME2</h5>
                </div>
              </div>
              <button class="btn btn-sm btn-danger ms-auto"><i class="bi bi-x-circle"></i>
                Remove</button>
            </div>
          </div>
          <div class="d-flex align-items-center justify-content-center mt-2">
            <button type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button"
              style="max-height: 6vh; min-height: 50px; margin-bottom: 0; margin-top: 10px;"
              id="startTournamentBtn">Start
              Tournament</button>
          </div>
        </div>
      </div>
      <div class="modal fade" id="friendListModal" tabindex="-1" aria-labelledby="friendListModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="friendListModalLabel">Friends List</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="friendListModalContent" style="max-height: 400px; overflow-y: auto;">
              <!-- Friends list content will be injected here by JavaScript -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
                      `;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async fillTournamentInvites(data) {
    try {
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async checkTournament() {
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/tournament/detail/",
        "GET",
      );
      const response = await fetch(request);
      if (response.status == 404) return undefined;
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        await this.fillTournamentInvites(data);
      }
      return undefined;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async createTournament() {
    showModal("Tournament", "invite 1 person");
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/tournament/create/",
        "POST",
        {
          game_type: "pong",
          invited_players: ["moi"],
        },
      );

      const response = await fetch(request);
      console.log("createTournament:response:", response);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        console.log("createTournament:data:", data);
        return true;
      }
      return false;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async getFriendList() {
    const username = sessionStorage.getItem("username_transcendence");
    let data = null;

    try {
      const request = await this.makeRequest(
        `/api/users/${username}/friend/`,
        "GET",
      );
      const response = await fetch(request);
      if (!response.ok) {
        showModal(
          this.lang.getTranslation(["modal", "error"]),
          await this.getErrorLogfromServer(response),
        );
        return;
      }
      data = await response.json();
      if (data.count === 0) {
        return "<p class='text-center'>No friends found.</p>";
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        showModal(this.lang.getTranslation(["modal", "error"]), error.message);
        console.error("error", error);
        return;
      }
    }

    // Generate the friend list HTML
    let friendsArray = data.results;
    const friendsHtml = friendsArray
      .map((friendJson) => this.createFriendElement(friendJson))
      .join("");

    // Paginate if there are additional pages of friends
    let nextPage = data.next;
    while (nextPage) {
      try {
        const request = await this.makeRequest(nextPage, "GET", null);
        const response = await fetch(request);
        if (response.ok) {
          const pageData = await response.json();
          friendsArray = pageData.results;
          friendsHtml += friendsArray
            .map((friendJson) => this.createFriendElement(friendJson))
            .join("");
          nextPage = pageData.next;
        } else {
          const log = await this.getErrorLogfromServer(response);
          console.log(log);
          showModal(this.lang.getTranslation(["modal", "error"]), log);
          break;
        }
      } catch (error) {
        if (error instanceof CustomError) throw error;
        else {
          console.error("Error fetching next page:", error);
          break;
        }
      }
    }

    return `<div class="list-group">${friendsHtml}</div>`;
  }

  createFriendElement(friendJson) {
    const friendStatus = friendJson.is_online
      ? "status-online"
      : "status-offline";
    const friendAvatarUrl = friendJson.profilePic
      ? `url('${friendJson.profilePic}')`
      : "url('/path/to/default-avatar.jpg')"; // fallback image

    return `
      <div class="list-group-item d-flex align-items-center mb-3 rounded">
        <div class="rounded-circle Avatar ${friendStatus} me-3" 
             style="background-image: ${friendAvatarUrl}; width: 40px; height: 40px; background-size: cover; background-position: center;" 
             alt="Avatar">
        </div>
        <div class="flex-fill">
          <h5 class="mb-0">${friendJson.username}</h5>
        </div>
        <button class="btn btn-sm btn-primary ms-auto invitefriend">
          <i class="bi bi-person-plus"></i> ${this.lang.getTranslation(["Friends", "inviteButton"])}
        </button>
      </div>
    `;
  }

  handleInputUsername(ev) {
    this.validateUsername(ev.target);
  }

  handleInvitePlayerTournament(ev) {
    ev.preventDefault();
    const inputPlayerUsername = document.querySelector(
      "#inputInvitePlayerTournament",
    );
    if (this.validateUsername(inputPlayerUsername)) return;
  }

  async addEventListeners() {
    // const startTournamentBtn = document.querySelector("#startTournamentBtn");
    // startTournamentBtn.addEventListener("click", this.handleStartTournament);
    const playerInviteTournamentButton = document.querySelector(
      "#invitePlayerTournamentButton",
    );
    playerInviteTournamentButton.addEventListener(
      "click",
      this.handleInvitePlayerTournament,
    );

    const inputPlayerUsername = document.querySelector(
      "#inputInvitePlayerTournament",
    );
    inputPlayerUsername.addEventListener("input", this.handleInputUsername);

    const showFriends = document.querySelector("#friend-list");
    showFriends.addEventListener("click", this.handleShowFriendsModal);

    document
      .getElementById("friend-list")
      .addEventListener("click", async () => {
        const friendListContent = await this.getFriendList();
        document.getElementById("friendListModalContent").innerHTML =
          friendListContent;
        // Show the modal after setting the content
        const friendListModal = new bootstrap.Modal(
          document.getElementById("friendListModal"),
        );
        friendListModal.show();
      });
  }
}
