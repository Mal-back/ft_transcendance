import { navigateTo } from "../router";
import { removeSessionStorage, setSessionStorage } from "/sessionStorageUtils";

export default class {
  constructor() { }

  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  parseJwt(token) {
    let base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    let jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function(c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  }

  async loadCss() { }

  async addEventListeners() { }

  async refreshToken(accessToken) {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-type", "application/json");
      myHeaders.append("")

      const request = new Request("/api/auth/refresh", {
        method: "POST",
        headers: myHeaders,
        body: 
      })
    } catch { }
  }

  removeSessionStorage() {
    sessionStorage.removeItem("accessJWT_transcendance");
    sessionStorage.removeItem("refreshJWT_transcendance");
    sessionStorage.removeItem("username_transcendance");
  }

  async getToken() {
    const authToken = sessionStorage.getItem("accessJWT_transcendance");
    if (!authToken) {
      console.log("authToken = ", authToken);
      return null;
    }
    const parseToken = this.parseJwt(authToken);
    const currentTime = Math.floor(Date.now() / 1000);
    if (token.expire + 1 >= currentTime) {
      const refreshToken = sessionStorage.getItem("refreshJWT_transcendance");
      if (!refreshToken) {
        navigateTo("/login");
        this.removeSessionStorage();
        throw new Error("Redirect to login, user is timed out");
      }
      await this.refreshToken();
    }
    return parseToken;
  }
  destroy() { }
}
