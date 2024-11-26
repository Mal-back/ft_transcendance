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
    this.handleStartTournament = this.handleStartTournament.bind(this);
    this.handleRemovePlayer = this.handleRemovePlayer.bind(this);
    this.clearLobbyInterval = this.clearLobbyInterval.bind(this);
    this.handleLeavePlayer = this.handleLeavePlayer.bind(this);
    this.handleCancelTournament = this.handleCancelTournament.bind(this);
    this.handleFriendList = this.handleFriendList.bind(this);
    this.handleInviteFriend = this.handleInviteFriend.bind(this);
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
      if (data == undefined) {
        await this.createTournament();
        data = await this.checkTournament();
      }
      return `
      <div class="background ">
        <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
          ${this.lang.getTranslation(["title", "pong"]).toUpperCase()} - ${this.lang.getTranslation(["title", "remote"]).toUpperCase()} - ${this.lang.getTranslation(["title", "tournament"]).toUpperCase()}</h1>
        <br>
        <div class="tournament-creation ranking" id="inviteTournamentOwner" style="display: ${this.owner ? "block" : "none"};">
          <div class=" text-center text-white  rounded">
            <h3 class="form-label text-decoration-underline" id="SelectPlayersTitle">${this.lang.getTranslation(["tournament", "invite_player"])}</h3>
            <div class="input-group">
              <input type="text" id="inputInvitePlayerTournament" class="form-control" placeholder="${this.lang.getTranslation(["input", "label", "username"])}"
                aria-label="Recipient's username" aria-describedby="basic-addon2">
              <div class="input-group-append">
                <button id="invitePlayerTournamentButton" class="btn btn-outline-primary" type="submit">${this.lang.getTranslation(["button", "invite"])}</button>
              </div>
            </div>
              <div id="usernameError" class="removeElem mt-1"></div>
          </div>
          <div class="d-flex align-items-center justify-content-center">
            <button type="button" class="btn btn-light white-txt btn-lg bg-green custom-button mt-3"
              style="max-height: 6vh; min-height: 50px; margin-bottom: 0px;"
                id="friend-list">${this.lang.getTranslation(["title", "friends"])}</button>
            <button type="button" class="btn btn-light white-txt btn-lg bg-blue custom-button mt-3 ms-1"
              style="max-height: 6vh; min-height: 50px; margin-bottom: 0px;"
                id="pending">${this.lang.getTranslation(["tournament", "pending_invites"])}</button>
          </div>
        </div>
        <br>
        <h3 class="form-label text-center text-white text-decoration-underline" id="SelectPlayersTitle">
          ${this.lang.getTranslation(["tournament", "players"])}:</h3>
        <div class="tournament-creation list-group ranking" style="margin-bottom: 0px;">
          <div id="ownerDiv">
            ${data ? data.ownerHtml : ""}
          </div>
          <div id="confirmedPlayers">
            ${data ? data.confirmedHtml : ""}
          </div>
        </div>
        <div class="d-flex align-items-center justify-content-center mt-2">
          <button type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button"
            style="max-height: 6vh; min-height: 50px; margin-bottom: 0; margin-top: 10px; display: ${this.owner ? "block" : "none"};"
            id="startTournamentBtn">
            ${this.lang.getTranslation(["tournament", "start_tournament"])}
          </button>
          <button type="button" class="btn btn-light white-txt btn-lg bg-red custom-button ms-1"
            style="max-height: 6vh; min-height: 50px; margin-bottom: 0; margin-top: 10px; display: ${this.owner ? "block" : "none"};"
            id="cancelTournamentBtn">
            ${this.lang.getTranslation(["tournament", "cancel_tournament"])}
          </button>
        </div>
      </div>
      <div class="modal fade" id="friendListModal" tabindex="-1" aria-labelledby="friendListModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="friendListModalLabel">${this.lang.getTranslation(["tournament", "friends_list"])}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="friendListModalContent" style="max-height: 400px; overflow-y: auto;">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.lang.getTranslation(["button", "close"])}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="pendingTournamentModal" tabindex="-1" aria-labelledby="friendListModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="pendingTournamentModalLabel">${this.lang.getTranslation(["tournament", "pending_invites"])}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="pendingTournamentModalContent" style="max-height: 400px; overflow-y: auto;">
            ${data ? data.pendingHtml : ""}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.lang.getTranslation(["button", "close"])}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="invitePongModal" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="inviteModalLabel">Invite at least 2 player to your tournament:</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="text" id="opponentUsername1" class="form-control" placeholder="${this.lang.getTranslation(["input", "preview", "opponent"])}">
              <div id="opponentUsername1Error"></div>
              <br>
              <input type="text" id="opponentUsername2" class="form-control" placeholder="${this.lang.getTranslation(["input", "preview", "opponent"])}">
              <div id="opponentUsername2Error"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="inviteButton">${this.lang.getTranslation(["button", "invite"])}</button>
            </div>
          </div>
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
        ? `<button class="btn btn-sm btn-danger ms-auto cancelPlayer"><i class="bi bi-x-circle"></i>
      ${this.lang.getTranslation(["button", "cancel"])}</button>`
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

  async createPlayerDivConfirmed(dataPlayer, leaveUrl, owner) {
    try {
      const data = await this.getUserInfo(dataPlayer.username);
      const playerAvatar = `background-image: url('${data.profilePic}');`;
      const username = sessionStorage.getItem("username_transcendence");
      let removeButton = this.owner
        ? `<button class="btn btn-sm btn-danger ms-auto removePlayer"><i class="bi bi-x-circle"></i>
      ${this.lang.getTranslation(["button", "remove"])}</button>`
        : ``;
      if (this.owner == false && username == dataPlayer.username)
        removeButton = `<button class="btn btn-sm btn-danger ms-auto leavePlayer" data-leaveUrl="${leaveUrl}" data-owner="${owner}"><i class="bi bi-x-circle"></i>
      ${this.lang.getTranslation(["button", "leave"])}</button>`;
      return `
<div>
  <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
    <div class="d-flex align-items-center">
      <div class="Avatar status-online me-3" style="${playerAvatar}"></div>
      <div class="flex-fill">
        <h5 class="mb-0">${dataPlayer.username}</h5>
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

  async createOwnerDiv(ownerName) {
    try {
      console.log("createOwnerDiv: ownerName", ownerName);
      const data = await this.getUserInfo(ownerName);
      const playerAvatar = `background-image: url('${data.profilePic}');`;
      try {
        if (this.owner) {
          const startBtn = document.querySelector("#startTournamentBtn");
          startBtn.style.display = `block`;
        }
      } catch (error) { }

      let OwnerButton = `<button class="btn btn-sm btn-warning ms-auto"><i class="bi bi-trophy"></i></button>`;
      return `
      <div>
        <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
          <div class="d-flex align-items-center">
            <div class="Avatar status-online me-3" style="${playerAvatar}"></div>
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

  async fillConfirmedPlayers(confirmed_players_profiles, leaveUrl, owner) {
    console.log(
      "fillConfirmedPlayers:confirmed_players_profiles",
      confirmed_players_profiles,
    );
    if (!confirmed_players_profiles || confirmed_players_profiles.length === 0)
      return;
    const split = owner.split("/");
    const ownerUsername = split[3] || null;

    try {
      const playerDivs = await Promise.all(
        confirmed_players_profiles.map(async (player) => {
          if (owner != player.profile)
            return await this.createPlayerDivConfirmed(
              player,
              leaveUrl,
              ownerUsername,
            );
        }),
      );
      const allPlayerDivsHTML = `${playerDivs.join("")}`;
      return allPlayerDivsHTML;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async fillPendingPlayers(invited_players_profiles) {
    if (!invited_players_profiles || invited_players_profiles.length === 0)
      return;
    try {
      const playerDivs = await Promise.all(
        invited_players_profiles.map(async (player) => {
          console.log("Player:", player);
          return await this.createPlayerDivPending(player);
        }),
      );
      const allPlayerDivsHTML = `${playerDivs.join("")}`;
      return allPlayerDivsHTML;
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
        data.leave_tournament,
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
      console.log("checkTournament: response:", response);
      if (response.status == 204) {
        return undefined;
      }
      if (response.status == 403) {
        const data = await this.getDatafromRequest(response);
        throw new CustomError("Error", this.JSONtoModal(data), "/");
      }
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        if (data.status != "pending") {
          throw new CustomError(
            "redirect",
            "redirect to tournament",
            "/pong-remote-tournament",
          );
        }
        console.log("checkTournament: data:", data);
        const htmlContent = await this.fillTournamentInvites(data);
        return htmlContent;
      }
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
            "user1",
            "user2",
            "user3",
            // "user4",
            // "user5",
            // "user6",
            // "user7",
            // "user8",
            // "user9",
            // "user10",
            // "user11",
            // "user12",
            // "user13",
            // "user14",
            // "user15",
          ],
        },
      );

      const response = await fetch(request);
      console.log("createTournament:response:", response);
      const data = await this.getDatafromRequest(response);
      if (response.ok) {
        console.log("createTournament:data:", data);
        return true;
      } else {
        throw new CustomError(
          "Error",
          this.JSONtoModal(data),
          "/pong-remote-menu",
        );
      }
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
      if (await this.handleStatus(response)) {
        data = await this.getDatafromRequest(response);
        if (data.count === 0) {
          return "<p class='text-center'>" + this.lang.getTranslation(["tournament", "no_friends"]) + "</p>";
        }
      }
    } catch (error) {
      this.handleCatch(error);
    }

    let friendsArray = data.results;
    const friendsHtml = friendsArray
      .map((friendJson) => this.createFriendElement(friendJson))
      .join("");

    let nextPage = data.next;
    while (nextPage) {
      try {
        const request = await this.makeRequest(nextPage, "GET", null);
        const response = await fetch(request);
        if (await this.handleStatus(response)) {
          const pageData = await this.getDatafromRequest(response);
          friendsArray = pageData.results;
          friendsHtml += friendsArray
            .map((friendJson) => this.createFriendElement(friendJson))
            .join("");
          nextPage = pageData.next;
        } else {
          break;
        }
      } catch (error) {
        this.handleCatch(error);
        break;
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
      : "url('/path/to/default-avatar.jpg')";
    return `
      <div class="list-group-item d-flex align-items-center mb-3 rounded">
        <div class="rounded-circle Avatar ${friendStatus} me-3" 
             style="background-image: ${friendAvatarUrl}; width: 40px; height: 40px; background-size: cover; background-position: center;" 
             alt="Avatar">
        </div>
        <div class="flex-fill">
          <h5 class="mb-0">${friendJson.username}</h5>
        </div>
        <button class="btn btn-sm btn-primary ms-auto inviteFriend" data-username=${friendJson.username}>
          <i class="bi bi-person-plus"></i> ${this.lang.getTranslation(["button", "invite"])}
        </button>
      </div>
    `;
  }

  handleInputUsername(ev) {
    this.validateUsername(ev.target);
  }

  async intervalFunction() {
    try {
      const data = await this.checkTournament();
      if (data == undefined) {
        throw new CustomError(
          this.lang.getTranslation(["title", "tournament"]),
          this.lang.getTranslation(["tournament", "kicked"]),
          "/pong-remote-menu",
        );
      }
      this.clearDynamicEventListeners();
      const ownerDiv = document.querySelector("#ownerDiv");
      if (ownerDiv) {
        ownerDiv.innerHTML = "";
        ownerDiv.innerHTML = data.ownerHtml;
      }
      const confirmedPlayers = document.querySelector("#confirmedPlayers");
      if (confirmedPlayers) {
        confirmedPlayers.innerHTML = "";
        confirmedPlayers.innerHTML = data.confirmedHtml;
      }
      const pendingPlayers = document.querySelector(
        "#pendingTournamentModalContent",
      );
      if (pendingPlayers) {
        pendingPlayers.innerHTML = "";
        pendingPlayers.innerHTML = data.pendingHtml;
      }
      this.addDynamicEventListeners();
    } catch (error) {
      console.error("intervalFunction: ", error);
      return error;
    }
  }

  async setIntervalTournament() {
    let countError = 0;
    this.tournamentInterval = setInterval(async () => {
      const error = await this.intervalFunction();
      if (!error) countError = 0;
      else {
        console.error("Interval return error:", error);
        if (error instanceof CustomError && error.modalTitle != "Error") {
          this.clearLobbyInterval();
          error.showModalCustom();
          navigateTo(error.redirect);
          return;
        }
        countError++;
        console.error(
          `setIntervalTournament: countError = ${countError}`,
          error,
        );
      }
      if (countError == 5) {
        this.clearLobbyInterval();
        removeSessionStorage();
        if (error instanceof CustomError) {
          error.showModalCustom();
          navigateTo(error.redirect);
        } else console.error("startNotificationPolling: ", error);
      }
    }, 1000);
  }

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
        error.showModalCustom();
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

  async handleRemovePlayer(ev) {
    console.log("Remove Player");
    ev.preventDefault();
    try {
      const listItem = ev.target.closest(".list-group-item");
      const usernameElement = listItem.querySelector("h5");
      const username = usernameElement ? usernameElement.textContent : null;
      const request = await this.makeRequest(
        `/api/matchmaking/tournament/remove_players/`,
        "PATCH",
        {
          invited_players: [`${username}`],
        },
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        console.log(`Player ${username} removed from tournament`);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        error.showModalCustom();
        navigateTo(error.redirect);
      } else {
        console.error("handleRemovePlayer:", error);
      }
    }
  }

  async handleStartTournament(ev) {
    ev.preventDefault();
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/tournament/launch/",
        "PATCH",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        console.log("Success");
        navigateTo("/pong-remote-tournament");
      }
    } catch (error) {
      if (error instanceof CustomError) {
        error.showModalCustom();
        navigateTo(error);
      } else {
        console.error("handleStartTournament: ", error);
      }
    }
  }

  async handleLeavePlayer(ev) {
    ev.preventDefault();
    try {
      const request = await this.makeRequest(
        ev.target.dataset.leaveurl,
        "PATCH",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        showModal(
          this.lang.getTranslation(["title", "tournament"]),
          this.lang.getTranslation(["tournament", "left_tournament"]),
        );
        navigateTo("/");
      }
    } catch (error) {
      if (error instanceof CustomError) {
        error.showModalCustom();
        navigateTo(error.redirect);
      } else {
        console.error("handleLeavePlayer:", error);
      }
    }
  }

  async handleCancelTournament(ev) {
    ev.preventDefault();
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/tournament/delete/",
        "DELETE",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        this.clearLobbyInterval();
        showModal(`${this.lang.getTranslation(["title", "tournament"])}`, `${this.lang.getTranslation(["tournament", "canceled"])}`);
        navigateTo("/pong-remote-menu");
      }
    } catch (error) {
      if (error instanceof CustomError) {
        error.showModalCustom();
        navigateTo(error.redirect);
      } else {
        console.error("handleCancelTournament", error);
      }
    }
  }

  clearDynamicEventListeners() {
    const allRemoveButton = document.querySelectorAll(".removePlayer");
    allRemoveButton.forEach((button) => {
      button.removeEventListener("click", this.handleRemovePlayer);
    });

    const allCancelButton = document.querySelectorAll(".removePlayer");
    allCancelButton.forEach((button) => {
      button.removeEventListener("click", this.handleRemovePlayer);
    });

    const leave = document.querySelector(".leavePlayer");
    if (leave) {
      leave.removeEventListener("click", this.handleLeavePlayer);
    }
  }

  addDynamicEventListeners() {
    const allRemoveButton = document.querySelectorAll(".removePlayer");
    if (allRemoveButton)
      allRemoveButton.forEach((button) => {
        button.addEventListener("click", this.handleRemovePlayer);
      });

    const allCancelButton = document.querySelectorAll(".cancelPlayer");
    if (allCancelButton)
      allCancelButton.forEach((button) => {
        button.addEventListener("click", this.handleRemovePlayer);
      });

    const leave = document.querySelector(".leavePlayer");
    if (leave) {
      leave.addEventListener("click", this.handleLeavePlayer);
    }
  }

  clearLobbyInterval(ev) {
    clearInterval(this.tournamentInterval);
    this.tournamentInterval = null;
  }

  async handleInviteFriend(ev) {
    ev.preventDefault();
    try {
      const username = ev.target.dataset.username;
      await this.invitePlayerTournament(username);
    } catch (error) {
      if (error instanceof CustomError) {
        error.showModalCustom();
        navigateTo(error.redirect);
      } else {
        console.error("handleInviteFriend", error);
      }
    }
  }

  async handleFriendList(ev) {
    const inviteFriendButtonRemove = document.querySelectorAll(".inviteFriend");
    if (inviteFriendButtonRemove)
      inviteFriendButtonRemove.forEach((button) => {
        button.removeEventListener("click", this.handleInviteFriend);
      });
    const friendListContent = await this.getFriendList();
    document.getElementById("friendListModalContent").innerHTML =
      friendListContent;
    let friendListModal = bootstrap.Modal.getInstance(
      document.getElementById("friendListModal"),
    );
    if (!friendListModal)
      friendListModal = new bootstrap.Modal(
        document.getElementById("friendListModal"),
      );
    friendListModal.show();
    const inviteFriendButton = document.querySelectorAll(".inviteFriend");
    if (inviteFriendButton)
      inviteFriendButton.forEach((button) => {
        button.addEventListener("click", this.handleInviteFriend);
      });
  }

  async addEventListeners() {
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

    const friendList = document.getElementById("friend-list");
    if (friendList) friendList.addEventListener("click", this.handleFriendList);

    const startTournamentBtn = document.querySelector("#startTournamentBtn");
    startTournamentBtn.addEventListener("click", this.handleStartTournament);

    this.addDynamicEventListeners();
    try {
      await this.setIntervalTournament();
    } catch (error) {
      this.handleCatch(error);
    }
    const cancelTournamentBtn = document.querySelector("#cancelTournamentBtn");
    if (cancelTournamentBtn) {
      cancelTournamentBtn.addEventListener(
        "click",
        this.handleCancelTournament,
      );
    }

    document.addEventListener("beforeunload", this.clearLobbyInterval);
  }

  async removeEventListeners() {
    const playerInviteTournamentButton = document.querySelector(
      "#invitePlayerTournamentButton",
    );
    if (playerInviteTournamentButton)
      playerInviteTournamentButton.removeEventListener(
        "click",
        this.handleInvitePlayerTournament,
      );

    const pending = document.querySelector("#pending");
    if (pending)
      pending.removeEventListener("click", this.handleShowPendingButton);

    const inputPlayerUsername = document.querySelector(
      "#inputInvitePlayerTournament",
    );
    if (inputPlayerUsername)
      inputPlayerUsername.removeEventListener(
        "input",
        this.handleInputUsername,
      );

    const showFriends = document.querySelector("#friend-list");
    if (showFriends)
      showFriends.removeEventListener("click", this.handleShowFriendsModal);

    const startTournamentBtn = document.querySelector("#startTournamentBtn");
    if (startTournamentBtn)
      startTournamentBtn.removeEventListener(
        "click",
        this.handleStartTournament,
      );

    const friendList = document.getElementById("friend-list");
    if (friendList)
      friendList.removeEventListener("click", this.handleFriendList);

    this.clearDynamicEventListeners();
    this.clearLobbyInterval();
    document.removeEventListener("beforeunload", this.clearLobbyInterval);
  }
}
