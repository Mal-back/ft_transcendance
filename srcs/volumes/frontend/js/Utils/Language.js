let instance = null;

export default class Language {
  constructor() {
    if (!instance) {
      console.log("New Language");
      this.currentLanguage = sessionStorage.getItem("transcendence_language");
      this.JSONLanguage = null;
      instance = this;
    } else console.log("Already Instancied");
    return instance;
  }

  translateIndex() {
    console.log(`MENU: ${this.getTranslation(["menu", "profile"])}`);
    const menuGame = document.getElementById("menuGame");
    menuGame.innerHTML = `<i class="bi bi-controller"></i> ${this.getTranslation(["menu", "game"])}`;
    document.getElementById("menuProfile").innerHTML =
      `<i class="bi bi-person"></i> ${this.getTranslation(["menu", "profile"])}`;
    document.getElementById("menuFriends").innerHTML =
      `<i class="bi bi-person-heart"></i> ${this.getTranslation(["menu", "friends"])}`;
    const loginOverlay = document.querySelector("#overlayLogin");
    if (sessionStorage.getItem("accessJWT_transcendence")) {
      loginOverlay.innerHTML = `<i class="bi bi=box-arrow-in-right"></i> ${this.getTranslation(["menu", "logout"])}`;
    } else {
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-in-left"></i> ${this.getTranslation(["menu", "login"])}`;
    }
    const alertLabel = document.getElementById("alertLabel");
    alertLabel.innerText = this.getTranslation(["modal", "error"]);
  }

  async fetchJSONLanguage() {
    const lang = this.getCurrentLanguage();
    if (!lang || (lang != "en" && lang != "fr")) lang = "en";
    if (lang == this.currentLanguage && this.JSONLanguage) return;
    try {
      const myHeaders = new Headers();
      const response = await fetch(`/json/${lang}.json`, {
        method: "GET",
        headers: myHeaders,
      });
      this.JSONLanguage = await response.json();
      this.currentLanguage = lang;
      sessionStorage.setItem("transcendence_language", lang);
      console.debug("Get JSON Language:", this.JSONLanguage);
      this.translateIndex();
    } catch (error) {
      console.error("Error in Language", error);
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
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang") || this.currentLanguage || "en";
    return lang;
  }

  getTranslation(arrayKey) {
    console.log("getTranslation")
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
