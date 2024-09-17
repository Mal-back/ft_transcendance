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

  async getHtml() {
    const authToken = localStorage.getItem("accessJWT");
    if (!authToken) {
      navigateTo("/login");
      return;
    }
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
                    faucibus, orci non vestibulum faucibus, velit justo lacinia metus, non egestas turpis nunc a risus.
                    Quisque non magna at est ultricies bibendum.</p>
                <p>Morbi nec orci lorem. In finibus urna vel magna aliquam viverra. Vivamus consequat magna orci, sed
                    sollicitudin odio blandit id. Pellentesque at ipsum dapibus, pulvinar ligula non, finibus felis. Nam
                    vitae magna eros.</p>
                <p>Curabitur id pharetra risus, vitae vestibulum ex. Nam ornare tempor neque, nec laoreet nisi lobortis
                    id. Integer dignissim eros ac arcu pulvinar, nec fermentum turpis volutpat.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sit amet accumsan urna. Cras
                    ultricies scelerisque magna, vitae tempus nulla finibus sit amet.</p>
                <p>Phasellus faucibus, orci non vestibulum faucibus, velit justo lacinia metus, non egestas turpis nunc
                    a risus. Quisque non magna at est ultricies bibendum.</p>
            </div>
            <br>
            <div class="align-items-right mt-3 w-100">
                <button type="button" class="btn bg-lightgray">Settings</button>
            </div>
        </div>
          `;
  }
}
