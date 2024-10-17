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
    // this.handleInputUsername = this.handleInputUsername.bind(this);
    // this.handleInputPassword = this.handleInputPassword.bind(this);
    // this.handleLogin = this.handleLogin.bind(this);
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
                <div class="background">
                    <div class="p-5 bg-*">
                        <div class="black-txt bg-form login-form p-4">
                            <h1 class="mb-3 text-center login-title text-decoration-underline">
                              ${this.lang.getTranslation(["login", "loginBtn"])}
                            </h1>
                            <form id="loginForm" novalidate>
                                <div class="form-group">
                                    <label for="Username" id="UsernameTitle">${this.lang.getTranslation(["login", "usernameLabel"])}</label>
                                    <input class="form-control" name="Username" type="text" id="usernameInput" required />
                                    <div class="invalid-feedback">
                                      Username is required.
                                    </div>
                                </div>
                                <br />
                                <div class="form-group">
                                    <label for="Password" id="PasswordTitle">${this.lang.getTranslation(["login", "passwordLabel"])}</label>
                                    <input class="form-control" name="Password" type="password" id="passwordInput" required/>
                                    <div class="invalid-feedback">
                                      Password contains invalid characters.
                                    </div>
                                </div>
                                <br />
                                <button id="loginButton" type="submit" class="btn bg-silver">${this.lang.getTranslation(["login", "loginBtn"])}</button>
                                <br />
                                <br />
                            </form>
                        </div>
                        <div class="d-flex justify-content-center mt-3">
                            <a id="createUser" type="button" class="btn bg-blue login42 white-txt me-2" href="/createUser" data-link="view">${this.lang.getTranslation(["login", "createUserTitle"])}
                            </a>
                            <a type="button" class="btn bg-blue login42 white-txt">
                                42 Connect
                            </a>
                        </div>
                    </div>
                </div>

          `;
  }

  // async loadCss() {
  //   this.createPageCss("../css/login.css");
  //   console.log("adding login.css");
  // }
  //
  // validateUsername(usernameInput) {
  //   usernameInput.setCustomValidity("");
  //   if (usernameInput.value.trim() === "") {
  //     usernameInput.setCustomValidity("Empty Username");
  //   } else if (this.sanitizeInput(usernameInput.value) == false) {
  //     usernameInput.setCustomValidity("Username contains invalid characters");
  //   }
  //   usernameInput.reportValidity();
  // }
  //
  // validatePassword(passwordInput) {
  //   passwordInput.setCustomValidity("");
  //   if (passwordInput.value.trim() === "") {
  //     passwordInput.setCustomValidity("Empty Password");
  //   } else if (passwordInput.value.length < 2) {
  //     passwordInput.setCustomValidity("Password is too short");
  //   }
  //   passwordInput.reportValidity();
  // }
  //
  // handleInputUsername(ev) {
  //   ev.preventDefault();
  //   const usernameInput = document.querySelector("#usernameInput");
  //   this.validateUsername(usernameInput);
  // }
  //
  // handleInputPassword(ev) {
  //   ev.preventDefault();
  //   const passwordInput = document.querySelector("#passwordInput");
  //   this.validatePassword(passwordInput);
  // }
  //
  // async handleLogin(ev) {
  //   try {
  //     ev.preventDefault();
  //     const loginForm = document.querySelector("#loginForm");
  //     const usernameInput = document.querySelector("#usernameInput");
  //     const passwordInput = document.querySelector("#passwordInput");
  //     this.validateUsername(usernameInput);
  //     this.validatePassword(passwordInput);
  //     if (!loginForm.reportValidity()) return;
  //     await this.login();
  //   } catch (error) {
  //     console.debug("Error in login:", error);
  //   }
  // }
  //
  // async addEventListeners() {
  //   console.log("adding event addEventListeners");
  //   const button = document.querySelector("#loginButton");
  //   const usernameInput = document.querySelector("#usernameInput");
  //   const passwordInput = document.querySelector("#passwordInput");
  //   if (usernameInput) {
  //     usernameInput.addEventListener("input", this.handleInputUsername);
  //   }
  //   if (passwordInput)
  //     passwordInput.addEventListener("input", this.handleInputPassword);
  //
  //   if (button) {
  //     button.addEventListener("click", this.handleLogin);
  //   }
  // }
  //
  // async login() {
  //   console.log("login");
  //   const loginForm = document.querySelector("#loginForm");
  //   const nameForm = loginForm.querySelector("input[name='Username']").value;
  //   const paswordForm = loginForm.querySelector("input[name='Password']").value;
  //
  //   if (this.sanitizeInput([nameForm]) == false) {
  //     console.log("Wrong input");
  //     return;
  //   }
  //   try {
  //     const usernameURIencoded = encodeURIComponent(nameForm);
  //     console.log("login before make request");
  //     const request = await this.makeRequest("/api/auth/login", "POST", {
  //       username: usernameURIencoded,
  //       password: paswordForm,
  //     });
  //     const response = await fetch(request);
  //     console.log("Response: ", response);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setSessionStorage(data, usernameURIencoded);
  //       navigateTo("/");
  //     } else {
  //       const log = await this.getErrorLogfromServer(response);
  //       showModal(`${this.lang.getTranslation(["modal", "error"])}`, log);
  //       console.log(log);
  //     }
  //   } catch (Error) {
  //     console.error("Error fetching login:", Error);
  //     showModal(
  //       `${this.lang.getTranslation(["modal", "error"])}`,
  //       Error.message,
  //     );
  //   }
  // }
  //
  removeEventListeners() {
    const button = document.querySelector("#loginButton");
    if (button) {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleLogin);
    }
    document.querySelectorAll('[data-link="view"]').forEach((button) => {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", handleClick);
    });
    const usernameInput = document.querySelector("#usernameInput");
    const passwordInput = document.querySelector("#passwordInput");
    if (usernameInput) {
      usernameInput.removeEventListener("input", this.validateUsername);
    }
    if (passwordInput) {
      passwordInput.removeEventListener("input", this.handleInputPassword);
    }
  }

  removeCss() {
    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.remove();
    });
  }
  destroy() {
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
  }
}
