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
    this.selectedBackground = null;
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleInputUsername = this.handleInputUsername.bind(this);
    this.handleInputNewPassword = this.handleInputNewPassword.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleInputMail = this.handleInputMail.bind(this);
    this.handleChangeMail = this.handleChangeMail.bind(this);
    this.handleUploadAvatar = this.handleUploadAvatar.bind(this);
    this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
    this.changeProfilePic = this.changeProfilePic.bind(this);
    this.showFileUpload = this.showFileUpload.bind(this);
    this.handleSaveLanguage = this.handleSaveLanguage.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/background-profile.css");
    this.createPageCss("../css/buttons.css");
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["title", "settings"])}`);
    const currentAvatar = await this.getCurrentAvatar();
    const defaultAvatar = await this.getDefaultAvatar(currentAvatar);
    const htmlContent = `
<div class="background removeElem">
    <div class="Profile container removeElem">
        <div class="container mt-4 removeElem">
            <h1 class="removeElem">${this.lang.getTranslation(["title", "settings"])}</h1>
            <form class="removeElem">

                <!-- USERNAME -->
                <div class="mb-3 removeElem">
                    <label for="username-settings" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "username"])}:</label>
                    <input type="text" class="form-control removeElem" id="username-settings" name="UsernameChange" value="${sessionStorage.getItem("username_transcendence")}">
                    <div id="settingsUsernameError" class="removeElem"></div>
                    <button id="changeUsername" type="button" class="btn btn-success custom-button removeElem">
                        ${this.lang.getTranslation(["button", "save"])} ${this.lang.getTranslation(["input", "label", "username"])}
                    </button>
                </div>
                <!-- PROFILE BACKGROUND SECTION -->
                <div class="mb-3 removeElem">
                    <label for="uploadProfileBackground" class="form-label removeElem">${this.lang.getTranslation(["user", "avatar"])}:</label>
                    <div id="currentProfileBackground" class="rounded mb-3 Avatar removeElem"
                        style="background-image: url(${currentAvatar});">
                    </div>
                    <button type="button" class="btn btn-secondary removeElem" data-bs-toggle="modal"
                        data-bs-target="#changeProfileBackground">
                        ${this.lang.getTranslation(["button", "change"])} ${this.lang.getTranslation(["user", "avatar"])}
                    </button>
                </div>
                <!-- MAIL HANDLER -->
                <div class="mb-3 removeElem">
                    <label for="email" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "email"])}:</label>
                    <br />
                    <button type="button" id="emailModalButton" class="btn btn-secondary removeElem"
                        >
                        ${this.lang.getTranslation(["button", "change"])} ${this.lang.getTranslation(["input", "label", "email"])}
                    </button>
                </div>
                
                <!-- PASSWORD -->
                <div class="mb-3 removeElem">
                    <label for="password-label" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "password"])}:</label>
                    <br />
                    <button type="button" id="password-label" class="btn btn-secondary removeElem" data-bs-toggle="modal"
                        data-bs-target="#handlePassword">
                        ${this.lang.getTranslation(["button", "change"])} ${this.lang.getTranslation(["input", "label", "password"])}
                    </button>
                </div>
                
                <!-- LANGUAGE -->
                <div class="mb-3 removeElem">
                    <label for="language" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "language"])}:</label>
                    <select class="form-select removeElem" id="language">
                        <option class="removeElem" value="en" selected>English</option>
                        <option class="removeElem" value="es">Spanish</option>
                        <option class="removeElem" value="fr">French</option>
                    </select>
                    <button id="saveLanguageButton" type="button" class="btn btn-success custom-button removeElem">
                        ${this.lang.getTranslation(["button", "change"])} ${this.lang.getTranslation(["input", "label", "language"])}
                    </button>
                </div>

                <!-- DATA HANDLER -->
                <div class="mb-3 removeElem">
                    <button type="button" class="btn btn-info white-txt removeElem" data-bs-toggle="modal"
                        data-bs-target="#handleData">
                        ${this.lang.getTranslation(["button", "handle"])} ${this.lang.getTranslation(["button", "data"])}
                    </button>
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
                    ${this.lang.getTranslation(["user", "selectAvatar"])}</h5>
                <button type="button" class="btn-close removeElem" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body removeElem">
                <div class="mb-3 removeElem">
                    <h6 class="removeElem">${this.lang.getTranslation(["user", "current"])} ${this.lang.getTranslation(["user", "avatar"])}:</h6>
                    <div id="currentProfileBackgroundPreview" class="rounded removeElem"
                        style="width: 11vh; height: 11vh; background-size: cover; background-position: center; background-image: url(${currentAvatar});">
                    </div>
                </div>

                <div class="mb-3 removeElem">
                    <h6 class="removeElem">${this.lang.getTranslation(["user", "choose"])}:</h6>
                    <div class="row removeElem" id="availableBackground">
                        ${defaultAvatar.outerHTML}
                    </div>
                </div>

                <div class="mb-3 removeElem">
                    <h6 class="removeElem">${this.lang.getTranslation(["user", "orUpload"])}:</h6>
                    <div class="custom-file-upload removeElem">
                        <label for="uploadProfileBackground" class="custom-upload-btn removeElem">${this.lang.getTranslation(["button", "chooseFile"])}</label>
                        <span class="removeElem" id="file-chosen">${this.lang.getTranslation(["input", "preview", "noFile"])}</span>
                        <input type="file" class="form-control removeElem" accept="image/*" id="uploadProfileBackground" hidden>
                    </div>
                    <button type="button" class="btn btn-success removeElem" id="uploadButton">${this.lang.getTranslation(["button", "upload"])}</button>
                </div>
            </div>
            <div class="modal-footer removeElem">
                <button type="button" class="btn btn-secondary removeElem" data-bs-dismiss="modal">
                    ${this.lang.getTranslation(["button", "close"])}</button>
                <button type="button" class="btn btn-success removeElem" id="confirm-profile-background-btn">
                    ${this.lang.getTranslation(["button", "set"])} ${this.lang.getTranslation(["user", "avatar"])}</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade removeElem" id="handleData" tabindex="-1" aria-labelledby="handleDataLabel"
    aria-hidden="true">
    <div class="modal-dialog removeElem">
        <div class="modal-content removeElem">
            <div class="modal-header removeElem">
                <h5 class="modal-title removeElem" id="handleDataLabel">
                    ${this.lang.getTranslation(["button", "handle"])} ${this.lang.getTranslation(["button", "data"])}
                </h5>
                <button type="button" class="btn-close removeElem" data-bs-dismiss="modal"
                    aria-label="Close"></button>
            </div>
            <div class="modal-body removeElem">
                <form class="removeElem">
                    <div class="mb-3 removeElem">
                        <button type="button" class="btn btn-success removeElem">
                            ${this.lang.getTranslation(["button", "send"])} ${this.lang.getTranslation(["button", "data"])}
                        </button>
                    </div>
                    <div class="mb-3 removeElem">
                        <button type="button" class="btn btn-warning removeElem" data-bs-toggle="modal"
                            data-bs-target="#confirmDeleteAccountModal">
                            ${this.lang.getTranslation(["button", "delete"])} ${this.lang.getTranslation(["user", "account"])}
                        </button>
                    </div>
                </form>
            </div>
            <div class="modal-footer removeElem">
                <button type="button" class="btn btn-secondary removeElem" data-bs-dismiss="modal">
                     ${this.lang.getTranslation(["button", "close"])}
                </button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade removeElem" id="handlePassword" tabindex="-1" aria-labelledby="handlePasswordLabel"
    aria-hidden="true">
    <div class="modal-dialog removeElem">
        <div class="modal-content removeElem">
            <div class="modal-header removeElem">
                <h5 class="modal-title removeElem" id="handlePasswordLabel">
                    ${this.lang.getTranslation(["button", "change"])} ${this.lang.getTranslation(["input", "label", "password"])}
                </h5>
                <button type="button" class="btn-close removeElem" data-bs-dismiss="modal"
                    aria-label="Close"></button>
            </div>
            <div class="modal-body removeElem">
                <form class="removeElem">
                    <div class="mb-3 removeElem">
                        <label for="old-password-settings" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "old"])} ${this.lang.getTranslation(["input", "label", "password"])}:</label>
                        <input type="password" class="form-control removeElem" name="oldPassword" id="old-password-settings" autocomplete="off" />
                        <div id="oldPassError" class="removeElem"></div>
                    </div>
                    <div class="mb-3 removeElem">
                        <label for="new-password-settings" class="form-label removeElem">${this.lang.getTranslation(["input", "label", "new"])} ${this.lang.getTranslation(["input", "label", "password"])}:</label>
                        <input type="password" class="form-control removeElem" name="newPassword" id="new-password-settings" autocomplete="off"/>
                        <div id="newPassError" class="removeElem"></div>
                    </div>
                    <div class="mb-3 removeElem">
                        <label for="confirm-new-password-settings" class="form-label removeElem">
                            ${this.lang.getTranslation(["input", "label", "confirm"])} ${this.lang.getTranslation(["input", "label", "new"])} ${this.lang.getTranslation(["input", "label", "password"])}:</label>
                        <input type="password" class="form-control removeElem" name="confirmPassword" id="confirm-new-password-settings" autocomplete="off" />
                        <div id="confirmPassError" class="removeElem"></div>
                    </div>
                </form>
            </div>
            <div class="modal-footer removeElem">
                <button type="button" class="btn btn-secondary removeElem" data-bs-dismiss="modal">
                    ${this.lang.getTranslation(["button", "close"])}
                </button>
                <button type="button" class="btn btn-success removeElem" id="confirm-changes-password-btn">
                    ${this.lang.getTranslation(["input", "label", "confirm"])}
                </button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="handleEmail" tabindex="-1" aria-labelledby="handleEmailLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="handleEmailLabel">
          ${this.lang.getTranslation(["button", "change"])} ${this.lang.getTranslation(["input", "label", "email"])}
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form>
          <div class="mb-3">
            <label for="email-old" class="form-label">${this.lang.getTranslation(["input", "label", "old"])} ${this.lang.getTranslation(["input", "label", "email"])}:</label>
            <input type="email" class="form-control" id="email-old" name="oldMail" value="" />
            <div id="oldMailError"></div>
          </div>
          <div class="mb-3">
            <label for="email-new" class="form-label">${this.lang.getTranslation(["input", "label", "new"])} ${this.lang.getTranslation(["input", "label", "email"])}:</label>
            <input type="email" class="form-control" id="email-new" name="mailChange" value="" />
            <div id="newMailError"></div>
          </div>
          <div class="mb-3">
            <label for="email-confirm" class="form-label">${this.lang.getTranslation(["input", "label", "confirm"])} ${this.lang.getTranslation(["input", "label", "email"])}:</label>
            <input type="email" class="form-control" id="email-confirm" name="checkMail" value="" />
            <div id="confirmMailError"></div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          ${this.lang.getTranslation(["button", "close"])}
        </button>
        <button type="button" class="btn btn-success" id="confirmChangesMail">
          ${this.lang.getTranslation(["input", "label", "confirm"])}
        </button>
      </div>
    </div>
</div>
`;
    // const previous = `<input type="file" class="form-control removeElem" accept="image/*" id="uploadProfileBackground">`;
    return htmlContent;
  }

  appendAvatar(mainDiv, imageUrl) {
    const avatar = document.createElement("div");
    avatar.innerHTML = `<div class="col-4 removeElem">
        <img src=${imageUrl} class="img-fluid rounded border removeElem" alt="Background 1"
            style="cursor: pointer;">
    </div>`;
    mainDiv.appendChild(avatar);
  }

  async getCurrentAvatar() {
    try {
      const username = sessionStorage.getItem("username_transcendence");
      const request = await this.makeRequest(`api/users/${username}`, "GET");
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const data = await response.json();
        return data.profilePic;
      }
      return "";
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }

  async getDefaultAvatar(currentAvatar) {
    try {
      const defaultAvatarMainDiv = document.createElement("div");
      defaultAvatarMainDiv.classList.add("removeElem", "row");
      const request = await this.makeRequest("api/avatars/", "GET");
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const data = await response.json();
        let length = data.length;
        for (let count = 0; count < length; count++) {
          this.appendAvatar(defaultAvatarMainDiv, data[count]);
        }
        if (!currentAvatar.includes("/media/default_avatars/"))
          this.appendAvatar(defaultAvatarMainDiv, currentAvatar);
        return defaultAvatarMainDiv;
      }
      return "";
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
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
      if (await this.handleStatus(response)) {
        showModal(
          `${this.lang.getTranslation(["modal", "title", "success"])}`,
          `${this.lang.getTranslation(["user", "your"])} ${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["modal", "message", "successChange"])}`,
        );
        sessionStorage.setItem("username_transcendence", newUsername);
        console.log("response", response);
        const data = await response.json();
        setSessionStorage(data, newUsername);
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async checkoldMail(mailTocheck) {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest("/api/auth/" + username, "GET");
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const data = await response.json();
        console.log(
          "old mail = " + data.email + "oldMail == data.mail :",
          data.email == mailTocheck,
        );
        return data.email == mailTocheck;
      } else {
        removeSessionStorage();
        throw new CustomError(
          `${this.lang.getTranslation(["modal", "title", "error"])}`,
          `${this.lang.getTranslation(["modal", "message", "authError"])}`,
          "/login",
        );
      }
    } catch (error) {
      this.handleCatch(error);
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
      if (await this.handleStatus(response)) {
        const modalPasswordDiv = document.querySelector("#handlePassword");
        const modalPassword = bootstrap.Modal.getInstance(modalPasswordDiv);
        modalPassword.hide();
        showModal(
          `${this.lang.getTranslation(["modal", "title", "success"])}`,
          `${this.lang.getTranslation(["user", "your"])} ${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["modal", "message", "successChange"])}`,
        );
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async changeMail(oldMail, newMail) {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      await this.checkoldMail(oldMail);
      const request = await this.makeRequest(
        "/api/auth/update/" + username,
        "PATCH",
        {
          email: newMail,
        },
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const modalEmailDiv = document.querySelector("#handleEmail");
        const modalEmail = bootstrap.Modal.getInstance(modalEmailDiv);
        modalEmail.hide();
        showModal(
          `${this.lang.getTranslation(["modal", "title", "success"])}`,
          `${this.lang.getTranslation(["user", "your"])} ${this.lang.getTranslation(["input", "label", "email"])} ${this.lang.getTranslation(["modal", "message", "successChange"])}`,
        );
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async deleteAccount() {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest(
        `/api/auth/delete/${username}/`,
        "DELETE",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        removeSessionStorage();
        this.cleanModal();
        throw new CustomError(
          `${this.lang.getTranslation(["modal", "title", "success"])}`,
          `${this.lang.getTranslation(["modal", "message", "successDeleteAccount"])}`,
          "/",
        );
      }
    } catch (error) {
      this.handleCatch(error);
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
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      }
    }
  }

  validatePassword(passwordInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#newPassError");
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

  validatePasswordMatch(passwordInput, password2Input) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#confirmPassError");
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

  validateMail(mailInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#newMailError");
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

  validateConfirmMail(mailInput, confirmMailInput) {
    let errorMessage = "";
    const errorDiv = document.querySelector("#confirmMailError");
    errorDiv.innerHTML = "";
    if (mailInput.value.trim() === "") {
      errorMessage = `${this.lang.getTranslation(["input", "label", "email"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
    } else if (!this.sanitizeInput(mailInput.value)) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "email"])} ${this.lang.getTranslation(["input", "error", "invalidChar"])}`;
    } else if (mailInput.value != confirmMailInput.value) {
      errorMessage = `${this.lang.getTranslation(["input", "label", "email"])} ${this.lang.getTranslation(["input", "error", "match"])}`;
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
    this.validatePasswordMatch(newPasswordInput, confirmPasswordInput);
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
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
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
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      }
    }
  }

  handleInputMail(ev) {
    ev.preventDefault();
    const newMail = document.querySelector("#email-new");
    const confirmMail = document.querySelector("#email-confirm");
    this.validateMail(newMail);
    this.validateConfirmMail(newMail, confirmMail);
  }
  // const formData = new FormData();
  //     formData.append('image', file); // Append the file to the form data
  //
  //     try {
  //         // Make a POST request to the API
  //         const response = await fetch('https://your-api-endpoint.com/upload', {
  //             method: 'POST',
  //             body: formData, // Send the FormData object with the file
  //         });
  //
  //         if (response.ok) {
  //             const result = await response.json();
  //             alert('Image uploaded successfully!');
  //             console.log(result); // Handle the response from the server
  //         } else {
  //             alert('Failed to upload image!');
  //             console.error(response.statusText);
  //         }
  async handleUploadAvatar(ev) {
    ev.preventDefault();
    // if (this.validateAvatar()) return;
    try {
      const fileInput = document.getElementById("uploadProfileBackground");
      const file = fileInput.files[0]; // Get the selected file
      if (!file) return;
      const formData = new FormData();
      formData.append("avatar", file);
      const request = await this.makeRequest(
        `/api/avatars/`,
        "POST",
        formData,
        true,
      );
      const response = await fetch(request);
      if (response.ok) {
        console.log("RESPONSE OK:", response);
        const data = await response.json();
        console.log("DATA: ", data);
        showModal(
          this.lang.getTranslation(["modal", "title", "success"]),
          `${this.lang.getTranslation(["user", "your"])} ${this.lang.getTranslation(["user", "avatar"])} ${this.lang.getTranslation(["modal", "message", "changeSuccess"])} `,
        );
        navigateTo("/settings");
      } else {
        console.log("RESPONSE FAIL:", response);
        const data = await this.getErrorLogfromServer(response);
        showModal(this.lang.getTranslation(["modal", "error"]), data);
        console.log("DATA: ", data);
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.log("Error", error);
        showModal("ERROR", error.message);
      }
    }
  }

  getUrlImage(divImage) {
    const divImageStyle = window
      .getComputedStyle(divImage)
      .getPropertyValue("background-image");
    const urlPattern = /url\(["']?([^"']*)["']?\)/;
    const matches = divImageStyle.match(urlPattern);
    if (matches && matches[1]) {
      return matches[1];
    } else return null;
  }

  async changeProfilePic(ev) {
    ev.preventDefault();
    try {
      const profileChosen = document.querySelector(
        "#currentProfileBackgroundPreview",
      );
      const chosenImageUrl = this.getUrlImage(profileChosen);
      const currentProfile = document.querySelector(
        "#currentProfileBackground",
      );
      const currentImageUrl = this.getUrlImage(currentProfile);
      console.log(`currentImageUrl=${currentImageUrl}
    chosenImageUrl=${chosenImageUrl}`);
      if (currentImageUrl === chosenImageUrl) {
        showModal(
          this.lang.getTranslation(["modal", "error"]),
          this.lang.getTranslation(["settings", "Background", "already"]),
        );
        return;
      }
      const username = sessionStorage.getItem("username_transcendence");
      console.log(
        "body request:",
        JSON.stringify(`{profile_pic: ${chosenImageUrl}}`),
      );
      const request = await this.makeRequest(
        `/api/users/${username}/default_pic/`,
        "PATCH",
        { profile_pic: `${chosenImageUrl}` },
      );
      const response = await fetch(request);
      if (response.ok) {
        showModal(
          this.lang.getTranslation(["modal", "success"]),
          this.lang.getTranslation(["settings", "Background", "changeSuccess"]),
        );
        navigateTo("/settings");
      } else {
        console.log("Request", request);
        console.log("Response:", response);
        const dataError = this.getErrorLogfromServer(response);
        console.log("dataError", dataError);
        showModal(this.lang.getTranslation(["modal", "error"]), dataError);
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        showModal(this.lang.getTranslation(["modal", "error"]), error.message);
        console.error("ChangeProfilePic: ", error);
      }
    }
  }

  showFileUpload(ev) {
    const fileInput = document.getElementById("uploadProfileBackground");
    const fileChosen = document.getElementById("file-chosen");

    if (fileInput.files.length > 0) {
      fileChosen.textContent = fileInput.files[0].name;
    } else {
      fileChosen.textContent = this.lang.getTranslation([
        "settings",
        "Background",
        "noFile",
      ]);
    }
  }

  handleSaveLanguage(ev) {
    ev.preventDefault();
    const chosenLanguage = document.querySelector("#language").value;
    if (chosenLanguage != sessionStorage.getItem("transcendence_language")) {
      sessionStorage.setItem("transcendence_language", chosenLanguage);
      navigateTo("/settings");
    }
  }

  async handleDeleteAccount(ev) {
    ev.preventDefault();
    try {
      await this.deleteAccount();
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      }
    }
  }

  async addEventListeners() {
    const usernameInput = document.querySelector("#username-settings");
    if (usernameInput)
      usernameInput.addEventListener("input", this.handleInputUsername);

    const button = document.querySelector("#changeUsername");
    if (button) button.addEventListener("click", this.handleChangeUsername);

    const buttonPass = document.querySelector("#confirm-changes-password-btn");
    if (buttonPass)
      buttonPass.addEventListener("click", this.handleChangePassword);

    const passwordInput = document.querySelector("#new-password-settings");
    if (passwordInput)
      passwordInput.addEventListener("input", this.handleInputNewPassword);

    const confirmPasswordInput = document.querySelector(
      "#confirm-new-password-settings",
    );
    if (confirmPasswordInput)
      confirmPasswordInput.addEventListener(
        "input",
        this.handleInputNewPassword,
      );

    const newMailInput = document.querySelector("#email-new");
    if (newMailInput)
      newMailInput.addEventListener("input", this.handleInputMail);

    const confirmMailInput = document.querySelector("#email-confirm");
    if (confirmMailInput)
      confirmMailInput.addEventListener("input", this.handleInputMail);

    const buttonMail = document.querySelector("#confirmChangesMail");
    if (buttonMail) buttonMail.addEventListener("click", this.handleChangeMail);

    const changeProfilePic = document.querySelector(
      "#confirm-profile-background-btn",
    );
    if (changeProfilePic)
      changeProfilePic.addEventListener("click", this.changeProfilePic);

    const uploadFile = document.querySelector("#uploadButton");
    if (uploadFile)
      uploadFile.addEventListener("click", this.handleUploadAvatar);

    const fileInput = document.getElementById("uploadProfileBackground");
    if (fileInput) fileInput.addEventListener("change", this.showFileUpload);

    const saveLanguage = document.querySelector("#saveLanguageButton");
    if (saveLanguage)
      saveLanguage.addEventListener("click", this.handleSaveLanguage);

    const deleteAccountButton = document.querySelector(
      "#confirmDeleteAccountBtn",
    );
    if (deleteAccountButton)
      deleteAccountButton.addEventListener("click", this.handleDeleteAccount);

    const openDeleteAccountModalButton = document.querySelector(".btn-warning");
    if (openDeleteAccountModalButton) {
      openDeleteAccountModalButton.addEventListener("click", (ev) => {
        ev.preventDefault();
        console.debug("Delete Account button pressed!");
      });
    }
    const images = document.querySelectorAll(".img-fluid");
    if (images) {
      images.forEach((img) => {
        img.addEventListener("click", (event) => {
          this.selectProfileBackground(img.src, img); // Call the method using 'this'
        });
      });
    }

    const emailModalButton = document.getElementById("emailModalButton");
    if (emailModalButton)
      emailModalButton.addEventListener(
        "click",
        this.handleShowEmailModal.bind(this),
      );
  }

  handleShowEmailModal(ev) {
    ev.preventDefault();
    const modalId = document.getElementById("handleEmail");
    console.log(modalId);
    let inviteModal = bootstrap.Modal.getInstance(modalId);
    if (!inviteModal) inviteModal = new bootstrap.Modal(modalId);
    inviteModal.show();
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
