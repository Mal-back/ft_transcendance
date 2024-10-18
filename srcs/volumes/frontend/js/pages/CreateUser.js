import { navigateTo } from "../router.js";
import { showModal } from "../Utils/Utils.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.handleSubmitNewUser = this.handleSubmitNewUser.bind(this);
    this.handleInputUsername = this.handleInputUsername.bind(this);
    this.handleInputPassword = this.handleInputPassword.bind(this);
    this.handleInputPassword2 = this.handleInputPassword2.bind(this);
    this.handleInputMail = this.handleInputMail.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/create-user.css");
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["login", "createProfileBtn"])}`);
    return `
      <div class="background removeElem">
        <div class="p-5 bg-* removeElem">
            <div class="black-txt bg-form create-user-form p-4 removeElem">
                <h1 class="mb-3 text-center create-user-title text-decoration-underline removeElem">${this.lang.getTranslation(["login", "createUserTitle"])}</h1>
                <form id="createUser" class="removeElem">
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Username">${this.lang.getTranslation(["login", "usernameLabel"])}</label>
                        <input class="form-control" name="Username removeElem" id="Username" type="text" required>
                        <div class="invalid-feedback removeElem">
                          Username is required.
                        </div>
                    </div>
                    <br>
                    <div class="form-group" removeElem>
                        <label class="removeElem" for="Mail">${this.lang.getTranslation(["login", "mailLabel"])}</label>
                        <input class="form-control removeElem" name="Mail" id="Mail" type="text" required>
                        <div class="invalid-feedback removeElem">
                          E-Mail is required.
                        </div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Password">${this.lang.getTranslation(["login", "passwordLabel"])}</label>
                        <input class="form-control removeElem" name="Password" id="Password" type="password" autocomplete="off" required>
                        <div class="invalid-feedback removeElem">
                          Password is required.
                        </div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Password-2">${this.lang.getTranslation(["login", "password2Label"])}</label>
                        <input class="form-control removeElem" name="Password-2" id="Password-2" type="password" autocomplete="off" required>
                        <div class="invalid-feedback removeElem">
                          Confirmation is required.
                        </div>
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

  async submitNewUser(username, email, password, password2) {
    //TO-DO change error in input to inline validation
    // if (this.sanitizeInput([username, email]) == false) return;
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
    usernameInput.setCustomValidity("");
    if (usernameInput.value.trim() === "") {
      usernameInput.setCustomValidity("Empty Username");
    } else if (this.sanitizeInput(usernameInput.value) == false) {
      usernameInput.setCustomValidity("Username contains invalid characters");
    }
    usernameInput.reportValidity();
  }

  validatePassword(passwordInput) {
    passwordInput.setCustomValidity("");
    if (passwordInput.value.trim() === "") {
      passwordInput.setCustomValidity("Empty Password");
    } else if (passwordInput.value.length < 2) {
      passwordInput.setCustomValidity("Password is too short.");
    }
    passwordInput.reportValidity();
  }

  validateMail(mailInput) {
    mailInput.setCustomValidity("");
    if (mailInput.value.trim() === "") {
      mailInput.setCustomValidity("Empty E-mail");
    } else if (this.sanitizeInput(mailInput.value) == false) {
      mailInput.setCustomValidity("Mail contains invalid characters.");
    }
    mailInput.reportValidity();
  }

  async handleSubmitNewUser(ev) {
    ev.preventDefault();
    try {
      const createUserForm = document.querySelector("createUser");
      const usernameInput = document.querySelector("#Username");
      const passwordInput = document.querySelector("#Password");
      const password2Input = document.querySelector("#Password-2");
      const mailInput = document.querySelector("#Mail");
      this.validateUsername(usernameInput);
      this.validateMail(mailInput);
      this.validatePassword(passwordInput);
      this.validatePassword(password2Input);
      this.validateMail(mail);
      if (password2Input.value != passwordInput.value) {
        password2Input.setCustomValidity("Both password doesn't match");
        password2Input.reportValidity();
      }
      if (!createUserForm.reportValidity()) return;
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
  }

  handleInputPassword2(ev) {
    ev.preventDefault();
    const password2Input = document.querySelector("#Password-2");
    this.validatePassword(password2Input);
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
    password2Input.addEventListener("input", this.handleInputPassword2);
    mailInput.addEventListener("input", this.handleInputMail);
  }

  removeEventListeners() {
    const button = document.querySelector("#createUserButton");
    if (button) {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleSubmitNewUser);
    }
    document.querySelectorAll('[data-link="view"]').forEach((button) => {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleClick);
    });
  }

  destroy() {
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
    this.removeElem();
  }
}
