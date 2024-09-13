import AbstractView from "./AbstractViews.js";
import nagivateTO

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Authentification");
  }

  async loadCss() {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "../css/auth.css";
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);
  }
  async getHtml() {
    return `
        <div class="line-up d-flex justify-content-between align-items-center">
            <div class="left-half d-flex justify-content-center">
                <button id="createNewProfile" type="button" class="btn black-txt bg-semi-t-white" href="/create_profile"
                    data-link>Create New Profile</button>
            </div>
            <div id="login" class="right-half d-flex justify-content-center">
                <button type="button" class="btn black-txt bg-semi-t-white" href="/login"
                    data-link>Login</button>
            </div>
        </div>
          `;
  }
  async addEventListeners() {
    document.querySelectorAll("[data-link]").forEach((button) => {
      button.addEventListener("click", (ev) => {
        ev.preventDefault();
        console.debug("Create New Profile button clicked!");
        navigateTo(ev.target.href);
      });
    });
  }
}
