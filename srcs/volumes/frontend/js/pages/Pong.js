import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Create new user");
  }

  async loadCss() {
    this.createPageCss("../css/create-user.css");
  }

  async getHtml() {
    //get websocket
    //load page with background game, bars at the y center, ball center x,y
  }

  //add event listeners for websocket.message (in from server)
  //add event listeners for key up/down for plyber A/B
  //

  async addEventListeners() {
    const button = document.querySelector("#createUserButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Submit button clicked!");
        try {
          await this.submitNewUser();
        } catch (error) {
          console.error("Caught in Event Listener:", error.message);
        }
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
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
  }
}
