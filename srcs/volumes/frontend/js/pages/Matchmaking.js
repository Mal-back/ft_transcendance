import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Matchmaking");
  }

  async loadCss() {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "../css/matchmaking-hp.css";
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);
  }
  async getHtml() {
    return `
        <div class="custom-container d-flex flex-column justify-content-center align-items-center">
            <button type="button" class="btn btn-primary btn-lg bg-midnightblue  custom-button">NORMAL MODE</button>
            <br>
            <br>
            <button type="button" class="btn btn-danger btn-lg bg-purple custom-button">EPIC MODE</button>
            <br>
            <br>
            <button type="button" class="btn btn-warning btn-lg bg-darkyellow custom-button">TOURNAMENT</button>
        </div>
          `;
  }
}
