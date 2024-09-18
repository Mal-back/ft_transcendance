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
            <div class="border p-3" style="height: 300px; overflow-y: auto;">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sit amet accumsan urna. Cras
                    ultricies scelerisque magna, vitae tempus nulla finibus sit amet. Aenean et pharetra odio. Phasellus
                   </p>
            </div>
            <br>
            <div class="align-items-right mt-3 w-100">
                <a type="button" class="btn bg-lightgray">Settings</a>
            </div>
        </div>
          `;
  }
}
