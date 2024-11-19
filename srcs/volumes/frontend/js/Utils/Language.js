import { setSessionStorage, removeSessionStorage } from "./Utils.js";

let instance = null;

export default class Language {
  constructor() {
    if (!instance) {
      console.log("New Language");
      if (sessionStorage.getItem("transcendence_language") == null)
        sessionStorage.setItem("transcendence_language", "en");
      this.currentLanguage = sessionStorage.getItem("transcendence_language");
      this.JSONLanguage = null;
      instance = this;
    } else console.log("Already Instancied");
    return instance;
  }

  loginToLogout() {
    console.log("LOGIN");
    const username = sessionStorage.getItem("username_transcendence");
    const accessToken = sessionStorage.getItem("accessJWT_transcendence");
    const refreshToken = sessionStorage.getItem("refreshJWT_transcendence");
    const loginOverlay = document.querySelector("#overlayLogin");
    const logIcon = document.querySelector("#logIconRef");
    const logIconImg = document.querySelector("#logIconImg");
    if (username && accessToken && refreshToken) {
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-right"></i> ${this.lang.getTranslation(["title", "logout"])}`;
      loginOverlay.href = "/logout";
      logIcon.href = "/logout";
      logIcon.title = this.lang.getTranslation(["title", "logout"]);
      logIconImg.classList.remove("bi-box-arrow-left");
      logIconImg.classList.add("bi-box-arrow-right");
    } else {
      if (username || accessToken || refreshToken) {
        removeSessionStorage();
      }
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-left"></i> ${this.lang.getTranslation(["title", "login"])}`;
      loginOverlay.href = "/login";
      logIcon.href = "/login";
      logIcon.title = this.lang.getTranslation(["title", "login"]);
      logIconImg.classList.remove("bi-box-arrow-right");
      logIconImg.classList.add("bi-box-arrow-left");
    }
  }

  translateIndex() {
    const menuPong = document.getElementById("menuPong");
    menuPong.innerHTML = `<i class="bi bi-controller"></i> ${this.getTranslation(["title", "pong"])}`;
    const menuConnect4 = document.getElementById("menuConnect4");
    menuConnect4.innerHTML = `<i class="bi bi-controller"></i> ${this.getTranslation(["title", "c4"])}`;
    document.getElementById("menuProfile").innerHTML =
      `<i class="bi bi-person"></i> ${this.getTranslation(["title", "profile"])}`;
    document.getElementById("menuRanking").innerHTML = `<i class="bi bi-trophy"></i> ${this.getTranslation(["title", "ranking"])}`
    document.getElementById("menuFriends").innerHTML =
      `<i class="bi bi-person-heart"></i> ${this.getTranslation(["title", "friends"])}`;
    const loginOverlay = document.querySelector("#overlayLogin");
    if (sessionStorage.getItem("accessJWT_transcendence")) {
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-in-right"></i> ${this.getTranslation(["title", "logout"])}`;
      document.querySelector("#logIconRef").title = this.getTranslation([
        "title",
        "logout",
      ]);
    } else {
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-in-left"></i> ${this.getTranslation(["title", "login"])}`;
      document.querySelector("#logIconRef").title = this.getTranslation([
        "title",
        "login",
      ]);
    }
  }

  translateModal() {
    const alertLabel = document.getElementById("alertLabel");
    alertLabel.innerText = this.getTranslation(["modal", "title", "error"]);
    const gameResultModal = document.getElementById("gameResultModal");
    const gameResultTitle = gameResultModal.querySelector("#gameResultTitle");
    const gameWinnerTitle = gameResultModal.querySelector("#gameWinnerTitle");
    const gameLoserTitle = gameResultModal.querySelector("#gameLoserTitle");
    gameResultTitle.innerText = `${this.getTranslation(["game", "result"])}:`;
    gameWinnerTitle.innerText = `${this.getTranslation(["game", "winner"])} : `;
    gameLoserTitle.innerText = `${this.getTranslation(["game", "loser"])} : `;

    const inviteModalLabel = document.getElementById("inviteModalLabel");
    inviteModalLabel.innerText = `${this.getTranslation(["game", "invites"])}`;
    const onGoingGameText = document.getElementById("onGoingGameText");
    onGoingGameText.innerText = `${this.getTranslation(["game", "onGoing"])} ${this.getTranslation(["game", "label"])}:`;
    const onGoingGameButton = document.querySelector("#buttonOnGoingGame");
    onGoingGameButton.innerText = `${this.getTranslation(["button", "cancel"]).toUpperCase()}`;
    const invitesModalTextTitle = document.getElementById(
      "invitesModalTextTitle",
    );
    invitesModalTextTitle.innerText = `${this.getTranslation(["game", "invites"])}:`;

    const invitesModalCloseButton = document.getElementById(
      "invitesModalCloseButton",
    );
    invitesModalCloseButton.innerText = `${this.getTranslation(["button", "close"])}`;
  }

  objectToMap(jsonDict) {
    const map = new Map();
    for (const [key, value] of Object.entries(jsonDict)) {
      map.set(
        key,
        value instanceof Object && !Array.isArray(value)
          ? this.objectToMap(value)
          : value,
      );
    }
    return map;
  }

  async fetchJSONLanguage() {
    const lang = sessionStorage.getItem("transcendence_language") || "en";
    if (lang == this.currentLanguage && this.JSONLanguage) return;
    try {
      const myHeaders = new Headers();
      const response = await fetch(`/json/${lang}.json`, {
        method: "GET",
        headers: myHeaders,
      });
      if (response.ok) {
        this.JSONLanguage = this.objectToMap(await response.json());
        console.log("JSON:", this.JSONLanguage);
        this.currentLanguage = lang;
        console.debug("Get JSON Language:", this.JSONLanguage);
        this.translateIndex();
        this.translateModal();
      } else {
        console.error("fail to fetch languageJSON");
        sessionStorage.removeItem("transcendence_language");
      }
    } catch (error) {
      sessionStorage.removeItem("transcendence_language");
      console.error(`Error in Language: /json/${lang}.json`, error);
      throw error;
    }
  }

  findKey(mapOrObj, keys) {
    let current = mapOrObj;

    for (const key of keys) {
      // Check if current is a Map and has the key, or if it's an object and has the property
      if (
        (current instanceof Map && current.has(key)) ||
        (current && typeof current === "object" && key in current)
      ) {
        current = current instanceof Map ? current.get(key) : current[key];
      } else {
        // If a key is missing, return the last key in the array as the default
        return undefined;
      }
    }
    return current;
  }

  getCurrentLanguage() {
    const lang = this.currentLanguage || "en";
    return lang;
  }

  getTranslation(arrayKey) {
    let translation = null;
    if (this.JSONLanguage) {
      translation = this.findKey(this.JSONLanguage, arrayKey);
      if (!translation) {
        console.warn("key not found: ", arrayKey);
        translation = arrayKey.at(-1);
      }
    } else {
      console.log("NO JSON");
    }
    return translation;
  }
}
