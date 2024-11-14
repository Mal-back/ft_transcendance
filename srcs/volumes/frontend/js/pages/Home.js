import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";
import { getIpPortAdress, removeSessionStorage } from "../Utils/Utils.js";

export default class extends AbstractView {
  constructor() {
    super();
  }

  async loadCss() {}

  async getHtml() {
    this.setTitle(this.lang.getTranslation(["title", "home"]));
    return `
        <div class="background Home removeElem">
          <div class="container removeElem">
              <section class="home text-center p-5 removeElem">
                  <h1 class="welcome removeElem">${this.lang.getTranslation(["title", "home"]).toUpperCase()}</h1>
                  <p class="welcome-msg removeElem">${this.lang.getTranslation(["homePage", "descriptionHomeMessage"])}</p>
                  <p class="welcome-msg removeElem">${this.lang.getTranslation(["homePage", "descriptionHomeMessage2"])}</p>
              </section>
          </div>
        </div>
  `;
  }

  async checkLogin() {
    try {
      const username = sessionStorage.getItem("username_transcendence");
      if (username) {
        const error = await this.fetchNotifications();
        if (error instanceof CustomError) {
          throw new CustomError(
            `${this.lang.getTranslation(["modal", "title", "error"])}`,
            `${this.lang.getTranslation(["modal", "message", "authError"])}`,
          );
        }
      }
    } catch (error) {
      removeSessionStorage();
      this.handleCatch(error);
    }
  }
}
