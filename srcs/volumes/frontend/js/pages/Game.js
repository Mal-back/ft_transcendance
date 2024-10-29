import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Pong");
  }

  async loadCss() {
    // const linkElement = document.createElement("link");
    // linkElement.rel = "stylesheet";
    // linkElement.href = "../css/game.css";
    // linkElement.classList.add("page-css");
    // document.head.appendChild(linkElement);
  }
  async getHtml() {
    return `
            <p>C'est le jeu Lol</p>
          `;
  }
}
