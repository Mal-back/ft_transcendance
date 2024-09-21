import { navigateTo } from "../router.js";
import { removeSessionStorage, setSessionStorage } from "./Utils.js";

export default class {
  constructor() { }

  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  showModalWithError(title, message) {
    const modalTitleElement = document.getElementById("alertLabel");
    const errorMessageElement = document.getElementById("alertMessage");

    modalTitleElement.textContent = title;
    if (title == "Error") {
      modalTitleElement.style.color = "red";
    } else {
      modalTitleElement.style.color = "black";
    }

    errorMessageElement.textContent = message;

    const modal = new bootstrap.Modal(document.getElementById("alertModal"));
    modal.show();
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

  makeHeaders(accessToken, boolJSON) {
    const myHeaders = new Headers();
    if (accessToken != null) {
      myHeaders.append("Authorization", "Bearer " + accessToken);
    }
    if (boolJSON === true) {
      myHeaders.append("Content-Type", "application/json");
    }
    return myHeaders;
  }

  async makeRequest(url, myMethod, myBody) {
    const username = sessionStorage.getItem("username_transcendance");
    let accessToken = null;
    if (username) {
      accessToken = await this.getToken();
    }
    const options = {
      method: myMethod,
      headers: this.makeHeaders(accessToken, myBody != null),
    };
    if (myBody) options.body = JSON.stringify(myBody);
    console.log("accessToken =", accessToken);
    const myRequest = new Request(url, options);
    console.log("Return make request");
    return myRequest;
  }

  async refreshToken(accessToken) {
    const refreshJWT = sessionStorage.getItem("refreshJWT_transcendance");
    if (!refreshJWT) {
      //ALERT
      removeSessionStorage();
      navigateTo("/login");
      throw new Error("Redirect to login, invalid token");
    }
    try {
      const myHeaders = this.makeHeaders(accessToken, true);
      const request = new Request("/api/auth/refresh", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(refreshJWT),
      });

      const response = await fetch(request);
      if (response.ok) {
        const data = await response.json();
        setSessionStorage(data);
      } else {
        const dataError = await response.json();
        if (response.status === 403) {
          console.log("User is not connected/ have unsufficient permission");
        } else {
          console.log("Error in request:" + response.status + "; ", dataError);
        }
      }
    } catch (error) {
      console.error("Error refreshing token:", error.message);
      removeSessionStorage();
      navigateTo("/login");
      throw new Error("Redirect to login, invalid token");
    }
  }

  async getToken() {
    const authToken = sessionStorage.getItem("accessJWT_transcendance");
    if (!authToken) {
      console.log("User is not authentified", authToken);
      removeSessionStorage();
      return null;
    }
    const parseToken = this.parseJwt(authToken);
    const currentTime = Math.floor(Date.now() / 1000);
    if (token.expire + 1 >= currentTime) {
      const refreshToken = sessionStorage.getItem("refreshJWT_transcendance");
      if (!refreshToken) {
        navigateTo("/login");
        removeSessionStorage();
        throw new Error("Redirect to login, user is timed out");
      }
      await this.refreshToken();
    }
    return parseToken;
  }
  destroy() { }
}
