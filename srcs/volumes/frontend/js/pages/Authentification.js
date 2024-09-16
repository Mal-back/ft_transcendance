import AbstractView from "./AbstractViews.js";

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
                <a id="createNewProfile" type="button" class="btn black-txt bg-semi-t-white" href="/createUser"
                    data-link="view">Create New Profile</button>
            </div>
            <div id="login" class="right-half d-flex justify-content-center">
                <a type="button" class="btn black-txt bg-semi-t-white" href="/login"
                    data-link="view">Login</button>
            </div>
        </div>
          `;
  }

  // async addEventListeners() {
  //   document.querySelectorAll('[data-link="view"]').forEach((button) => {
  //     button.addEventListener("click", (ev) => this.handleClick(ev));
  //     console.log("adding event click on button : " + button.innerText);
  //   });
  // }

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
}
