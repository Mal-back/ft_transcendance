import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";
import { getIpPortAdress, removeSessionStorage } from "../Utils/Utils.js";

export default class extends AbstractView {
  constructor() {
    super();
  }

  async loadCss() { }

  async getHtml() {
    this.setTitle(this.lang.getTranslation(["title", "home"]));
    return `
        <div class="background removeElem d-flex  "style="margin-top:0;">
            <div class="container text-center p-5 removeElem">
                <div class="home text-center p-5" >
                    <h1 class="mb-4 removeElem">${this.lang.getTranslation(["title", "home"]).toUpperCase()}</h1>
                    <p class=" removeElem">${this.lang.getTranslation(["homePage", "welcomeMessage"])}</p>
                    <p class=" removeElem">${this.lang.getTranslation(["homePage", "haveFun"])}</p>
                </div>
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
