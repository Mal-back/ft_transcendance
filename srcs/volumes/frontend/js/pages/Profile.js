import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";
import { removeSessionStorage, showModal } from "../Utils/Utils.js";

export default class extends AbstractView {
  constructor() {
    super();
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
    const username = sessionStorage.getItem("username_transcendence");
    console.log("username = ", username);
    try {
      const request = await this.makeRequest(
        `/api/auth/${username}`,
        "GET",
        null,
      );
      const response = await fetch(request);
      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else {
        const log = await this.getErrorLogfromServer(response);
        console.log(log);
        return null;
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.debug("Error: ", error);
      throw error;
    }
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["menu", "profile"])}`);
    let userData = null;
    try {
      const tokenProfile = await this.getToken();
      userData = await this.loadUserData();
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.debug("Error", error);
      throw error;
    }
    let winRate = "No game played yet";
    let battleHistory = "No history yet";
    if (userData.single_games_win_rate != undefined) {
      winRate = `${userData.single_games_win_rate} % `;
      battleHistory = "Battle History:";
    }

    const htmlContent = `< div class= "background" >
        <div class="Profile container">
          <div class="d-flex justify-content-center w-100">
            <!-- Top profile section (centered) -->
            <div class="top-profile d-flex flex-column justify-content-center align-items-center">
              <div class="rounded-circle Avatar status-playing" alt="Avatar" style="background-image: ${userData.profilePic}"></div>
              <a class="black-txt">${userData.username}</a>
            </div>
          </div>

          <!-- Left-aligned profile info -->
          <div class="align-items-left mt-3 w-100">
            <p class="black-txt">Win Rate: ${winRate}</p>
          </div>
          <div class="align-items-left mt-3 w-100">
            <p class="black-txt">${battleHistory}</p>
          </div>
          <div id="battleHistory"></div>
          `;
    const app = document.querySelector("#app");
    app.innerHTML = htmlContent;
    try {
      // await this.loadBattleHistory();
    } catch (error) {
      console.error("error", error.message);
      throw error;
    }
    return htmlContent;
    //         return `
    // <div class="background">
    //                     <div class="Profile container">
    //                         <div class="d-flex justify-content-center w-100">
    //                             <!-- Top profile section (centered) -->
    //                             <div class="top-profile d-flex flex-column justify-content-center align-items-center">
    //                                 <div class="rounded-circle Avatar status-playing" alt="Avatar" style="background-image: ${userData.profilePic}"></div>
    //                                 <a class="black-txt">${userData.username}</a>
    //                             </div>
    //                         </div>
    //
    //                         <!-- Left-aligned profile info -->
    //                         <div class="align-items-left mt-3 w-100">
    //                             <p class="black-txt">Win Rate: ${winRate}</p>
    //                         </div>
    //                         <div class="align-items-left mt-3 w-100">
    //                             <p class="black-txt">${battleHistory}</p>
    //                         </div>
    //                         <div class="border bd">
    //                             <div class="row justify-content-center pym-1 w-100">
    //                                 <div class="col-8 bg-darkgreen text-white text-center py-5 m-3">
    //                                     <div class="d-flex justify-content-around align-items-center">
    //                                         <div>
    //                                             <div class="player-circle">
    //                                             </div>
    //                                             <div class="no-overflow player-name">
    //                                                 <span>dddddddddddddddddddddddddddU1</span>
    //                                             </div>
    //                                         </div>
    //                                         <div>
    //                                             <h4>WIN-LOSE</h4>
    //                                             <h2>1 - 0</h2>
    //                                             <p>DATE</p>
    //                                         </div>
    //                                         <div>
    //                                             <div class="player-circle">
    //                                             </div>
    //                                             <div class="no-overflow player-name">
    //                                                 <span>dU2</span>
    //                                             </div>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                                 <div class="col-8 bg-darkred text-white text-center py-5 m-3">
    //                                     <div class="d-flex justify-content-around align-items-center">
    //                                         <div>
    //                                             <div class="player-circle">
    //                                             </div>
    //                                             <div class="no-overflow player-name">
    //                                                 <span>dddddddddddddddddddddddddddU1</span>
    //                                             </div>
    //                                         </div>
    //                                         <div>
    //                                             <h4>WIN-LOSE</h4>
    //                                             <h2>1 - 0</h2>
    //                                             <p>DATE</p>
    //                                         </div>
    //                                         <div>
    //                                             <div class="player-circle">
    //                                             </div>
    //                                             <div class="no-overflow player-name">
    //                                                 <span>dU2</span>
    //                                             </div>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                         <br>
    //                         <div class="align-items-right mt-3 w-100">
    //                             <a id=settingsButton type="button" class="btn bg-lightgray" href="/settings">Settings</a>
    //                         </div>
    //                     </div>
    //                 </div>
    //
    //            `;
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
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
  }
}
