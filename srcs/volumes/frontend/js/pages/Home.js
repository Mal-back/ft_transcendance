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
        <div class="background Home removeElem">
          <div class="container removeElem">
              <section class="home text-center p-5 removeElem">
                  <h1 class="welcome removeElem">${this.lang.getTranslation(["homePage", "homeTitle"])}</h1>
                  <p class="welcome-msg removeElem">${this.lang.getTranslation(["homePage", "descriptionHomeMessage"])}</p>
                  <p class="welcome-msg removeElem">${this.lang.getTranslation(["homePage", "descriptionHomeMessage2"])}</p>
              </section>
          </div>
        </div>
  `;
  }

  destroy() {
    this.removeCss();
    this.removeElem();
  }
}
