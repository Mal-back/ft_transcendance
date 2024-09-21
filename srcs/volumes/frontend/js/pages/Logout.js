import { navigateTo } from "../router.js";
import { removeSessionStorage, setSessionStorage } from "./Utils.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Logout");
  }
  async getHtml() {
    removeSessionStorage();
    const username = sessionStorage.getItem("username_transcendence");
    const loginOverlay = document.querySelector("#overlayLogin");
    loginOverlay.innerText = "Login";
    loginOverlay.href = "/login";
    this.showModalWithError("Logout", "Goodbye, " + username);
    navigateTo("/");
    throw new Error("Redirect to /home, user is logging out");
  }
}
