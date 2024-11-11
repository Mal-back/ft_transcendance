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

    this.tounamentCreate = false;
    this.tournamentInterval = null;
    this.playerTournamentInvites = [];
    this.owner = false;

    this.handleInvitePlayerTournament =
      this.handleInvitePlayerTournament.bind(this);
    this.handleInputUsername = this.handleInputUsername.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/tournament-local.css");
    this.createPageCss("../css/connect-remote.css");
    this.createPageCss("../css/ranking-remote-hp.css");
    this.createPageCss("../css/tournament-remote.css");
    this.createPageCss("../css/remote-button-tournment.css");
  }

  async getHtml() {
    try {
      this.setTitle(
        `${this.lang.getTranslation(["title", "pong"])} ${this.lang.getTranslation(["title", "lobby"])}`,
      );
      const username = sessionStorage.getItem("username_transcendence");
      let data = await this.checkTournament();
      await this.createTournament();
      console.log("DATA", data);
      return `
      <div class="background ">
        <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
          ${this.lang.getTranslation(["title", "pong"]).toUpperCase()} - ${this.lang.getTranslation(["title", "remote"]).toUpperCase()} - ${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</h1>
        <br>
        <div class="tournament-creation ranking" id="inviteTournamentOwner" style="display: ${this.owner ? "block" : "none"};">
          <div class=" text-center text-white  rounded">
            <h3 class="form-label text-decoration-underline" id="SelectPlayersTitle">Invite Player</h3>
            <div class="input-group">
              <input type="text" id="inputInvitePlayerTournament" class="form-control" placeholder="Player's username"
                aria-label="Recipient's username" aria-describedby="basic-addon2">
              <div class="input-group-append">
                <button id="invitePlayerTournamentButton" class="btn btn-outline-primary" type="submit">Invite</button>
              </div>
            </div>
              <div id="usernameError" class="removeElem mt-1"></div>
            <button type="button" class="btn btn-light white-txt btn-lg bg-green custom-button mt-3"
              style="max-height: 6vh; min-height: 50px; margin-bottom: 0px;"
                id="friend-list">Friends</button>
            <button type="button" class="btn btn-light white-txt btn-lg bg-blue custom-button mt-3 ms-1"
              style="max-height: 6vh; min-height: 50px; margin-bottom: 0px;"
                id="pending">Pending Invites</button>
          </div>
        </div>
        <br>
        <h3 class="form-label text-center text-white text-decoration-underline" id="SelectPlayersTitle">
          Players:</h3>
        <div class="tournament-creation list-group ranking" style="margin-bottom: 0px;">
          <div id="ownerDiv">
            ${data.ownerHtml}
          </div>
          <div id="confirmedPlayers">
            ${data.confirmedHtml}
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
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="pendingTournamentModal" tabindex="-1" aria-labelledby="friendListModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="pendingTournamentModalLabel">Pending Invites</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="pendingTournamentModalContent" style="max-height: 400px; overflow-y: auto;">
            ${data.pendingHtml}
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

  async createPlayerDivConfirmed(dataPlayer) {
    try {
      const data = await this.getUserInfo(dataPlayer.username);
      const playerAvatar = `background-image: url('${data.profilePic}');`;
      const username = sessionStorage.getItem("username_transcendence");
      let removeButton = this.owner
        ? `<button class="btn btn-sm btn-danger ms-auto removePlayer"><i class="bi bi-x-circle"></i>
      Remove</button>`
        : ``;
      if (this.owner == false && username == dataPlayer.username)
        removeButton = `<button class="btn btn-sm btn-danger ms-auto cancelPlayer"><i class="bi bi-x-circle"></i>
      Cancel</button>`;
      return `
<div>
  <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
    <div class="d-flex align-items-center">
      <div class="Avatar status-online me-3" style="${playerAvatar}"></div>
      <div class="flex-fill">
        <h5 class="mb-0">${username}</h5>
      </div>
    </div>
    ${removeButton}
  </div>
</div>
            `;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async createPlayerDivPending(dataPlayer) {
    try {
      const data = await this.getUserInfo(dataPlayer.username);
      const playerAvatar = `background-image: url('${data.profilePic}');`;
      let cancelButton = this.owner
        ? `<button class="btn btn-sm btn-danger ms-auto removePlayer"><i class="bi bi-x-circle"></i>
      Cancel</button>`
        : ``;
      return `
<div>
  <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100" style="background-color: rgb(0,0,255,0.04);">
    <div class="d-flex align-items-center">
      <div class="Avatar status-online me-3" style="${playerAvatar}"></div>
      <div class="flex-fill">
        <h5 class="mb-0">${dataPlayer.username}</h5>
      </div>
    </div>
    ${cancelButton}
  </div>
</div>
            `;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async fillPendingPlayers(invited_players_profiles) {
    console.log(
      "fillPendingPlayers:invited_players_profiles",
      invited_players_profiles,
    );
    if (!invited_players_profiles || invited_players_profiles.length === 0)
      return;
    try {
      // Await each asynchronous call inside `Promise.all`
      const playerDivs = await Promise.all(
        invited_players_profiles.map(async (player) => {
          console.log("Player:", player);
          return await this.createPlayerDivPending(player);
        }),
      );
      const allPlayerDivsHTML = `${playerDivs.join("")}`;
      console.log("PendingPlayers:", allPlayerDivsHTML);
      return allPlayerDivsHTML;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async fillConfirmedPlayers(confirmed_players_profiles, owner) {
    console.log(
      "fillConfirmedPlayers:confirmed_players_profiles",
      confirmed_players_profiles,
    );
    if (!confirmed_players_profiles || confirmed_players_profiles.length === 0)
      return;
    try {
      const playerDivs = await Promise.all(
        confirmed_players_profiles.map((player) => {
          if (owner != player.profile) this.createPlayerDivPending(player);
        }),
      );
      const allPlayerDivsHTML = `${playerDivs.join("")}`;
      return allPlayerDivsHTML;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async createOwnerDiv(ownerName) {
    try {
      console.log("createOwnerDiv: ownerName", ownerName);
      const data = await this.getUserInfo(ownerName);
      const playerAvatar = `background-image: url('${data.profilePic}');`;
      let OwnerButton = `<button class="btn btn-sm btn-warning ms-auto"><i class="bi bi-trophy"></i></button>`;
      return `
      <div>
        <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
          <div class="d-flex align-items-center">
            <div
              class="Avatar status-online me-3"
              style="${playerAvatar}"
            ></div>
            <div class="flex-fill">
              <h5 class="mb-0">${ownerName}</h5>
            </div>
          </div>
          ${OwnerButton}
        </div>
      </div>`;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async fillOwnerTournament(data) {
    const split = data.owner_profile.split("/");
    const ownerUsername = split[3] || null;
    if (!ownerUsername) {
      console.error("fillOwnerTournament: error ownerName == null");
      return;
    }
    const username = sessionStorage.getItem("username_transcendence");
    if (ownerUsername == username) {
      this.owner = true;
    }
    const ownerHtml = await this.createOwnerDiv(ownerUsername);
    return ownerHtml;
  }

  async fillTournamentInvites(data) {
    try {
      const owner = await this.fillOwnerTournament(data);
      const confirmed = await this.fillConfirmedPlayers(
        data.confirmed_players_profiles,
        data.owner_profile,
      );
      const pending = await this.fillPendingPlayers(
        data.invited_players_profiles,
      );
      return {
        ownerHtml: owner,
        confirmedHtml: confirmed,
        pendingHtml: pending,
      };
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
        console.log("checkTournament: data:", data);
        const htmlContent = await this.fillTournamentInvites(data);
        return htmlContent;
      }
      console.log("RETURN UNDEFINED");
      return undefined;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async createTournament() {
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/tournament/create/",
        "POST",
        {
          game_type: "pong",
          invited_players: [
            "user2",
            "user3",
            "user4",
            "user5",
            "user6",
            "user7",
            "user8",
            "user9",
            "user10",
            "user11",
            "user12",
            "user13",
            "user14",
            "user15",
          ],
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

  // async updatePendingPlayers(

  async invitePlayerTournament(username) {
    try {
      const request = await this.makeRequest(
        `/api/matchmaking/tournament/add_players/`,
        `PATCH`,
        { invited_players: [`${username}`] },
      );
      const response = await fetch(request);
      console.log("invitePlayerTournament: response", response);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        console.log("invitePlayerTournament: data: ", data);
        // await updatePendingPlayers(data);
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  validateUsername(usernameInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#usernameError");
    errorDiv.innerHTML = "";
    if (usernameInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
    } else if (!this.sanitizeInput(usernameInput.value)) {
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

  async handleInvitePlayerTournament(ev) {
    try {
      ev.preventDefault();
      const inputPlayerUsername = document.querySelector(
        "#inputInvitePlayerTournament",
      );
      if (this.validateUsername(inputPlayerUsername)) return;
      await this.invitePlayerTournament(inputPlayerUsername.value);
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      } else {
        console.error("invitePlayerTournament:", error);
      }
    }
  }

  handleShowPendingButton(ev) {
    ev.preventDefault();
    const pendingTournamentModalDiv = document.querySelector(
      "#pendingTournamentModal",
    );
    let pendingTournamentModal = bootstrap.Modal.getInstance(
      pendingTournamentModalDiv,
    );
    if (!pendingTournamentModal)
      pendingTournamentModal = new bootstrap.Modal(pendingTournamentModalDiv);
    pendingTournamentModal.show();
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

    const pending = document.querySelector("#pending");
    pending.addEventListener("click", this.handleShowPendingButton);

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
