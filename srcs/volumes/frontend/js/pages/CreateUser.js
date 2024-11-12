import { navigateTo } from "../router.js";
import { showModal } from "../Utils/Utils.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.handleSubmitNewUser = this.handleSubmitNewUser.bind(this);
    this.handleInputUsername = this.handleInputUsername.bind(this);
    this.handleInputPassword = this.handleInputPassword.bind(this);
    this.handleInputMail = this.handleInputMail.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/create-user.css");
  }

  async makeUsers() {
    const user = "user";
    for (let index = 0; index< 26; index++) {
      let username = `${user}${index}`
      await this.submitNewUser(`${username}`, `${username}@google.com`, `${username}`, `${username}`)
      console.log(`${username} created`);
    }

  }


  async getHtml() {
    await this.makeUsers();
    this.setTitle(`${this.lang.getTranslation(["title", "createProfile"])}`);
    return `
      <div class="background createUser removeElem">
        <div class="p-5 bg-* removeElem">
            <div class="black-txt bg-form create-user-form p-4 removeElem">
                <h1 class="mb-3 text-center create-user-title text-decoration-underline removeElem">${this.lang.getTranslation(["title", "createProfile"])}</h1>
                <form id="createUser" class="removeElem">
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Username">${this.lang.getTranslation(["input", "label", "username"])}:</label>
                        <input class="form-control" name="Username removeElem" id="Username" type="text">
                        <div id="usernameError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Mail">${this.lang.getTranslation(["input", "label", "email"])}:</label>
                        <input class="form-control removeElem" name="Mail" id="Mail" type="text">
                        <div id="mailError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Password">${this.lang.getTranslation(["input", "label", "password"])}:</label>
                        <input class="form-control removeElem" name="Password" id="Password" type="password" autocomplete="off">
                        <div id="passwordError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Password-2">${this.lang.getTranslation(["input", "label", "confirm"])} ${this.lang.getTranslation(["input", "label", "password"])}:</label>
                        <input class="form-control removeElem" name="Password-2" id="Password-2" type="password" autocomplete="off">
                        <div id="password2Error" class="removeElem"></div>
                    </div>
                    <br>
                    <button id="createUserButton" type="submit" class="btn bg-silver removeElem">${this.lang.getTranslation(["title", "createProfile"])}</button>
                    <br>
                    <br>
                </form>
            </div>
        </div>
      </div>
            `;
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

  async submitNewUser(username, email, password, password2) {
    try {
      const request = await this.makeRequest("/api/auth/", "POST", {
        username: encodeURIComponent(username),
        password: password,
        password2: password2,
        email: email,
        two_fa_enable: false,
      });
      const response = await fetch(request);

      if (await this.handleStatus(response)) {
        showModal(
          `${this.lang.getTranslation(["modal", "title", "accountCreation"])}`,
          `${this.lang.getTranslation(["modal", "message", "accountCreation"])}`,
        );
        console.log("");
        navigateTo("/login");
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  validateUsername(usernameInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#usernameError");
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
    const errorDiv = document.querySelector("#passwordError");
    errorDiv.innerHTML = "";
    if (passwordInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
    } else if (passwordInput.value.length < 2) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "short"])}`;
    }
    if (errorMessage) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = "red";
      errorDiv.style.fontStyle = "italic";
    }
    errorDiv.classList.add("removeElem");
    return errorMessage;
  }

  validateMail(mailInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#mailError");
    errorDiv.innerHTML = "";
    if (mailInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "label", "email"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
    } else if (!this.sanitizeInput(mailInput.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "email"])} ${this.lang.getTranslation(["input", "error", "invalidChar"])}`;
    }
    if (errorMessage) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = "red";
      errorDiv.style.fontStyle = "italic";
    }
    errorDiv.classList.add("removeElem");
    return errorMessage;
  }

  validatePasswordMatch(passwordInput, password2Input) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#password2Error");
    errorDiv.innerHTML = "";
    if (passwordInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
    }
    if (password2Input.value !== passwordInput.value) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "match"])}`;
    }
    if (errorMessage) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = "red";
      errorDiv.style.fontStyle = "italic";
    }
    errorDiv.classList.add("removeElem");
    return errorMessage;
  }

  async handleSubmitNewUser(ev) {
    ev.preventDefault();
    try {
      const usernameInput = document.querySelector("#Username");
      const passwordInput = document.querySelector("#Password");
      const password2Input = document.querySelector("#Password-2");
      const mailInput = document.querySelector("#Mail");

      let isValid = true;

      if (this.validateUsername(usernameInput)) isValid = false;
      if (this.validateMail(mailInput)) isValid = false;
      if (this.validatePassword(passwordInput)) isValid = false;
      if (this.validatePasswordMatch(passwordInput, password2Input))
        isValid = false;
      if (!isValid) {
        return;
      }

      await this.submitNewUser(
        usernameInput.value,
        mailInput.value,
        passwordInput.value,
        password2Input.value,
      );
    } catch (error) {
      if (error instanceof CustomError) showModal(error.title, error.message);
    }
  }

  handleInputUsername(ev) {
    ev.preventDefault();
    const usernameInput = document.querySelector("#Username");
    this.validateUsername(usernameInput);
  }

  handleInputPassword(ev) {
    ev.preventDefault();
    const passwordInput = document.querySelector("#Password");
    this.validatePassword(passwordInput);
    const password2Input = document.querySelector("#Password-2");
    this.validatePasswordMatch(passwordInput, password2Input);
  }

  handleInputMail(ev) {
    ev.preventDefault();
    const mailInput = document.querySelector("#Mail");
    this.validateMail(mailInput);
  }

  async addEventListeners() {
    const button = document.querySelector("#createUserButton");
    const usernameInput = document.querySelector("#Username");
    const passwordInput = document.querySelector("#Password");
    const password2Input = document.querySelector("#Password-2");
    const mailInput = document.querySelector("#Mail");
    if (button) {
      button.addEventListener("click", this.handleSubmitNewUser);
    }
    usernameInput.addEventListener("input", this.handleInputUsername);
    passwordInput.addEventListener("input", this.handleInputPassword);
    password2Input.addEventListener("input", this.handleInputPassword);
    mailInput.addEventListener("input", this.handleInputMail);
  }

  removeEventListeners() {
    const button = document.querySelector("#createUserButton");
    if (button) {
      button.removeEventListener("click", this.handleSubmitNewUser);
    }
    const usernameInput = document.querySelector("#Username");
    const passwordInput = document.querySelector("#Password");
    const password2Input = document.querySelector("#Password-2");
    const mailInput = document.querySelector("#Mail");
    if (usernameInput) {
      usernameInput.removeEventListener("input", this.handleInputUsername);
      usernameInput.value = "";
    }
    if (passwordInput) {
      passwordInput.value = "";
      passwordInput.removeEventListener("input", this.handleInputPassword);
    }
    if (password2Input) {
      password2Input.value = "";
      password2Input.removeEventListener("input", this.handleInputPassword);
    }
    if (mailInput) {
      mailInput.removeEventListener("input", this.handleInputMail);
      mailInput.value = "";
    }
    const usernameError = document.querySelector("#usernameError");
    if (usernameError) usernameError.innerHTML = "";
    const passwordError = document.querySelector("#passwordError");
    if (passwordError) passwordError.innerHTML = "";
    const password2Error = document.querySelector("#password2Error");
    if (password2Error) password2Error.innerHTML = "";
    const mailError = document.querySelector("#mailError");
    if (mailError) mailError.innerHTML = "";
  }
}
