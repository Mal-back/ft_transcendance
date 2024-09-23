import { navigateTo } from "../router.js";
import { removeSessionStorage, setSessionStorage } from "./Utils.js";

export default class {
  constructor() {
    this.loginToLogout();
  }

  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  createPageCss(refCss) {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = refCss;
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);
  }

  loginToLogout() {
    const username = sessionStorage.getItem("username_transcendence");
    const accessToken = sessionStorage.getItem("accessJWT_transcendence");
    const refreshToken = sessionStorage.getItem("refreshJWT_transcendence");
    const loginOverlay = document.querySelector("#overlayLogin");
    if (username && accessToken && refreshToken) {
      loginOverlay.innerText = "Logout";
      loginOverlay.href = "/logout";
    } else {
      if (username || accessToken || refreshToken) {
        removeSessionStorage();
      }
      if (loginOverlay.innerText == "Logout") {
        loginOverlay.innerText = "Login";
        loginOverlay.href = "/login";
      }
    }
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

    errorMessageElement.innerHTML = message;

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
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  }

  sanitizeInput(inputList) {
    console.log("sanitizeInput");
    const whitelist = /^[a-zA-Z0-9_@.+-]*$/;
    for (let i = 0; i < inputList.length; i++) {
      const input = inputList[i];
      if (!whitelist.test(input)) {
        this.showModalWithError(
          "Error",
          "Invalid characters! Allowed: alphanumeric, +, -, ., _, @",
        );
        return false;
      }
    }
    return true;
  }

  async loadCss() {}

  async addEventListeners() {}

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
    console.log("myMethod:", myMethod);
    const options = {
      method: myMethod.toString(),
      headers: this.makeHeaders(accessToken, myBody != null),
    };
    if (myBody) options.body = JSON.stringify(myBody);
    console.log("accessToken =", accessToken);
    const myRequest = new Request(url, options);
    console.log("Return make request");
    return myRequest;
  }

  async refreshToken(accessToken) {
    console.log("refreshing token");
    const refreshJWT = sessionStorage.getItem("refreshJWT_transcendence");
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
        body: JSON.stringify({
          refresh: refreshJWT,
        }),
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
      throw error;
    }
  }

  async getToken() {
    const authToken = sessionStorage.getItem("accessJWT_transcendence");
    if (!authToken) {
      console.log("User is not authentified", authToken);
      removeSessionStorage();
      return null;
    }
    const parseToken = this.parseJwt(authToken);
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseToken.exp + 1 >= currentTime) {
      const refreshToken = sessionStorage.getItem("refreshJWT_transcendence");
      if (!refreshToken) {
        navigateTo("/login");
        removeSessionStorage();
        throw new Error("Redirect to login, user is timed out");
      }
      await this.refreshToken();
    }
    return parseToken;
  }
  destroy() {}
}
