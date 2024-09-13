import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Profile");
  }

  async loadCss() {
    // const linkElement = document.createElement("link");
    // linkElement.rel = "stylesheet";
    // linkElement.href = "../css/home.css";
    // linkElement.classList.add("page-css");
    // document.head.appendChild(linkElement);
  }
  async getHtml() {
    return `
<p>A nice profile page lol</p>
          `;
  }
}
