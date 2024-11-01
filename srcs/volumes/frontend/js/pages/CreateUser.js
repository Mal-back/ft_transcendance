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

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["login", "createProfileBtn"])}`);
     return `
      <div class="background createUser removeElem">
        <div class="p-5 bg-* removeElem">
            <div class="black-txt bg-form create-user-form p-4 removeElem">
                <h1 class="mb-3 text-center create-user-title text-decoration-underline removeElem">${this.lang.getTranslation(["login", "createUserTitle"])}</h1>
                <form id="createUser" class="removeElem">
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Username">${this.lang.getTranslation(["input", "label", "username"])}</label>
                        <input class="form-control" name="Username removeElem" id="Username" type="text">
                        <div id="usernameError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Mail">${this.lang.getTranslation(["input", "label", "mail"])}</label>
                        <input class="form-control removeElem" name="Mail" id="Mail" type="text">
                        <div id="mailError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Password">${this.lang.getTranslation(["input", "label", "password"])}</label>
                        <input class="form-control removeElem" name="Password" id="Password" type="password" autocomplete="off">
                        <div id="passwordError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Password-2">${this.lang.getTranslation(["input", "label", "confirmPass"])}</label>
                        <input class="form-control removeElem" name="Password-2" id="Password-2" type="password" autocomplete="off">
                        <div id="password2Error" class="removeElem"></div>
                    </div>
                    <br>
                    <button id="createUserButton" type="submit" class="btn bg-silver removeElem">${this.lang.getTranslation(["login", "createProfileBtn"])}</button>
                    <br>
                    <br>
                </form>
            </div>
            <div class="d-flex justify-content-center mt-3 removeElem">
                <button type="button" class="btn bg-blue login42-create white-txt removeElem">42 Connect</button>
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
        `${this.lang.getTranslation(["modal", "error"])}`,
        "User is already logged in",
        "/",
      )
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

      if (response.ok) {
        showModal(
          `${this.lang.getTranslation(["login", "accountCreatedTitle"])}`,
          `${this.lang.getTranslation(["login", "accountCreatedMessage"])}`,
        );
        navigateTo("/login");
      } else {
        const log = await this.getErrorLogfromServer(response);
        showModal(`${this.lang.getTranslation(["modal", "error"])}`, `${log}`);
        console.debug("Server response:", log);
      }
    } catch (error) {
      console.error("Error in Request:", error);
      showModal(
        `${this.lang.getTranslation(["modal", "error"])}`,
        `${this.lang.getTranslation(["error", "failConnectServer"])}`,
      );
      // throw new Error("Redirect to /home, server is dead, good luck");
    }
  }

  validateUsername(usernameInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#usernameError");
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
    const errorDiv = document.querySelector("#passwordError");
    errorDiv.innerHTML = "";
    if (passwordInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "password", "empty"])}`;
    } else if (passwordInput.value.length < 2) {
      errorMessage = `${this.lang.getTranslation(["input", "password", "short"])}`;
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
      errorMessage = `${this.lang.getTranslation(["input", "mail", "empty"])}`;
    } else if (!this.sanitizeInput(mailInput.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "mail", "invalid"])}`;
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
      errorMessage = `${this.lang.getTranslation(["input", "password", "empty"])}`;
    }
    if (password2Input.value !== passwordInput.value) {
      errorMessage = `${this.lang.getTranslation(["input", "password", "match"])}`;
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
      console.error("Caught in Event Listener:", error);
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
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleSubmitNewUser);
      button.innerHTML = "";
      button.parentNode.removeChild(button);
      this.createUserButton = null;
    }
    const usernameInput = document.querySelector("#Username");
    const passwordInput = document.querySelector("#Password");
    const password2Input = document.querySelector("#Password-2");
    const mailInput = document.querySelector("#Mail");
    usernameInput.removeEventListener("input", this.handleInputUsername);
    passwordInput.removeEventListener("input", this.handleInputPassword);
    password2Input.removeEventListener("input", this.handleInputPassword);
    mailInput.removeEventListener("input", this.handleInputMail);
    passwordInput.value = "";
    password2Input.value = "";
    mailInput.value = "";
    usernameInput.value = "";
    document.querySelector("#usernameError").innerHTML = "";
    document.querySelector("#passwordError").innerHTML = "";
    document.querySelector("#password2Error").innerHTML = "";
    document.querySelector("#mailError").innerHTML = "";

    // document.querySelectorAll('[data-link="view"]').forEach((button) => {
    //   console.info("removing event click on button : " + button.innerText);
    //   button.removeEventListener("click", this.handleClick);
    // });
  }
}
