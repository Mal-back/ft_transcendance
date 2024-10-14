import { navigateTo } from "../router.js";
import { removeSessionStorage, setSessionStorage } from "./Utils.js";
import Language from "./Language.js";

export default class {
  constructor() {
    this.lang = new Language();
    this.loginToLogout();
    this.closeSidebarOnNavigate();
  }

  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  // Add an event listener to your SPA navigation logic
  closeSidebarOnNavigate() {
    const sidebar = document.getElementById("sidebar");
    // Ensure the sidebar is open before attempting to close
    if (sidebar.classList.contains("show")) {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(sidebar);
      if (offcanvasInstance) {
        offcanvasInstance.hide(); // Close the sidebar
      }
    }
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
    const logIcon = document.querySelector("#logIconRef");
    const logIconImg = document.querySelector("#logIconImg");
    if (username && accessToken && refreshToken) {
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-right"></i> ${this.lang.getTranslation(["menu", "logout"])}`;
      loginOverlay.href = "/logout";
      logIcon.href = "/logout";
      logIcon.title = this.lang.getTranslation(["menu", "logout"]);
      logIconImg.classList.remove("bi-box-arrow-left");
      logIconImg.classList.add("bi-box-arrow-right");
    } else {
      if (username || accessToken || refreshToken) {
        removeSessionStorage();
      }
      loginOverlay.innerHTML = `<i class="bi bi-box-arrow-left"></i> ${this.lang.getTranslation(["menu", "logout"])}`;
      loginOverlay.href = "/login";
      logIcon.href = "/login";
      logIcon.title = this.lang.getTranslation(["menu", "login"]);
      logIconImg.classList.remove("bi-box-arrow-right");
      logIconImg.classList.add("bi-box-arrow-left");
    }
  }

  showModalWithError(title, message) {
    console.log("SHOW MODALE");
    const modalTitleElement = document.getElementById("alertLabel");
    const errorMessageElement = document.getElementById("alertMessage");

    modalTitleElement.textContent = title;
    if (title == "Error") {
      modalTitleElement.style.color = "red";
    } else {
      modalTitleElement.style.color = "black";
    }

    errorMessageElement.innerHTML = message;

    const modalId = document.getElementById("alertModal");

    let modal = bootstrap.Modal.getInstance(modalId);
    if (!modal) {
      modal = new bootstrap.Modal(modalId);
    }
    modal.show();
    modalId.querySelector(".btn-close").onclick = (ev) => {
      ev.preventDefault();
      this.closeModal();
    };
  }

  closeModal() {
    const modalId = document.getElementById("alertModal");
    const modal = bootstrap.Modal.getInstance(modalId);
    if (modal) {
      modal.hide();
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.remove();
      }
    }
  }

  cleanModal() {
    const modal = document.querySelectorAll(".modal");
    if (modal) {
      modal.forEach((element) => {
        if (element.id != "alertModal") {
          console.log("removing modal: ", element.id);
          const modalInstance = bootstrap.Modal.getInstance(element);
          if (modalInstance) modalInstance.hide();
          element.remove();
        }
      });
    }
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
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
    const whitelist = /^[a-zA-Z0-9_@.+-]*$/;
    for (let i = 0; i < inputList.length; i++) {
      const input = inputList[i];
      console.log("input = ", input);
      if (!whitelist.test(input)) {
        this.showModalWithError(
          "Error",
          "Invalid characters! Allowed: alphanumeric, +, -, ., _, @ on ",
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

  async getErrorLogfromServer(response) {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const responseText = await response.text();
        if (!responseText) {
          console.log("RESPONSE IS EMPTY");
          return "Empty response";
        }
        const errorJSON = JSON.parse(responseText);
        console.log("ERROR", errorJSON);
        const errorMessages = Object.entries(errorJSON)
          .map(([field, errorMessage]) => {
            // Ensure errorMessage is an array; if not, make it an array
            if (Array.isArray(errorMessage)) {
              return errorMessage.join(", ");
            } else {
              return errorMessage; // Just use the string directly if not an array
            }
          })
          .join("<br>");
        return errorMessages;
      } catch (error) {
        console.error("getErrorLogfromServer:", error.message);
        return error;
      }
    } else {
      return `${response.status} ${response.statusText}`;
    }
  }
  async makeRequest(url, myMethod, myBody) {
    const username = sessionStorage.getItem("username_transcendence");
    let accessToken = null;
    if (username) {
      try {
        accessToken = await this.getToken();
      } catch (error) {
        console.error("Error in getToken:", error.message);
      }
    }
    console.log("myMethod:", myMethod);
    const options = {
      method: myMethod.toString(),
      headers: this.makeHeaders(accessToken, myBody != null),
    };
    if (myBody) options.body = JSON.stringify(myBody);
    const myRequest = new Request(url, options);
    return myRequest;
  }

  async refreshToken(accessToken) {
    const refreshJWT = sessionStorage.getItem("refreshJWT_transcendence");
    // console.log("refreshJWT before = ", refreshJWT);
    // console.log("accessJWT before = ", accessToken);
    if (!refreshJWT) {
      this.showModalWithError(
        "Error",
        "Error in authentification, relog please",
      );
      removeSessionStorage();
      navigateTo("/");
      // throw new Error("Redirect to login, invalid token");
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
        const log = this.getErrorLogfromServer(response);
        console.log(log);
        this.showModalWithError("Error", log);
        removeSessionStorage();
        navigateTo("/");
      }
    } catch (error) {
      console.error("Error refreshing token:", error.message);
      this.showModalWithError("Error", error.message);
      removeSessionStorage();
      navigateTo("/login");
      throw error;
    }
  }

  async getToken() {
    let authToken = sessionStorage.getItem("accessJWT_transcendence");
    const refreshToken = sessionStorage.getItem("refreshJWT_transcendence");
    if (!authToken || !refreshToken) {
      console.log("User is not authentified", authToken);
      removeSessionStorage();
      navigateTo("/login");
      return null;
    }
    const parseToken = this.parseJwt(authToken);
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseToken.exp + 1 <= currentTime) {
      try {
        await this.refreshToken(authToken);
      } catch (error) {
        console.error("getToken", error.message);
        throw error;
      }
      authToken = sessionStorage.getItem("accessJWT_transcendence");
    }
    return authToken;
  }
  destroy() {}
}
