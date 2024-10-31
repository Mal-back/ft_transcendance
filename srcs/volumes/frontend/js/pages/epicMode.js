import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Epic Mode");
  }

  async loadCss() {
    this.createPageCss("../css/epic-mode.css");
  }

  async getHtml() {
    return `
          <div class="custom-container d-flex flex-column justify-content-center align-items-center">
            <h1 class="mb-3 text-center title white-txt text-decoration-underline">Epic Mode</h1>
            <br>
            <a type="button" class="btn btn-light white-txt btn-lg bg-green  custom-button" href="/local-epic-mode">LOCAL MODE</a>
            <br>
            <a type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button" href="/random-epic-match">RANDOM
                MATCH</a>
            <br>
            <a type="button" class="btn btn-light white-txt btn-lg bg-orchid custom-button" href="/friend-epic-match">FRIENDSHIP
                MATCH</a>
            <br>
          </div>
          `;
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
}
