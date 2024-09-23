import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Profile");
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-profile.css");
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
      this.showModalWithError("Error", "User is not authentified");
      navigateTo("/login");
      throw new Error("Redirect to login");
    }
    // const userData = await this.loadUserData();

    console.log("token", tokenProfile);
    return `
<div class="background">
                    <div class="Profile container">
                        <div class="d-flex justify-content-center w-100">
                            <!-- Top profile section (centered) -->
                            <div class="top-profile d-flex flex-column justify-content-center align-items-center">
                                <div class="rounded-circle Avatar status-playing" alt="Avatar"></div>
                                <a class="black-txt">Username</a>
                            </div>
                        </div>

                        <!-- Left-aligned profile info -->
                        <div class="align-items-left mt-3 w-100">
                            <p class="black-txt">Win Rate: 75%</p>
                        </div>
                        <div class="align-items-left mt-3 w-100">
                            <p class="black-txt">Battle History:</p>
                        </div>
                        <div class="border bd">
                            <div class="row justify-content-center pym-1 w-100">
                                <div class="col-8 bg-darkgreen text-white text-center py-5 m-3">
                                    <div class="d-flex justify-content-around align-items-center">
                                        <div>
                                            <div class="player-circle">
                                            </div>
                                            <div class="no-overflow player-name">
                                                <span>dddddddddddddddddddddddddddU1</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4>WIN-LOSE</h4>
                                            <h2>1 - 0</h2>
                                            <p>DATE</p>
                                        </div>
                                        <div>
                                            <div class="player-circle">
                                            </div>
                                            <div class="no-overflow player-name">
                                                <span>dU2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-8 bg-darkred text-white text-center py-5 m-3">
                                    <div class="d-flex justify-content-around align-items-center">
                                        <div>
                                            <div class="player-circle">
                                            </div>
                                            <div class="no-overflow player-name">
                                                <span>dddddddddddddddddddddddddddU1</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4>WIN-LOSE</h4>
                                            <h2>1 - 0</h2>
                                            <p>DATE</p>
                                        </div>
                                        <div>
                                            <div class="player-circle">
                                            </div>
                                            <div class="no-overflow player-name">
                                                <span>dU2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br>
                        <div class="align-items-right mt-3 w-100">
                            <a id=settingsButton type="button" class="btn bg-lightgray" href="/settings">Settings</a>
                        </div>
                    </div>
                </div>

           `;
  }

  async addEventListeners() {
    // const button = document.querySelector("#settingsButton");
    // if (button) {
      // button.addEventListener("click", async (ev) => {
        // ev.preventDefault();
        // console.debug("Submit button clicked!");
      // });
    // }
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
