import { navigateTo, handleClick } from "../router.js";
import {
  removeSessionStorage,
  setSessionStorage,
  showModal,
} from "../Utils/Utils.js";
import CustomError from "../Utils/CustomError.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.username = null;
    this.password = null;
    this.handleInputUsername = this.handleInputUsername.bind(this);
    this.handleInputPassword = this.handleInputPassword.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleCreateUserRedir = this.handleCreateUserRedir.bind(this);
    this.handleConfirmTwoFA = this.handleConfirmTwoFA.bind(this);
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["title", "login"])}`);
    return `
                <div class="background login removeElem">
                    <div class="p-5 bg-* removeElem">
                        <div class="black-txt bg-form login-form p-4 removeElem">
                            <h1 class="mb-3 text-center login-title text-decoration-underline removeElem">
                              ${this.lang.getTranslation(["title", "login"])}
                            </h1>
                            <form id="loginForm" class="removeElem">
                                <div class="form-group removeElem">
                                    <label class="removeElem" for="usernameInput" id="UsernameTitle">${this.lang.getTranslation(["input", "label", "username"])}</label>
                                    <input class="form-control removeElem" name="Username" type="text" id="usernameInput"/>
                                    <div id="loginUsernameError" class="removeElem"></div>
                                </div>
                                <br />
                                <div class="form-group removeElem">
                                    <label class="removeElem" for="passwordInput" id="PasswordTitle">${this.lang.getTranslation(["input", "label", "password"])}</label>
                                    <input class="form-control removeElem" name="Password" type="password" id="passwordInput" autocomplete="off"/>
                                    <div id="loginPasswordError" class="removeElem"></div>
                                </div>
                                <br />
                                <button id="loginButton" type="submit" class="btn bg-silver removeElem">${this.lang.getTranslation(["title", "login"])}</button>
                                <br />
                                <br />
                            </form>
                        </div>
                        <div class="d-flex justify-content-center mt-3 removeElem">
                            <button id="createUser" type="button" class="btn bg-blue login42 white-txt me-2 removeElem" href="/createUser">${this.lang.getTranslation(["title", "createUser"])}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal fade" id="handle2FA" tabindex="-1" aria-labelledby="handle2FALabel" aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="handle2FALabel">
                          2 Factor Authentification
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                          <div class="mb-3">
                            <label for="activationCodeInput" class="form-label">Activation Code:</label>
                            <input type="email" class="form-control" id="activationCodeInput" name="Activation Code" value="" />
                          </div>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                          ${this.lang.getTranslation(["button", "close"])}
                        </button>
                        <button type="button" class="btn btn-success" id="twoFAConfirm">
                          Activation Code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
          `;
  }

  cleanInputs() {
    const usernameInput = document.querySelector("#usernameInput");
    console.log("usernameInput:", usernameInput);
    const passwordInput = document.querySelector("#passwordInput");
    if (passwordInput) passwordInput.value = "";
    const usernameInputError = document.querySelector("#loginUsernameError");
    if (usernameInputError) {
      usernameInputError.innerHTML = "";
      usernameInputError.classList.add("removeElem");
    }
    const loginPasswordError = document.querySelector("#loginPasswordError");
    if (loginPasswordError) {
      loginPasswordError.innerHTML = "";
      loginPasswordError.classList.add("removeElem");
    }
  }

  async loadCss() {
    this.createPageCss("../css/login.css");
  }

  async checkLogin() {
    const username = sessionStorage.getItem("username_transcendence");
    if (username) {
      navigateTo("/");
      throw new CustomError(
        `${this.lang.getTranslation(["modal", "title", "error"])}`,
        `${this.lang.getTranslation(["modal", "message", "alreadyLog"])}`,
        "/",
      );
    }
    return;
  }

  validateUsername(usernameInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#loginUsernameError");
    errorDiv.innerHTML = "";
    if (usernameInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
    } else if (!this.sanitizeInput(usernameInput.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "invalidChar"])}`;
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
      errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
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
      if (error instanceof CustomError) {
        error.showModalCustom();
        navigateTo(error.redirect);
      } else {
        console.error("handleLogin:", error);
      }
    }
  }

  handleCreateUserRedir(ev) {
    ev.preventDefault();
    navigateTo("/createUser");
  }

  async twoFactorAuth() {
    const twoFAModalDiv = document.querySelector("#handle2FA");
    let modalTwoFa = bootstrap.Modal.getInstance(twoFAModalDiv);
    if (!modalTwoFa) modalTwoFa = new bootstrap.Modal(twoFAModalDiv);
    modalTwoFa.show();
  }

  async handleConfirmTwoFA(ev) {
    ev.preventDefault();
    try {
      if (!this.username || !this.password) {
        throw new CustomError(
          "Error",
          "must do the first part of the 2 factor authentification first",
          "/login",
        );
      }
      const activationCode = document.querySelector("#activationCodeInput");
      if (!activationCode.value) return;
      const request = await this.makeRequest("/api/auth/otp/", "POST", {
        username: this.username,
        password: this.password,
        otp: activationCode.value,
      });
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        setSessionStorage(data, this.username);
        navigateTo("/");
        showModal(
          `${this.lang.getTranslation(["modal", "title", "auth"])}`,
          `${this.lang.getTranslation(["modal", "message", "welcome"])}, ${this.username}`,
        );
      }
    } catch (error) {
      if (error instanceof CustomError) {
        error.showModalCustom();
        navigateTo(error.redirect);
      } else {
        console.error("handleConfirmTwoFA:", error);
      }
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
      // const usernameURIencoded = encodeURIComponent(nameForm);
      console.log("login before make request");
      const request = await this.makeRequest("/api/auth/login/", "POST", {
        username: nameForm,
        password: paswordForm,
      });
      const response = await fetch(request);
      console.log("Response: ", response);
      if (await this.handleStatus(response)) {
        const data = await response.json();
        console.log("login: data:", data);
        if (response.status == 202) {
          this.username = nameForm;
          this.password = paswordForm;
          const twoFa = await this.twoFactorAuth();
          return;
        }
        setSessionStorage(data, nameForm);
        navigateTo("/");
        showModal(
          `${this.lang.getTranslation(["modal", "title", "auth"])}`,
          `${this.lang.getTranslation(["modal", "message", "welcome"])}, ${nameForm}`,
        );
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async addEventListeners() {
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

    const twoFAConfirm = document.querySelector("#twoFAConfirm");
    if (twoFAConfirm) {
      twoFAConfirm.addEventListener("click", this.handleConfirmTwoFA);
    }
  }

  removeEventListeners() {
    const button = document.querySelector("#loginButton");
    if (button) {
      button.removeEventListener("click", this.handleLogin);
    }
    const usernameInput = document.querySelector("#usernameInput");
    const passwordInput = document.querySelector("#passwordInput");
    if (usernameInput) {
      usernameInput.removeEventListener("input", this.handleInputUsername);
      usernameInput.value = "";
    }
    if (passwordInput) {
      passwordInput.removeEventListener("input", this.handleInputPassword);
      passwordInput.removeEventListener("input", null);
      passwordInput.value = "";
    }
    const createUser = document.querySelector("#createUser");
    if (createUser) {
      createUser.removeEventListener("click", this.handleCreateUserRedir);
    }
    const twoFAConfirm = document.querySelector("#twoFAConfirm");
    if (twoFAConfirm) {
      twoFAConfirm.removeEventListener("click", this.handleConfirmTwoFA);
    }
  }

  destroy() {
    this.removeInviteEventListeners();
    this.cleanInputs();
    this.removeEventListeners();
    this.cleanModal();
    this.removeCss();
    this.removeElem();
  }
}
