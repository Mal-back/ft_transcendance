import { navigateTo } from "../router.js";
import {
  removeSessionStorage,
  setSessionStorage,
  showModal,
} from "../Utils/Utils.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";

export default class extends AbstractView {
  constructor() {
    super();
  }

  async checkLogin() {
    return;
  }

  async getHtml() {
    const username = sessionStorage.getItem("username_transcendence");
    const refreshToken = sessionStorage.getItem("refreshJWT_transcendence");
    if (refreshToken) {
      try {
        const request = await this.makeRequest("/api/auth/logout", "POST", {
          refresh: refreshToken,
        });
        const response = await fetch(request);
        if (response.ok) {
          console.log(`token deleted: ${response.status}`);
        } else {
          const log = await this.getErrorLogfromServer(response);
          console.log(log);
        }
      } catch (error) {
        console.error("Fail to delete token: ", error.message);
      }
    }
    removeSessionStorage();
    throw new CustomError(
      `${this.lang.getTranslation(["menu", "logout"])}`,
      `${this.lang.getTranslation(["login", "goodbyeMessage"])}` + username,
      "/",
    );
  }
}
