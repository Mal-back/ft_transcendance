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
           <div class="background">
             <div class="custom-container d-flex flex-column justify-content-center align-items-center">
              <h1 class="mb-3 text-center title white-txt text-decoration-underline">Matchmaking</h1>
              <br>
              <button type="button"
                class="btn btn-light white-txt btn-lg bg-midnightblue  custom-button">NORMAL
                MODE</button>
              <br>
              <button type="button" class="btn btn-light white-txt btn-lg bg-purple custom-button">EPIC
                MODE</button>
              <br>
              <button type="button"
               class="btn btn-light white-txt btn-lg bg-darkyellow custom-button">TOURNAMENT</button>
              <br>
             </div>
           </div>
          `;
  }
}
