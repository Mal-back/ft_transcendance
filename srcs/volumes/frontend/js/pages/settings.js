import AbstractView from "./AbstractViews.js";
import { navigateTo } from "../router.js";
import {
  removeSessionStorage,
  setSessionStorage,
  showModal,
} from "../Utils/Utils.js";
import CustomError from "../Utils/CustomError.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Settings");
    this.selectedBackground = null;
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleInputUsername = this.handleInputUsername.bind(this);
    this.handleInputNewPassword = this.handleInputNewPassword.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleInputMail = this.handleInputMail.bind(this);
    this.handleChangeMail = this.handleChangeMail.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/background-profile.css");
    this.createPageCss("../css/buttons.css");
  }

  async getHtml() {
    if (!sessionStorage.getItem("username_transcendence")) {
      throw new CustomError(
        this.lang.getTranslation(["modal", "error"]),
        this.lang.getTranslation(["error", "notAuthentified"]),
        "/",
      );
    }
    return `
<div class="background removeElem">
    <div class="Profile container removeElem">
        <div class="container mt-4 removeElem">
            <h1 class="removeElem">${this.lang.getTranslation(["settings", "settingsLabel"])}</h1>
            <form class="removeElem">

                <!-- USERNAME -->
                <div class="mb-3 removeElem">
                    <label for="username-settings" class="form-label removeElem">${this.lang.getTranslation(["settings", "Username", "label"])}</label>
                    <input type="text" class="form-control removeElem" id="username-settings" name="UsernameChange" value="${sessionStorage.getItem("username_transcendence")}">
                    <div id="settingsUsernameError" class="removeElem"></div>
                    <button id="changeUsername" type="button" class="btn btn-success custom-button removeElem">
                        ${this.lang.getTranslation(["settings", "Username", "saveButton"])}
                    </button>
                </div>
                <!-- PROFILE BACKGROUND SECTION -->
                <div class="mb-3 removeElem">
                    <label for="uploadProfileBackground" class="form-label removeElem">${this.lang.getTranslation(["settings", "Background", "label"])}</label>
                    <div id="currentProfileBackground" class="rounded mb-3 Avatar removeElem"
                        style="background-image: url(../../img/ts/TTPD.jpeg);">
                    </div>
                    <button type="button" class="btn btn-secondary removeElem" data-bs-toggle="modal"
                        data-bs-target="#changeProfileBackground">${this.lang.getTranslation(["settings", "Background", "changeButton"])}</button>
                </div>
                <!-- MAIL HANDLER -->
                <div class="mb-3 removeElem">
                    <label for="email" class="form-label removeElem">Email</label>
                    <br />
                    <button type="button" id="email" class="btn btn-secondary removeElem" data-bs-toggle="modal"
                        data-bs-target="#handleEmail">
                        ${this.lang.getTranslation(["settings", "Email", "buttonLabel"])}
                    </button>
                </div>
                <div class="modal fade removeElem" id="handleEmail" tabindex="-1" aria-labelledby="handleEmailLabel"
                    aria-hidden="true">
                    <div class="modal-dialog removeElem">
                        <div class="modal-content removeElem">
                            <div class="modal-header removeElem">
                                <h5 class="modal-title removeElem" id="handleEmailLabel">
                                    ${this.lang.getTranslation(["settings", "Email", "changeButton"])}
                                </h5>
                                <button type="button" class="btn-close removeElem" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body removeElem">
                                <form class="removeElem">

                                    <div class="mb-3 removeElem">
                                        <label for="email-old" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "oldMail"])}</label>
                                        <input type="email" class="form-control removeElem" id="email-old" name="oldMail" value="">
                                        <div id="oldMailError" class="removeElem"></div>
                                    </div>

                                    <div class="mb-3 removeElem">
                                        <label for="email-new" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "newMail"])}</label>
                                        <input type="email" class="form-control removeElem" id="email-new" name="mailChange" value="">
                                        <div id="newMailError" class="removeElem"></div>
                                    </div>

                                    <div class="mb-3 removeElem">
                                        <label for="email-confirm" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "confirmMail"])}</label>
                                        <input type="email" class="form-control removeElem" id="email-confirm" name="checkMail" value="">
                                        <div id="confirmMailError" class="removeElem"></div>
                                    </div>

                                </form>
                            </div>
                            <div class="modal-footer removeElem">
                                <button type="button" class="btn btn-secondary removeElem" data-bs-dismiss="modal">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Close"])}
                                </button>
                                <button type="button" class="btn btn-success removeElem" id="confirmChangesMail">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Confirm"])}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PASSWORD -->
                <div class="mb-3 removeElem">
                    <label for="password-label" class="form-label removeElem">Password</label>
                    <br />
                    <button type="button" id="password-label" class="btn btn-secondary removeElem" data-bs-toggle="modal"
                        data-bs-target="#handlePassword">
                        ${this.lang.getTranslation(["settings", "Password", "buttonLabel"])}
                    </button>
                </div>
                <div class="modal fade removeElem" id="handlePassword" tabindex="-1" aria-labelledby="handlePasswordLabel"
                    aria-hidden="true">
                    <div class="modal-dialog removeElem">
                        <div class="modal-content removeElem">
                            <div class="modal-header removeElem">
                                <h5 class="modal-title removeElem" id="handlePasswordLabel">
                                    ${this.lang.getTranslation(["settings", "Password", "changeButton"])}
                                </h5>
                                <button type="button" class="btn-close removeElem" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body removeElem">
                                <form class="removeElem">
                                    <div class="mb-3 removeElem">
                                        <label for="old-password-settings" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "oldPass"])}</label>
                                        <input type="password" class="form-control removeElem" name="oldPassword" id="old-password-settings" autocomplete="off" />
                                        <div id="oldPassError" class="removeElem"></div>
                                    </div>
                                    <div class="mb-3 removeElem">
                                        <label for="new-password-settings" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "newPass"])}</label>
                                        <input type="password" class="form-control removeElem" name="newPassword" id="new-password-settings" autocomplete="off"/>
                                        <div id="newPassError" class="removeElem"></div>
                                    </div>
                                    <div class="mb-3 removeElem">
                                        <label for="confirm-new-password-settings" class="form-label removeElem">
                                            ${this.lang.getTranslation(["input", "label", "confirmNewPass"])}</label>
                                        <input type="password" class="form-control removeElem" name="confirmPassword" id="confirm-new-password-settings" autocomplete="off" />
                                        <div id="confirmPassError" class="removeElem"></div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer removeElem">
                                <button type="button" class="btn btn-secondary removeElem" data-bs-dismiss="modal">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Close"])}
                                </button>
                                <button type="button" class="btn btn-success removeElem" id="confirm-changes-password-btn">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Confirm"])}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LANGUAGE -->
                <div class="mb-3 removeElem">
                    <label for="language" class="form-label removeElem">${this.lang.getTranslation(["settings", "Language", "label"])}</label>
                    <select class="form-select removeElem" id="language">
                        <option class="removeElem" selected>English</option>
                        <option class="removeElem" value="1">Spanish</option>
                        <option class="removeElem" value="2">French</option>
                    </select>
                    <button type="button" class="btn btn-success custom-button removeElem">
                        ${this.lang.getTranslation(["settings", "Language", "saveButton"])}
                    </button>
                </div>

                <!-- DATA HANDLER -->
                <div class="mb-3 removeElem">
                    <button type="button" class="btn btn-info white-txt removeElem" data-bs-toggle="modal"
                        data-bs-target="#handleData">
                        ${this.lang.getTranslation(["settings", "DataHandler", "buttonLabel"])}
                    </button>
                </div>
                <div class="modal fade removeElem" id="handleData" tabindex="-1" aria-labelledby="handleDataLabel"
                    aria-hidden="true">
                    <div class="modal-dialog removeElem">
                        <div class="modal-content removeElem">
                            <div class="modal-header removeElem">
                                <h5 class="modal-title removeElem" id="handleDataLabel">
                                    ${this.lang.getTranslation(["settings", "DataHandler", "buttonLabel"])}
                                </h5>
                                <button type="button" class="btn-close removeElem" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body removeElem">
                                <form class="removeElem">
                                    <div class="mb-3 removeElem">
                                        <button type="button" class="btn btn-success removeElem">
                                            ${this.lang.getTranslation(["settings", "DataHandler", "modalFields", "send"])}
                                        </button>
                                    </div>
                                    <div class="mb-3 removeElem">
                                        <button type="button" class="btn btn-warning removeElem" data-bs-toggle="modal"
                                            data-bs-target="#confirmDeleteAccountModal">
                                            ${this.lang.getTranslation(["settings", "DataHandler", "modalFields", "delete"])}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer removeElem">
                                <button type="button" class="btn btn-secondary removeElem" data-bs-dismiss="modal">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Close"])}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
<div class="modal fade removeElem" id="changeProfileBackground" tabindex="-1" aria-labelledby="changeProfileBackgroundLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-lg removeElem">
        <div class="modal-content removeElem">
            <div class="modal-header removeElem">
                <h5 class="modal-title removeElem" id="changeProfileBackgroundLabel">
                    ${this.lang.getTranslation(["settings", "Background", "select"])}</h5>
                <button type="button" class="btn-close removeElem" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body removeElem">
                <!-- Current Profile Background Display -->
                <div class="mb-3 removeElem">
                    <h6 class="removeElem">${this.lang.getTranslation(["settings", "Background", "current"])}</h6>
                    <div id="currentProfileBackgroundPreview" class="rounded removeElem"
                        style="width: 11vh; height: 11vh; background-size: cover; background-position: center; background-image: url(../../img/ts/TTPD.jpeg);">
                    </div>
                </div>

                <!-- Choose a Profile Background -->
                <div class="mb-3 removeElem">
                    <h6 class="removeElem">${this.lang.getTranslation(["settings", "Background", "current"])}</h6>
                    <div class="row removeElem">
                        <div class="col-4 removeElem">
                            <img src="../../img/ts/TTPD.jpeg" class="img-fluid rounded border removeElem" alt="Background 1"
                                style="cursor: pointer;">
                        </div>
                        <div class="col-4 removeElem">
                            <img src="../../img/ts/RED.jpeg" class="img-fluid rounded border removeElem" alt="Background 2"
                                style="cursor: pointer;">
                        </div>
                        <div class="col-4 removeElem">
                            <img src="../../img/ts/MIDNIGHTS.jpeg" class="img-fluid rounded border removeElem" alt="Background 3"
                                style="cursor: pointer;">
                        </div>
                        <div class="col-4 removeElem">
                            <img src="../../img/ts/EVERMORE.jpeg" class="img-fluid rounded border removeElem" alt="Background 4"
                                style="cursor: pointer;">
                        </div>
                    </div>
                </div>

                <!-- Upload Your Own Profile Background -->
                <div class="mb-3 removeElem">
                    <h6 class="removeElem">${this.lang.getTranslation(["settings", "Background", "upload"])}</h6>
                    <input type="file" class="form-control removeElem" accept="image/*" id="uploadProfileBackground">
                    <button type="button" class="btn btn-success removeElem">Upload</button>
                </div>
            </div>
            <div class="modal-footer removeElem">
                <button type="button" class="btn btn-secondary removeElem" data-bs-dismiss="modal">
                    ${this.lang.getTranslation(["settings", "modalButtons", "Close"])}</button>
                <button type="button" class="btn btn-success removeElem" id="confirm-profile-background-btn">
                    ${this.lang.getTranslation(["settings", "Background", "set"])}</button>
            </div>
        </div>
    </div>
</div>

`;
  }

  async changeUsername() {
    const username = sessionStorage.getItem("username_transcendence");
    const newUsername = document.querySelector(
      "input[name='UsernameChange']",
    ).value;
    if (this.sanitizeInput([newUsername]) == false) {
      return;
    }
    try {
      const request = await this.makeRequest(
        "/api/auth/update/" + username,
        "PATCH",
        {
          username: newUsername,
        },
      );
      const response = await fetch(request);
      if (response.ok) {
        showModal(
          `${this.lang.getTranslation(["modal", "success"])}`,
          `${this.lang.getTranslation(["settings", "Username", "successMessage"])}`,
        );
        sessionStorage.setItem("username_transcendence", newUsername);
        console.log("response", response);
        const data = await response.json();
        setSessionStorage(data, newUsername);
      } else {
        const log = await this.getErrorLogfromServer(response);
        console.log(log);
        showModal(this.lang.getTranslation(["modal", "error"]), log);
      }
    } catch (error) {
      console.debug("Error in changeUsername Request", error);
      showModal(this.lang.getTranslation(["modal", "error"]), error.message);
    }
  }

  async checkoldMail(mailTocheck) {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest("/api/auth/" + username, "GET");
      const response = await fetch(request);
      if (response.ok) {
        const data = await response.json();
        console.log(
          "old mail = " + data.email + "oldMail == data.mail :",
          data.email == mailTocheck,
        );
        return data.email == mailTocheck;
      } else {
        removeSessionStorage();
        throw new CustomError(
          `${this.lang.getTranslation(["modal", "error"])}`,
          `${this.lang.getTranslation(["error", "errorAuthentification"])}`,
          "/login",
        );
      }
    } catch (error) {
      if (!(error instanceof CustomError)) {
        showModal(
          `${this.lang.getTranslation(["modal", "error"])}`,
          error.message,
        );
        console.debug("Error in checkoldMail:", error);
      }
      throw error;
    }
  }

  async changePassword(oldPassword, newPassword, confirmPassword) {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest(
        "/api/auth/password/" + username,
        "PATCH",
        {
          password: oldPassword,
          new_password: newPassword,
          new_password2: confirmPassword,
        },
      );
      const response = await fetch(request);
      if (response.ok) {
        showModal(
          `${this.lang.getTranslation(["modal", "success"])}`,
          `${this.lang.getTranslation(["settings", "Password", "modalFields", "success"])}`,
        );
        console.log("response", response);
        // const data = await response.json();
        // console.log("data after change =", data);
      } else {
        const logError = await this.getErrorLogfromServer(response);
        console.log("ERROR", response);
        showModal(`${this.lang.getTranslation(["modal", "error"])}`, logError);
      }
    } catch (error) {
      if (!(error instanceof CustomError)) {
        console.debug("Error", error);
        showModal(
          `${this.lang.getTranslation(["modal", "error"])}`,
          error.message,
        );
      }
      throw error;
    }
  }

  async changeMail(oldMail, newMail) {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      if ((await this.checkoldMail(oldMail)) == false) {
        this.showModalWithError("Error", "Incorrect old E-mail address");
        return;
      }
    } catch (error) {
      throw error;
    }
    try {
      const request = await this.makeRequest(
        "/api/auth/update/" + username,
        "PATCH",
        {
          email: newMail,
        },
      );
      const response = await fetch(request);
      if (response.ok) {
        showModal(
          `${this.lang.getTranslation(["modal", "success"])}`,
          `${this.lang.getTranslation(["settings", "Email", "modalFields", "success"])}`,
        );
        const data = await response.json();
        console.log("data after change =", data);
      } else {
        const dataError = await this.getErrorLogfromServer(response);
        showModal(`${this.lang.getTranslation(["modal", "error"])}`, dataError);
      }
    } catch (error) {
      if (!(error instanceof CustomError)) {
        console.debug("Error in changeMail Request", error);
        showModal(
          `${this.lang.getTranslation(["modal", "error"])}`,
          error.message,
        );
      }
      throw error;
    }
  }

  async deleteAccount() {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest(
        `/api/auth/delete/${username}`,
        "DELETE",
      );
      const response = await fetch(request);
      if (response.ok) {
        removeSessionStorage();
        this.cleanModal();
        throw new CustomError(
          `${this.lang.getTranslation(["modal", "success"])}`,
          `${this.lang.getTranslation(["settings", "DataHandler", "modalFields", "successDeleteAccount"])}`,
          "/",
        );
      } else {
        const dataError = await response.json();
        showModal(`${this.lang.getTranslation(["modal", "error"])}`, dataError);
      }
    } catch (error) {
      if (!(error instanceof CustomError)) {
        console.error("Error during account deletion request:", error);
        showModal(
          `${this.lang.getTranslation(["modal", "error"])}`,
          error.message,
        );
      } else {
        throw CustomError;
      }
    }
  }

  selectProfileBackground(imagePath, element) {
    this.selectedBackground = imagePath;
    document.getElementById(
      "currentProfileBackgroundPreview",
    ).style.backgroundImage = `url(${imagePath})`;
    // Deselect other images
    let images = document.querySelectorAll(".img-fluid");
    images.forEach((img) => img.classList.remove("border-success"));
    element.classList.add("border-success");
  }

  validateUsername(usernameInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#settingsUsernameError");
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

  handleInputUsername(ev) {
    ev.preventDefault();
    const usernameInput = document.querySelector("#username-settings");
    this.validateUsername(usernameInput);
  }

  async handleChangeUsername(ev) {
    ev.preventDefault();
    try {
      const usernameInput = document.querySelector("#username-settings");
      if (this.validateUsername(usernameInput)) return;
      await this.changeUsername();
    } catch (error) {
      console.error("handleChangeUsername: ", error);
    }
  }

  validatePassword(passwordInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#newPassError");
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

  validatePasswordMatch(passwordInput, password2Input) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#confirmPassError");
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

  validateMail(mailInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#newMailError");
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

  validateConfirmMail(mailInput, confirmMailInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#confirmMailError");
    errorDiv.innerHTML = "";
    if (mailInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "mail", "empty"])}`;
    } else if (!this.sanitizeInput(mailInput.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "mail", "invalid"])}`;
    } else if (mailInput.value != confirmMailInput.value) {
      errorMessage = `${this.lang.getTranslation(["input", "mail", "match"])}`;
    }
    if (errorMessage) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = "red";
      errorDiv.style.fontStyle = "italic";
    }
    errorDiv.classList.add("removeElem");
    return errorMessage;
  }

  handleInputNewPassword(ev) {
    ev.preventDefault();
    const newPasswordInput = document.querySelector("#new-password-settings");
    this.validatePassword(newPasswordInput);
    const confirmPasswordInput = document.querySelector(
      "#confirm-new-password-settings",
    );
    this.validatePasswordMatch(confirmPasswordInput);
  }

  async handleChangePassword(ev) {
    ev.preventDefault();
    try {
      const oldPass = document.querySelector("#old-password-settings");
      const newPass = document.querySelector("#new-password-settings");
      const confirmPass = document.querySelector(
        "#confirm-new-password-settings",
      );
      let isValid = true;
      if (this.validatePassword(newPass)) isValid = false;
      if (this.validatePasswordMatch(newPass, confirmPass)) isValid = false;
      if (!isValid) return;
      // 500 ERROR ?
      await this.changePassword(
        oldPass.value,
        newPass.value,
        confirmPass.value,
      );
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("HandleChangePassword:", error);
      }
    }
  }

  async handleChangeMail(ev) {
    ev.preventDefault();
    try {
      const oldMail = document.querySelector("#email-old");
      const newMail = document.querySelector("#email-new");
      const confirmMail = document.querySelector("#email-confirm");
      let isValid = true;
      if (this.validateMail(newMail)) isValid = false;
      if (this.validateConfirmMail(newMail, confirmMail)) isValid = false;
      if (!isValid) return;
      await this.changeMail(oldMail.value, newMail.value, confirmMail.value);
    } catch (error) {}
  }

  handleInputMail(ev) {
    ev.preventDefault();
    const newMail = document.querySelector("#email-new");
    const confirmMail = document.querySelector("#email-confirm");
    this.validateMail(newMail);
    this.validateConfirmMail(newMail, confirmMail);
  }

  async addEventListeners() {
    try {
      const usernameInput = document.querySelector("#username-settings");
      usernameInput.addEventListener("input", this.handleInputUsername);

      const button = document.querySelector("#changeUsername");
      button.addEventListener("click", this.handleChangeUsername);

      const buttonPass = document.querySelector(
        "#confirm-changes-password-btn",
      );
      buttonPass.addEventListener("click", this.handleChangePassword);

      const passwordInput = document.querySelector("#new-password-settings");
      passwordInput.addEventListener("input", this.handleInputNewPassword);

      const confirmPasswordInput = document.querySelector(
        "#confirm-new-password-settings",
      );
      confirmPasswordInput.addEventListener(
        "input",
        this.handleInputNewPassword,
      );

      const newMailInput = document.querySelector("#email-new");
      newMailInput.addEventListener("input", this.handleInputMail);

      const confirmMailInput = document.querySelector("#email-confirm");
      confirmMailInput.addEventListener("input", this.handleInputMail);
      const buttonMail = document.querySelector("#confirmChangesMail");
      buttonMail.addEventListener("click", this.handleChangeMail);
    } catch (error) {
      console.error("error: ", error.message);
      // throw error;
    }

    const deleteAccountButton = document.querySelector(
      "#confirmDeleteAccountBtn",
    );
    if (deleteAccountButton) {
      deleteAccountButton.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Delete Account confirmed!");
        try {
          await this.deleteAccount();
        } catch (error) {
          console.error("Error while deleting account:", error.message);
        }
      });
    }

    const openDeleteAccountModalButton = document.querySelector(".btn-warning"); // Assuming the "Delete Account" button is the warning button
    if (openDeleteAccountModalButton) {
      openDeleteAccountModalButton.addEventListener("click", (ev) => {
        ev.preventDefault();
        console.debug("Delete Account button pressed!");
      });
    }
    // Handle the profile background confirmation
    const images = document.querySelectorAll(".img-fluid");
    images.forEach((img) => {
      img.addEventListener("click", (event) => {
        this.selectProfileBackground(img.src, img); // Call the method using 'this'
      });
    });
  }

  removeEventListeners() {
    const changeUsernameButton = document.querySelector("#changeUsername");
    if (changeUsernameButton) {
      changeUsernameButton.removeEventListener(
        "click",
        this.handleChangeUsername,
      );
    }
    const usernameInput = document.querySelector("#username-settings");
    if (usernameInput) {
      usernameInput.removeEventListener("input", this.handleInputUsername);
    }

    const deleteAccountButton = document.querySelector(
      "#confirmDeleteAccountBtn",
    );
    if (deleteAccountButton) {
      deleteAccountButton.removeEventListener("click", this.deleteAccount);
    }

    const openDeleteAccountModalButton = document.querySelector(".btn-warning");
    if (openDeleteAccountModalButton) {
      openDeleteAccountModalButton.removeEventListener(
        "click",
        this.openDeleteAccountModal,
      );
    }
    const confirmProfileBackgroundButton = document.querySelector(
      "#confirm-profile-background-btn",
    );
    if (confirmProfileBackgroundButton) {
      confirmProfileBackgroundButton.removeEventListener(
        "click",
        this.confirmProfileBackground,
      );
    }
    const uploadProfileBackgroundInput = document.querySelector(
      "#uploadProfileBackground",
    );
    if (uploadProfileBackgroundInput) {
      uploadProfileBackgroundInput.removeEventListener(
        "change",
        this.uploadProfileBackground,
      );
    }
    const changeMailButton = document.querySelector("#confirmChangesMail");
    if (changeMailButton) {
      changeMailButton.removeEventListener("click", this.changeMail);
    }
  }

  destroy() {
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
    this.removeElem();
  }
}
// const confirmButton = document.getElementById('confirm-profile-background-btn');
// if (confirmButton) {
//     confirmButton.addEventListener('click', () => {
//         if (this.selectedBackground) { // Use 'this.selectedBackground'
//             document.getElementById('currentProfileBackground').style.backgroundImage = `url(${ this.selectedBackground })`;
//             // Close the modal properly using Bootstrap's modal instance
//             const modalInstance = bootstrap.Modal.getInstance(document.getElementById('changeProfileBackground'));
//             modalInstance.hide();
//         }
//     });
// }
// const uploadInput = document.getElementById('uploadProfileBackground');
// if (uploadInput) {
//     uploadInput.addEventListener('change', (event) => {
//         let file = event.target.files[0];
//         if (file) {
//             let reader = new FileReader();
//             reader.onload = (e) => {
//                 this.selectedBackground = e.target.result; // Use 'this.selectedBackground'
//                 document.getElementById('currentProfileBackgroundPreview').style.backgroundImage = `url(${ this.selectedBackground })`;
//             };
//             reader.readAsDataURL(file);
//         }
//     });
// }
