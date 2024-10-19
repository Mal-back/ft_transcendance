import { navigateTo, handleClick } from "../router.js";
import {
  removeSessionStorage,
  setSessionStorage,
  showModal,
} from "../Utils/Utils.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.handleInputUsername = this.handleInputUsername.bind(this);
    this.handleInputPassword = this.handleInputPassword.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleCreateUserRedir = this.handleCreateUserRedir.bind(this);
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["menu", "login"])}`);
    const username = sessionStorage.getItem("username_transcendance");
    if (username) {
      // const loginOverlay = document.querySelector("#overlayLogin");
      // loginOverlay.innerText = "Logout";
      // loginOverlay.href = "/logout";
      navigateTo("/");
      throw new CustomError("Redirect to Home, User already logged in");
    }

    return `
                <div class="background login removeElem">
                    <div class="p-5 bg-* removeElem">
                        <div class="black-txt bg-form login-form p-4 removeElem">
                            <h1 class="mb-3 text-center login-title text-decoration-underline removeElem">
                              ${this.lang.getTranslation(["login", "loginBtn"])}
                            </h1>
                            <form id="loginForm" class="removeElem">
                                <div class="form-group removeElem">
                                    <label class="removeElem" for="Username" id="UsernameTitle">${this.lang.getTranslation(["input", "label", "username"])}</label>
                                    <input class="form-control removeElem" name="Username" type="text" id="usernameInput"/>
                                    <div id="loginUsernameError" class="removeElem"></div>
                                </div>
                                <br />
                                <div class="form-group removeElem">
                                    <label class="removeElem" for="Password" id="PasswordTitle">${this.lang.getTranslation(["input", "label", "password"])}</label>
                                    <input class="form-control removeElem" name="Password" type="password" id="passwordInput" autocomplete="off"/>
                                    <div id="loginPasswordError" class="removeElem"></div>
                                </div>
                                <br />
                                <button id="loginButton" type="submit" class="btn bg-silver removeElem">${this.lang.getTranslation(["login", "loginBtn"])}</button>
                                <br />
                                <br />
                            </form>
                        </div>
                        <div class="d-flex justify-content-center mt-3 removeElem">
                            <button id="createUser" type="button" class="btn bg-blue login42 white-txt me-2 removeElem" href="/createUser">${this.lang.getTranslation(["login", "createUserTitle"])}
                            </button>
                            <a type="button" class="btn bg-blue login42 white-txt removeElem">
                                42 Connect
                            </a>
                        </div>
                    </div>
                </div>

          `;
  }

  async loadCss() {
    this.createPageCss("../css/login.css");
    console.log("adding login.css");
  }

  validateUsername(usernameInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#loginUsernameError");
    errorDiv.innerHTML = "";
    if (usernameInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "username", "empty"])}`;
    } else if (!this.sanitizeInput(usernameInput.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "username", "invalid"])}`;
    }
    if (errorMessage) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = "red";
      errorDiv.style.fontStyle = "italic";
    }
    errorDiv.classList.add("removeElem");
    return errorMessage;
  }

  validatePassword(passwordInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#loginPasswordError");
    errorDiv.innerHTML = "";
    if (passwordInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "password", "empty"])}`;
    }
    if (errorMessage) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = "red";
      errorDiv.style.fontStyle = "italic";
    }
    errorDiv.classList.add("removeElem");
    return errorMessage;
  }

  handleInputUsername(ev) {
    ev.preventDefault();
    const usernameInput = document.querySelector("#usernameInput");
    this.validateUsername(usernameInput);
  }

  handleInputPassword(ev) {
    ev.preventDefault();
    const passwordInput = document.querySelector("#passwordInput");
    this.validatePassword(passwordInput);
  }

  async handleLogin(ev) {
    try {
      ev.preventDefault();
      const usernameInput = document.querySelector("#usernameInput");
      const passwordInput = document.querySelector("#passwordInput");
      let isValid = true;
      if (this.validateUsername(usernameInput)) isValid = false;
      if (this.validatePassword(passwordInput)) isValid = false;
      if (!isValid) return;
      await this.login();
    } catch (error) {
      console.debug("Error in login:", error);
    }
  }

  handleCreateUserRedir(ev) {
    navigateTo("/createUser");
  }

  async addEventListeners() {
    console.log("adding event addEventListeners");
    const button = document.querySelector("#loginButton");
    const usernameInput = document.querySelector("#usernameInput");
    const passwordInput = document.querySelector("#passwordInput");
    const createUser = document.querySelector("#createUser");
    if (usernameInput) {
      usernameInput.addEventListener("input", this.handleInputUsername);
    }
    if (passwordInput)
      passwordInput.addEventListener("input", this.handleInputPassword);

    if (button) {
      button.addEventListener("click", this.handleLogin);
    }
    if (createUser) {
      createUser.addEventListener("click", this.handleCreateUserRedir);
    }
  }

  async login() {
    console.log("login");
    const loginForm = document.querySelector("#loginForm");
    const nameForm = loginForm.querySelector("input[name='Username']").value;
    const paswordForm = loginForm.querySelector("input[name='Password']").value;

    if (this.sanitizeInput([nameForm]) == false) {
      console.log("Wrong input");
      return;
    }
    try {
      const usernameURIencoded = encodeURIComponent(nameForm);
      console.log("login before make request");
      const request = await this.makeRequest("/api/auth/login", "POST", {
        username: usernameURIencoded,
        password: paswordForm,
      });
      const response = await fetch(request);
      console.log("Response: ", response);
      if (response.ok) {
        const data = await response.json();
        setSessionStorage(data, usernameURIencoded);
        navigateTo("/");
      } else {
        const log = await this.getErrorLogfromServer(response);
        showModal(`${this.lang.getTranslation(["modal", "error"])}`, log);
        console.log(log);
      }
    } catch (Error) {
      console.error("Error fetching login:", Error);
      showModal(
        `${this.lang.getTranslation(["modal", "error"])}`,
        Error.message,
      );
    }
  }

  removeEventListeners() {
    const button = document.querySelector("#loginButton");
    if (button) {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleLogin);
    }
    const usernameInput = document.querySelector("#usernameInput");
    const passwordInput = document.querySelector("#passwordInput");
    if (usernameInput) {
      usernameInput.removeEventListener("input", this.validateUsername);
    }
    if (passwordInput) {
      passwordInput.removeEventListener("input", this.handleInputPassword);
      passwordInput.removeEventListener("input", null); // Example: if you have 'input' event listeners
      passwordInput.value = "";
    }
    const createUser = document.querySelector("#createUser");
    if (createUser) {
      createUser.removeEventListener("click", this.handleCreateUserRedir);
    }
  }

  destroy() {
    console.log("Destroy Login");
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
    this.removeElem();
  }
}
