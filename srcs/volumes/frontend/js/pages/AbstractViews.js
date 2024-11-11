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
  static invitesTournament= [];
  static pollingInterval = null;

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
        `${this.lang.getTranslation(["modal", "title", "error"])}`,
        `${this.lang.getTranslation(["modal", "message", "notLog"])}`,
        "/",
      );
    }
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

  populatesInvites() {
    const inviteList = document.getElementById("inviteList");
    inviteList.innerHTML = "";

    if (!AbstractViews.invitesArray.length) {
      inviteList.innerHTML = ``;
      return;
    }

    AbstractViews.invitesArray.forEach((invite) => {
      const inviteItem = document.createElement("li");
      inviteItem.className = "list-group-item";

      inviteItem.innerHTML = `
          <div class= "d-flex align-items-center">
        <div class="removeElem rounded-circle Avatar ${invite.opponentStatus} me-3" 
             style="background-image: url('${invite.opponentAvatar}')" 
             alt="Avatar">
        </div>
        <div class="flex-grow-1">
          <h5><strong>${invite.player}</strong></h5>
          <p>${invite.message}</p>
        </div>
      </div >
          <div class="d-flex justify-content-end mt-2">
            <button class="btn btn-success btn-sm me-2 accept-button"
              data-invite-id="${invite.id}"
              data-action="accept"
              data-game="${invite.gameType}">
              <i class="bi bi-check-circle"></i> ${this.lang.getTranslation(["button", "accept"])}
            </button>
            <button class="btn btn-danger btn-sm refuse-button"
              data-invite-id="${invite.id}"
              data-action="refuse"
              data-game="${invite.gameType}">
              <i class="bi bi-x-circle"></i> ${this.lang.getTranslation(["button", "accept"])}
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
      let data = null;
      if (await this.handleStatus(response))
        data = await this.getDatafromRequest(response);
      if (data == null) {
        throw new Error(`fail to get info on ${user}`)
      }
      return data;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async createInvites(data, username) {
    if (!data || data.length == 0) return 0;
    console.log(data);
    try {
      let count = 0;
      for (const item of data) {
        if (item.status === "finished") continue;
        if (item.delete_invite != null) {
          count += await this.cancelOnGoingMatch(item);
          continue;
        }
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
          message: `${opponentName} ${this.lang.getTranslation(["modal", "message", "inviteYou"])} ${item.game_type}`,
        };
        console.log("invite", invite);
        AbstractViews.invitesArray.push(invite);
      }
      return count;
    } catch (error) {
      this.handleCatch(error);
      return 0;
    }
  }

  async inviteRequest(url, game) {
    try {
      const request = await this.makeRequest(url, "PATCH");
      const response = await fetch(request);
      console.log("inviteRequest: response", response);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        console.log("inviteRequest: response:ok:data", data);
        sessionStorage.setItem("transcendence_game_id", data.MatchId);
        const modalInvitesDiv = document.getElementById("inviteUserModal");
        const modalInvitesElem = bootstrap.Modal.getInstance(modalInvitesDiv);
        modalInvitesElem.hide();
        navigateTo(`/${game}?connection=remote`);
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async handleInvites(ev) {
    try {
      const button = ev.target.closest(".accept-button, .refuse-button");
      if (!button) return;
      const inviteId = button.dataset.inviteId;
      const action = button.dataset.action;

      const invite = AbstractViews.invitesArray.find(
        (inv) => inv.id === inviteId,
      );
      if (invite) {
        const url =
          action === "accept"
            ? invite.acceptInviteUrl
            : invite.declineInviteUrl;
        console.log(`URL: ${url}; action: ${action} `);
        const game = invite.gameType == "pong" ? "pong" : "c4";
        await this.inviteRequest(url, game);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      } else console.error("handleInvites:", error);
    }
  }

  async updatePendingInvites(data) {
    try {
      AbstractViews.invitesArray = [];
      const username = sessionStorage.getItem("username_transcendence");
      let boolGame = await this.createInvites(data, username);
      return boolGame;
    } catch (error) {
      this.handleCatch(error);
      return 0;
    }
  }

  async updateOnGoingInfo(data) {
    try {
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
      const request = await this.makeRequest(`/api/users/${opponent}`, "GET");
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        opponentInviteAvatar.style = `background-image: url(${data.profilePic})`;
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async cancelOnGoingMatch(data) {
    try {
      if (!data) return 0;
      await this.updateOnGoingInfo(data);
      const joinButton = document.querySelector("#buttonOnGoingGame");
      sessionStorage.setItem("transcendence_game_id", data.matchId);
      joinButton.classList.remove("btn-success");
      joinButton.classList.add("btn-danger");
      joinButton.innerText = `${this.lang.getTranslation(["button", "cancel"]).toUpperCase()} `;
      joinButton.dataset.redirectUrl = `${data.delete_invite}`;
      return 1;
    } catch (error) {
      this.handleCatch(error);
      return 0;
    }
  }

  async updateOnGoingMatch(data) {
    try {
      if (!data || !data.game_type) return 0;
      await this.updateOnGoingInfo(data);
      const joinButton = document.querySelector("#buttonOnGoingGame");
      sessionStorage.setItem("transcendence_game_id", data.matchId);
      joinButton.classList.remove("btn-danger");
      joinButton.classList.add("btn-success");
      joinButton.innerText = `${this.lang.getTranslation(["button", "join"]).toUpperCase()}`;
      joinButton.dataset.redirectUrl = `/${data.game_type}?connection=remote`;
      return 1;
    } catch (error) {
      this.handleCatch(error);
      return 0;
    }
  }



  async updateMainPendingTournament(data) {
    AbstractViews.invitesTournament= [];
     if (!data || data.length == 0) return 0;
    console.log(data);
    try {

    } catch (error) {
      this.handleCatch(error);
      return 0;
    }
  }

  async fetchMainInvites() {
    try {
      const onGoingGame = document.querySelector("#divOnGoingGame");
      let boolGame = 0;
      const request = await this.makeRequest("api/matchmaking/invites", "GET");
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        console.log("Invites: ", data);
        if (response.status == 204) {
          onGoingGame.style.display = "none";
          return 0;
        }
        boolGame = await this.updateOnGoingMatch(data.on_going_match);
        let count =
          (data.match_pending.length ? data.match_pending.length : 0) +
          boolGame;
        boolGame += await this.updatePendingInvites(data.match_pending);
        if (boolGame == 0) onGoingGame.style.display = "none";
        else onGoingGame.style.display = "block";
        count += await this.updateMainPendingTournament(data.tournament_pending);
        return count;
      }
      onGoingGame.style.display = "none";
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async fetchNotifications() {
    try {
      const badge = document.getElementById("notificationbell");
      const numberBell = await this.fetchMainInvites();
      if (numberBell === undefined) {
        badge.innerHTML = "";
        return undefined;
      }
      if (numberBell == 0) badge.innerHTML = "";
      else
        badge.innerHTML = `<div class="notification-badge">${numberBell}</div>`;
      return 0;
    } catch (error) {
      this.handleCatch(error);
      return 0;
    }
  }

  startNotificationPolling() {
    if (!AbstractViews.pollingInterval) {
      AbstractViews.pollingInterval = setInterval(async () => {
        try {
          await this.fetchNotifications();
        } catch (error) {
          clearInterval(AbstractViews.pollingInterval);
          AbstractViews.pollingInterval = null;
          removeSessionStorage();
          if (error instanceof CustomError) {
            showModal(error.title, error.message);
            navigateTo(error.redirect);
          } else console.error("startNotificationPolling: ", error);
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
      loginOverlay.innerHTML = `<i class= "bi bi-box-arrow-right" ></i>${this.lang.getTranslation(["title", "logout"])}`;
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
      loginOverlay.innerHTML = `<i class= "bi bi-box-arrow-left"></i> ${this.lang.getTranslation(["title", "login"])}`;
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
      if (!whitelist.test(input)) {
        return false;
      }
    }
    return true;
  }

  async loadCss() {}

  async addEventListeners() {}

  makeHeaders(accessToken, boolJSON) {
    const myHeaders = new Headers();
    if (accessToken != null) {
      myHeaders.append("Authorization", "Bearer " + accessToken);
    }
    myHeaders.append("lang", this.lang.getCurrentLanguage());
    if (boolJSON === true) {
      console.log("manual header");
      myHeaders.append("Content-Type", "application/json");
    }
    // myHeaders.forEach((value, key) => {
    //   console.log(key + ": " + value);
    // });
    return myHeaders;
  }

  async handleStatus(response) {
    try {
      let data;
      if (!response.ok) {
         data = await this.getDatafromRequest(response);
      }
      if (response.status == 401) {
        console.error("401 error:response:", response);
        removeSessionStorage();
        throw new CustomError(
          `${this.lang.getTranslation(["modal", "title", "error"])}`,
          `${this.lang.getTranslation(["modal", "message", data])}`,
          "/login",
        );
      }
      if (response.status == 502) {
        console.error("502 error:response:", response);
        removeSessionStorage();
        throw new CustomError(
          `${this.lang.getTranslation(["modal", "title", "error"])}`,
          `${this.lang.getTranslation(["modal", "message", "serverLoading"])}`,
          "/",
        );
      }
      if (!response.ok) {
        if (response.status == 404) return false;
        console.error(`${response.status} error: response: `, response);
        console.error("with json:", data);
        showModal(
          `${this.lang.getTranslation(["modal", "title", "error"])}`,
          this.JSONtoModal(data),
        );
        return false;
      }
      return true;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  handleCatch(error) {
    if (error instanceof CustomError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.error("Network error detected:", error);
      removeSessionStorage();
      throw new CustomError(
        `${this.lang.getTranslation(["modal", "title", "error"])} `,
        `${this.lang.getTranslation(["modal", "message", "failConnectServer"])}`,
        "/",
      );
    } else {
      console.error(error);
    }
  }

  JSONtoModal(data) {
    const messagesJoin = Object.entries(data)
      .map(([field, message]) => {
        if (Array.isArray(message)) {
          return message.join(", ");
        } else {
          return message;
        }
      })
      .join("<br>");
    return messagesJoin;
  }

  async getDatafromRequest(response) {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const responseText = await response.text();
        if (!responseText) {
          console.log("JSON IS EMPTY");
          return "Empty response";
        }
        const dataJSON = JSON.parse(responseText);
        return dataJSON;
      } catch (error) {
        console.error("getDatafromRequest:", error.message);
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
        this.handleCatch(error);
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
        `${this.lang.getTranslation("modal", "title", "error")}`,
        `${this.lang.getTranslation(["modal", "message", "authError"])}`,
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
      if (await this.handleStatus(response)) {
        const data = await response.json();
        setSessionStorage(data);
      } else {
        removeSessionStorage();
        throw new CustomError(
          `${this.lang.getTranslation("modal", "title", "error")}`,
          `${this.lang.getTranslation(["modal", "message", "authError"])}`,
          "/login",
        );
      }
    } catch (error) {
      this.handleCatch(error);
      throw new CustomError(
        `${this.lang.getTranslation("modal", "title", "error")}`,
        `${this.lang.getTranslation(["modal", "message", "authError"])}`,
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
        removeSessionStorage();
        throw new CustomError(
          `${this.lang.getTranslation(["modal", "title", "error"])}`,
          `${this.lang.getTranslation(["modal", "message", "notLog"])}`,
          "/login",
        );
      }
      const parseToken = this.parseJwt(authToken);
      const currentTime = Math.floor(Date.now() / 1000);
      if (parseToken.exp - 10 <= currentTime) {
        await this.refreshToken(authToken);
      }
    } catch (error) {
      this.handleCatch(error);
      throw error;
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
