import { navigateTo } from "../router.js";
import {
  removeSessionStorage,
  setSessionStorage,
  showModal,
} from "../Utils/Utils.js";
import Language from "../Utils/Language.js";
import CustomError from "../Utils/CustomError.js";

export default class AbstractViews {
  static invitesArray = [];
  static pollingInterval = null;
  static AcceptInterval = null;

  constructor() {
    this.populatesInvites = this.populatesInvites.bind(this);
    this.handleInvites = this.handleInvites.bind(this);
    this.lang = new Language();
    this.loginToLogout();
    this.addInviteListeners();
    this.closeSidebarOnNavigate();
  }

  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  closeSidebarOnNavigate() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar.classList.contains("show")) {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(sidebar);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    }
  }

  addInviteListeners() {
    const inviteList = document.getElementById("inviteList");
    inviteList.addEventListener("click", this.handleInvites);
  }

  removeInviteEventListeners() {
    const inviteList = document.getElementById("inviteList");
    inviteList.removeEventListener("click", this.handleInvites);
  }

  createPageCss(refCss) {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = refCss;
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);
  }

  removeElem() {
    const elementsToRemove = document.querySelectorAll(".removeElem");
    const reversedElements = Array.from(elementsToRemove).reverse();
    reversedElements.forEach((elem) => {
      if (elem.parentNode) {
        elem.innerHTML = "";
        elem.parentNode.removeChild(elem);
      } else console.log("Elem not removed", elem);
    });
  }
  removeCss() {
    for (let i = document.styleSheets.length - 1; i >= 0; i--) {
      let styleSheet = document.styleSheets[i];
      if (
        styleSheet.ownerNode &&
        styleSheet.ownerNode.classList.contains("page-css")
      ) {
        console.log(`remove .page-css: ${styleSheet}`);
        styleSheet.ownerNode.remove();
        styleSheet = null;
      }
    }

    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.href = null;
      e.parentNode.removeChild(e);
      e = null;
    });
  }

  async checkLogin() {
    if (
      !sessionStorage.getItem("username_transcendence") ||
      !sessionStorage.getItem("accessJWT_transcendence") ||
      !sessionStorage.getItem("refreshJWT_transcendence")
    ) {
      removeSessionStorage();
      throw new CustomError(
        `${this.lang.getTranslation(["modal", "error"])}`,
        "You're not logged, please login to access this page",
        "/",
      );
    }
    try {
      await this.fetchNotifications();
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("checkLogin: ", error);
      }
    }
  }

  populatesInvites() {
    const inviteList = document.getElementById("inviteList");
    inviteList.innerHTML = "";

    if (!AbstractViews.invitesArray.length) {
      inviteList.innerHTML = "No Invites";
      return;
    }

    AbstractViews.invitesArray.forEach((invite) => {
      const inviteItem = document.createElement("li");
      inviteItem.className = "list-group-item";

      inviteItem.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="removeElem rounded-circle Avatar ${invite.opponentStatus} me-3" 
             style="background-image: url('${invite.opponentAvatar}')" 
             alt="Avatar">
        </div>
        <div class="flex-grow-1">
          <h5><strong>${invite.player}</strong></h5>
          <p>${invite.message}</p>
        </div>
      </div>
      <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-success btn-sm me-2 accept-button" 
                data-invite-id="${invite.id}" 
                data-action="accept">
          <i class="bi bi-check-circle"></i> Accept
        </button>
        <button class="btn btn-danger btn-sm refuse-button" 
                data-invite-id="${invite.id}" 
                data-action="refuse">
          <i class="bi bi-x-circle"></i> Refuse
        </button>
      </div>
    `;

      inviteList.appendChild(inviteItem);
    });
  }

  async getUserInfo(user) {
    try {
      const request = await this.makeRequest(`/api/users/${user}/`, "GET");
      const response = await fetch(request);
      const data = await this.getErrorLogfromServer(response, true);
      if (!response.ok) {
        console.error(`Notifications:getAvatar on ${user}: ${data}`, response);
        return;
      }
      return data;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error(`Notifications:getAvatar on ${user}`, response);
      }
    }
  }

  async createInvites(data, username) {
    console.log(data);
    for (const item of data.results) {
      if (item.status === "finished") continue;
      const opponentName =
        item.player2 != username ? item.player2 : item.player1;
      const opponent = await this.getUserInfo(opponentName);
      const invite = {
        id: `item.id?${opponentName}`,
        player: opponentName,
        gameType: item.game_type,
        createdAt: item.created_at,
        acceptInviteUrl: item.accept_invite,
        declineInviteUrl: item.decline_invite,
        opponentAvatar: opponent.profilePic,
        opponentStatus: opponent.is_online,
        message: `${opponentName} invites you to a game of ${item.game_type}`,
      };
      console.log("invite", invite);
      AbstractViews.invitesArray.push(invite);
    }
  }

  async inviteRequest(url, action) {
    try {
      const request = await this.makeRequest(url, "PATCH");
      const response = await fetch(request);
      console.log("inviteRequest: response", response);
      if (response.ok) {
        const data = await this.getErrorLogfromServer(response, true);
        console.log("inviteRequest: response:ok:data", data);
        sessionStorage.setItem("transcendence_game_id", data.MatchId);
        const modalInvitesDiv = document.getElementById("inviteUserModal");
        const modalInvitesElem = bootstrap.Modal.getInstance(modalInvitesDiv);
        modalInvitesElem.hide();
        navigateTo(`/pong?connection=remote`);
      } else {
        const dataError = await this.getErrorLogfromServer(response);
        console.log("inviteRequest: fail response:data:", dataError);
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("inviteRequest:", error);
      }
    }
  }

  async handleInvites(ev) {
    console.log("event handleInvite");
    const button = ev.target.closest(".accept-button, .refuse-button");
    if (!button) return;
    const inviteId = button.dataset.inviteId;
    const action = button.dataset.action;

    const invite = AbstractViews.invitesArray.find(
      (inv) => inv.id === inviteId,
    );
    if (invite) {
      const url =
        action === "accept" ? invite.acceptInviteUrl : invite.declineInviteUrl;
      console.log(`URL: ${url}; action: ${action}`);
      await this.inviteRequest(url, action);
    }
  }

  async fetchInvites(boolGame) {
    AbstractViews.invitesArray = [];
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/match/pending_invites/",
        "GET",
      );
      //TODO loop on next if more than 10 invite
      const response = await fetch(request);
      const data = await this.getErrorLogfromServer(response, true);
      console.info(response);
      console.info(data);
      const count = data.count ? data.count : 0;
      const badge = document.getElementById("notificationbell");
      if (count + boolGame == 0) {
        badge.innerHTML = "";
        return;
      }
      badge.innerHTML = `<div class="notification-badge">${boolGame} </div>`;
      const username = sessionStorage.getItem("username_transcendence");
      if (response.status != 200) {
        return;
      }
      await this.createInvites(data, username);
      badge.innerHTML = `<div class="notification-badge">${AbstractViews.invitesArray.length + boolGame} </div>`;
    } catch (error) {
      console.log("caught error");
      if (error instanceof CustomError) throw error;
      else {
        console.error("fetchNotifications:", error);
      }
    }
  }

  async updateOnGoing(data) {
    const opponentInviteId = document.querySelector("#opponentInviteId");
    const opponentInviteAvatar = document.querySelector(
      "#opponentInviteAvatar",
    );
    let opponent = data.player1;
    const username = sessionStorage.getItem("username_transcendence");
    if (username != data.player1) {
      opponent = data.player2;
    }
    opponentInviteId.innerText = "";
    opponentInviteId.innerText = opponent;
    try {
      const request = await this.makeRequest(`/api/users/${opponent}`, "GET");
      const response = await fetch(request);
      if (response.ok) {
        const data = await this.getErrorLogfromServer(response, true);
        opponentInviteAvatar.style = `background-image: url(${data.profilePic})`;
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("updateOnGoing", error);
      }
    }
  }

  async fetchOnGoingGame() {
    const joinButton = document.querySelector("#buttonOnGoingGame");
    if (AbstractViews.AcceptInterval) return 0;
    try {
      const request = await this.makeRequest(
        "/api/matchmaking/match/get_accepted",
        "GET",
      );
      const response = await fetch(request);
      if (response.status == 200) {
        const data = await this.getErrorLogfromServer(response, true);
        // console.info("OngoingGame:", data);
        await this.updateOnGoing(data);
        sessionStorage.setItem("transcendence_game_id", data.matchId);
        joinButton.classList.remove("btn-danger");
        joinButton.classList.add("btn-success");
        joinButton.innerText = "JOIN";
        joinButton.dataset.redirectUrl = "/pong?connection=remote";
        return 1;
      } else {
        return 0;
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("FetchOnGoingGame:", error);
        return 0;
      }
    }
  }

  async fetchSentInvite() {
    const request = await this.makeRequest(
      "api/matchmaking/match/sent_invite/",
      "GET",
    );
    const response = await fetch(request);
    const data = await this.getErrorLogfromServer(response, true);
    // console.log("SentInvite: ", data);
    // console.log("SentInvite:data.delete_invite:", data.delete_invite);
    if (response.status == 200) {
      this.updateOnGoing(data);
      const onGoingGameButton = document.querySelector("#buttonOnGoingGame");
      onGoingGameButton.innerText = "CANCEL";
      onGoingGameButton.dataset.redirectUrl = data.delete_invite;
      onGoingGameButton.classList.remove("btn-success");
      onGoingGameButton.classList.add("btn-danger");
      return 1;
    }
    return 0;
  }

  async fetchNotifications() {
    try {
      let boolGame = await this.fetchOnGoingGame();
      boolGame += await this.fetchSentInvite();
      const onGoingGame = document.querySelector("#divOnGoingGame");
      if (boolGame == 0) {
        onGoingGame.style.display = "none";
      } else onGoingGame.style.display = "block";
      await this.fetchInvites(boolGame);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("fetchNotifications:", error);
      }
    }
  }

  startNotificationPolling() {
    if (!AbstractViews.pollingInterval) {
      AbstractViews.pollingInterval = setInterval(async () => {
        try {
          await this.fetchNotifications();
        } catch (error) {
          AbstractViews.pollingInterval = null;
          removeSessionStorage();
          console.error("startNotificationPolling: ", error);
          navigateTo("/");
          showModal("error", error.message);
        }
      }, 3000);
    }
  }

  loginToLogout() {
    console.log("LOGIN");
    const username = sessionStorage.getItem("username_transcendence");
    const accessToken = sessionStorage.getItem("accessJWT_transcendence");
    const refreshToken = sessionStorage.getItem("refreshJWT_transcendence");
    const loginOverlay = document.querySelector("#overlayLogin");
    const logIcon = document.querySelector("#logIconRef");
    const logIconImg = document.querySelector("#logIconImg");
    const notifButton = document.querySelector("#notifButtonModal");
    const inviteModalEl = document.getElementById("inviteUserModal");
    if (username && accessToken && refreshToken) {
      loginOverlay.innerHTML = "";
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-right"></i> ${this.lang.getTranslation(["title", "logout"])}`;
      loginOverlay.href = "";
      loginOverlay.href = "/logout";
      logIcon.href = "";
      logIcon.href = "/logout";
      logIcon.title = this.lang.getTranslation(["title", "logout"]);
      logIconImg.classList.remove("bi-box-arrow-left");
      logIconImg.classList.add("bi-box-arrow-right");
      if (notifButton.style.display == "none") {
        notifButton.style.display = "block";
        let modalInviteInstance = bootstrap.Modal.getInstance(inviteModalEl);
        if (!modalInviteInstance)
          modalInviteInstance = new bootstrap.Modal(inviteModalEl);
        inviteModalEl.addEventListener("show.bs.modal", this.populatesInvites);
      }
      this.startNotificationPolling();
    } else {
      if (username || accessToken || refreshToken) {
        removeSessionStorage();
      }
      loginOverlay.innerHTML = "";
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-left"></i> ${this.lang.getTranslation(["title", "login"])}`;
      loginOverlay.href = "";
      loginOverlay.href = "/login";
      logIcon.href = "";
      logIcon.href = "/login";
      logIcon.title = this.lang.getTranslation(["title", "login"]);
      logIconImg.classList.remove("bi-box-arrow-right");
      logIconImg.classList.add("bi-box-arrow-left");
      const badge = document.getElementById("notificationbell");
      badge.innerHTML = "";
      if (notifButton.style.display == "block") {
        notifButton.style.display = "none";
        inviteModalEl.removeEventListener(
          "show.bs.modal",
          this.populatesInvites,
        );
      }
      clearInterval(AbstractViews.pollingInterval);
      AbstractViews.pollingInterval = null;
    }
  }

  cleanModal() {
    const modal = document.querySelector("#app").querySelectorAll(".modal");
    if (modal) {
      modal.forEach((element) => {
        console.log("removing modal: ", element.id);
        const modalInstance = bootstrap.Modal.getInstance(element);
        if (modalInstance) modalInstance.hide();
        element.remove();
      });
    }
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
  }

  parseJwt(token) {
    let base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    let jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  }

  sanitizeInput(inputList) {
    const whitelist = /^[a-zA-Z0-9_@.+-]*$/;
    for (let i = 0; i < inputList.length; i++) {
      const input = inputList[i];
      // console.log("input = ", input);
      if (!whitelist.test(input)) {
        return false;
      }
    }
    return true;
  }

  async loadCss() { }

  async addEventListeners() { }

  makeHeaders(accessToken, boolJSON) {
    const myHeaders = new Headers();
    if (accessToken != null) {
      myHeaders.append("Authorization", "Bearer " + accessToken);
    }
    if (boolJSON === true) {
      console.log("manual header");
      myHeaders.append("Content-Type", "application/json");
    }
    // myHeaders.forEach((value, key) => {
    //   console.log(key + ": " + value);
    // });
    return myHeaders;
  }

  async getErrorLogfromServer(response, boolJSON = false) {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const responseText = await response.text();
        if (!responseText) {
          console.log("RESPONSE IS EMPTY");
          return "Empty response";
        }
        const errorJSON = JSON.parse(responseText);
        if (boolJSON) return errorJSON;
        const errorMessages = Object.entries(errorJSON)
          .map(([field, errorMessage]) => {
            // Ensure errorMessage is an array; if not, make it an array
            if (Array.isArray(errorMessage)) {
              return errorMessage.join(", ");
            } else {
              return errorMessage; // Just use the string directly if not an array
            }
          })
          .join("<br>");
        return errorMessages;
      } catch (error) {
        console.error("getErrorLogfromServer:", error.message);
        return error;
      }
    } else {
      return `${response.status} ${response.statusText}`;
    }
  }

  async makeRequest(url, myMethod = "GET", myBody = null, boolImage = false) {
    const username = sessionStorage.getItem("username_transcendence");
    let accessToken = null;
    if (username) {
      try {
        accessToken = await this.getToken();
      } catch (error) {
        if (!(error instanceof CustomError)) {
          console.error("Error in getToken:", error);
        }
        throw error;
      }
    }
    const options = {
      method: myMethod.toString(),
      headers: this.makeHeaders(accessToken, myBody != null && !boolImage),
    };
    if (myBody) {
      if (boolImage) {
        options.body = myBody;
      } else options.body = JSON.stringify(myBody);
    }
    const myRequest = new Request(url, options);
    return myRequest;
  }

  async refreshToken(accessToken) {
    const refreshJWT = sessionStorage.getItem("refreshJWT_transcendence");
    // console.log("refreshJWT before = ", refreshJWT);
    // console.log("accessJWT before = ", accessToken);
    if (!refreshJWT) {
      removeSessionStorage();
      throw new CustomError(
        `${this.lang.getTranslation("modal", "error")}`,
        `${this.lang.getTranslation(["error", "failRefresh"])}`,
        "/login",
      );
    }
    try {
      const myHeaders = this.makeHeaders(accessToken, true);
      const request = new Request("/api/auth/refresh", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          refresh: refreshJWT,
        }),
      });
      const response = await fetch(request);
      if (response.ok) {
        const data = await response.json();
        setSessionStorage(data);
      } else {
        const log = this.getErrorLogfromServer(response);
        console.log("ERROR REFRESH:", response);
        console.log("log: ", log);
        removeSessionStorage();
        throw new CustomError(
          `${this.lang.getTranslation("modal", "error")}`,
          `${this.lang.getTranslation(["error", "failRefresh"])}`,
          "/login",
        );
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.debug("Error refreshing token:", error.message);
      removeSessionStorage();
      throw new CustomError(
        `${this.lang.getTranslation("modal", "error")}`,
        `${this.lang.getTranslation(["error", "failRefresh"])}`,
        "/login",
      );
    }
  }

  async getToken() {
    let authToken = sessionStorage.getItem("accessJWT_transcendence");
    const refreshToken = sessionStorage.getItem("refreshJWT_transcendence");
    try {
      if (
        !authToken ||
        !refreshToken ||
        !sessionStorage.getItem("username_transcendence")
      ) {
        console.log("User is not authentified", authToken);
        removeSessionStorage();
        throw new CustomError(
          `${this.lang.getTranslation(["modal", "error"])}`,
          `${this.lang.getTranslation(["error", "notAuthentified"])}`,
          "/login",
        );
      }
      const parseToken = this.parseJwt(authToken);
      const currentTime = Math.floor(Date.now() / 1000);
      if (parseToken.exp + 1 <= currentTime) {
        await this.refreshToken(authToken);
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("getToken", error);
        throw error;
      }
    }
    authToken = sessionStorage.getItem("accessJWT_transcendence");
    return authToken;
  }

  removeEventListeners() {
    return;
  }

  destroy() {
    console.log("Destroy");
    this.removeInviteEventListeners();
    this.removeEventListeners();
    this.cleanModal();
    this.removeCss();
    this.removeElem();
  }
}
