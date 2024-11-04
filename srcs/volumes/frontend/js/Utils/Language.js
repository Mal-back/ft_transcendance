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
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-right"></i> ${this.lang.getTranslation(["menu", "logout"])}`;
      loginOverlay.href = "/logout";
      logIcon.href = "/logout";
      logIcon.title = this.lang.getTranslation(["menu", "logout"]);
      logIconImg.classList.remove("bi-box-arrow-left");
      logIconImg.classList.add("bi-box-arrow-right");
    } else {
      if (username || accessToken || refreshToken) {
        removeSessionStorage();
      }
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-left"></i> ${this.lang.getTranslation(["menu", "login"])}`;
      loginOverlay.href = "/login";
      logIcon.href = "/login";
      logIcon.title = this.lang.getTranslation(["menu", "login"]);
      logIconImg.classList.remove("bi-box-arrow-right");
      logIconImg.classList.add("bi-box-arrow-left");
    }
  }

  translateIndex() {
    const menuPong = document.getElementById("menuPong");
    menuPong.innerHTML = `<i class="bi bi-controller"></i> ${this.getTranslation(["menu", "pong"])}`;
    const menuConnect4 = document.getElementById("menuConnect4");
    menuConnect4.innerHTML = `<i class="bi bi-controller"></i> ${this.getTranslation(["menu", "connect4"])}`;
    document.getElementById("menuProfile").innerHTML =
      `<i class="bi bi-person"></i> ${this.getTranslation(["menu", "profile"])}`;
    document.getElementById("menuFriends").innerHTML =
      `<i class="bi bi-person-heart"></i> ${this.getTranslation(["menu", "friends"])}`;
    const loginOverlay = document.querySelector("#overlayLogin");
    if (sessionStorage.getItem("accessJWT_transcendence")) {
      loginOverlay.innerHTML = `<i class="bi bi=box-arrow-in-right"></i> ${this.getTranslation(["menu", "logout"])}`;
      document.querySelector("#logIconRef").title = this.getTranslation([
        "menu",
        "logout",
      ]);
    } else {
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-in-left"></i> ${this.getTranslation(["menu", "login"])}`;
      document.querySelector("#logIconRef").title = this.getTranslation([
        "menu",
        "login",
      ]);
    }
    const alertLabel = document.getElementById("alertLabel");
    alertLabel.innerText = this.getTranslation(["modal", "error"]);
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
      this.JSONLanguage = await response.json();
      this.currentLanguage = lang;
      console.debug("Get JSON Language:", this.JSONLanguage);
      this.translateIndex();
    } catch (error) {
      console.error(`Error in Language: /json/${lang}.json`, error);
    }
  }

  findKey(JSONtoSearch, arrayKey) {
    let objectToSearch = JSONtoSearch;
    let lastKey = [];
    for (let key of arrayKey) {
      if (
        objectToSearch != null &&
        typeof objectToSearch === "object" &&
        key in objectToSearch
      ) {
        lastKey.push(key);
        objectToSearch = objectToSearch[key];
      } else {
        console.warn(
          `Warning: Key: ${key} not found in ${lastKey.join(" -> ")}`,
        );
        return null;
      }
    }
    return objectToSearch;
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
        translation = arrayKey.at(-1);
      }
    } else {
      console.log("NO JSON");
    }
    return translation;
  }
}