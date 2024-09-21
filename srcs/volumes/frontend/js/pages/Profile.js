import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Profile");
  }

  async loadCss() {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "../css/home.css";
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);

    const alternateBackground = document.createElement("link");
    alternateBackground.rel = "stylesheet";
    alternateBackground.href = "../css/background-profile.css";
    alternateBackground.classList.add("page-css");
    document.head.appendChild(alternateBackground);
  }

  removeEventListeners() {
    document.querySelectorAll('[data-link="view"]').forEach((button) => {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleClick);
    });
  }

  removeCss() {
    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.remove();
    });
  }
  destroy() {
    this.removeEventListeners();
    this.removeCss();
  }

  async loadUserData() {
    // const authToken = localStorage.getItem("accessJWT_transcendance");
    // const username = localStorage.getItem("username");
    // if (!authToken) {
    //   this.destroy();
    //   navigateTo("/login");
    //   throw new Error("Redirect to login, User is not authentified");
    // }
    // try {
    //   const myHeaders = new Headers();
    //   myHeaders.append("Authorization", "Bearer " + authToken);
    //   const request = new Request("/api/users/" + username, {
    //
    //   });
    // }
  }

  async getHtml() {
    const tokenProfile = await this.getToken();
    if (tokenProfile == null) {
      console.log("token = ", tokenProfile);
      throw new Error("Redirect to login");
    }
    // const userData = await this.loadUserData();

    console.log("token", tokenProfile);
    return `
          `;
  }

  async addEventListeners() {
    const button = document.querySelector("#createUserButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Submit button clicked!");
        await this.submitNewUser();
      });
    }
  }

  removeEventListeners() {
    const button = document.querySelector("#createUserButton");
    if (button) {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.loginEvent);
    }
    document.querySelectorAll('[data-link="view"]').forEach((button) => {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleClick);
    });
  }

  removeCss() {
    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.remove();
    });
  }
  destroy() {
    this.removeEventListeners();
    this.removeCss();
  }
}
