import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
  }

  async loadCss() {
    this.createPageCss("../css/home.css");
  }
  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["menu", "home"])}`);
    return `
        <div class="background">
          <div class="container">
              <section class="home text-center p-5">
                  <h1 class="welcome">${this.lang.getTranslation(["homePage", "homeTitle"])}</h1>
                  <p class="welcome-msg">E${this.lang.getTranslation(["homePage", "descriptionHomeMessage"])}</p>
                  <p class="welcome-msg">${this.lang.getTranslation(["homePage", "descriptionHomeMessage2"])}</p>
              </section>
          </div>
        </div>
  `;
  }

  removeCss() {
    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.remove();
    });
  }

  destroy() {
    this.removeCss();
  }
}

