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
    <div class="background">
    <div class="Profile container">
        <div class="container mt-4">
            <h1>${this.lang.getTranslation(["settings", "settingsLabel"])}</h1>
            <form>
                <!-- USERNAME -->
                <div class="mb-3">
                    <label for="username-settings" class="form-label">${this.lang.getTranslation(["settings", "Username", "label"])}</label>
                    <input type="text" class="form-control" id="username-settings" name="UsernameChange" value="${sessionStorage.getItem("username_transcendence")}">
                    <button id="changeUsername" type="button" class="btn btn-success custom-button">
                        ${this.lang.getTranslation(["settings", "Username", "saveButton"])}
                    </button>
                </div>
                <!-- PROFILE BACKGROUND SECTION -->
                <div class="mb-3">
                    <label for="uploadProfileBackground" class="form-label">${this.lang.getTranslation(["settings", "Background", "label"])}</label>
                    <div id="currentProfileBackground" class="rounded mb-3 Avatar"
                        style="background-image: url(../../img/ts/TTPD.jpeg);">
                    </div>
                    <button type="button" class="btn btn-secondary" data-bs-toggle="modal"
                        data-bs-target="#changeProfileBackground">${this.lang.getTranslation(["settings", "Background", "changeButton"])}</button>
                </div>
                <!-- MAIL HANDLER -->
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <br />
                    <button type="button" id="email" class="btn btn-secondary" data-bs-toggle="modal"
                        data-bs-target="#handleEmail">
                        ${this.lang.getTranslation(["settings", "Email", "buttonLabel"])}
                    </button>
                </div>
                <div class="modal fade" id="handleEmail" tabindex="-1" aria-labelledby="handleEmailLabel"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="handleEmailLabel">
                                    ${this.lang.getTranslation(["settings", "Email", "changeButton"])}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form>

                                    <div class="mb-3">
                                        <label for="email-old" class="form-label" >${this.lang.getTranslation(["settings", "Email", "modalFields", "OldEmail"])}</label>
                                        <input type="email" class="form-control" id="email-old" name="oldMail" value="old-email@google.com">
                                    </div>

                                    <div class="mb-3">
                                        <label for="email-new" class="form-label">${this.lang.getTranslation(["settings", "Email", "modalFields", "NewEmail"])}</label>
                                        <input type="email" class="form-control" id="email-new" name="mailChange" value="new-email@google.com">
                                    </div>

                                    <div class="mb-3">
                                        <label for="email-confirm" class="form-label">${this.lang.getTranslation(["settings", "Email", "modalFields", "ConfirmNewEmail"])}</label>
                                        <input type="email" class="form-control" id="email-confirm" name="checkMail" value="new-email@google.com">
                                    </div>

                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Close"])}
                                </button>
                                <button type="button" class="btn btn-success" id="confirmChangesMail">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Confirm"])}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PASSWORD -->
                <div class="mb-3">
                    <label for="password-label" class="form-label">Password</label>
                    <br />
                    <button type="button" id="password-label" class="btn btn-secondary" data-bs-toggle="modal"
                        data-bs-target="#handlePassword">
                        ${this.lang.getTranslation(["settings", "Password", "buttonLabel"])}
                    </button>
                </div>
                <div class="modal fade" id="handlePassword" tabindex="-1" aria-labelledby="handlePasswordLabel"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="handlePasswordLabel">
                                    ${this.lang.getTranslation(["settings", "Password", "changeButton"])}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="mb-3">
                                        <label for="old-password-settings" class="form-label">${this.lang.getTranslation(["settings", "Password", "modalFields", "old"])}</label>
                                        <input type="password" class="form-control" name="oldPassword" id="old-password-settings" />
                                    </div>
                                    <div class="mb-3">
                                        <label for="new-password-settings" class="form-label">${this.lang.getTranslation(["settings", "Password", "modalFields", "new"])}</label>
                                        <input type="password" class="form-control" name="newPassword" id="new-password-settings" />
                                    </div>
                                    <div class="mb-3">
                                        <label for="confirm-new-password-settings" class="form-label">
                                            ${this.lang.getTranslation(["settings", "Password", "modalFields", "confirm"])}</label>
                                        <input type="password" class="form-control" name="confirmPassword" id="confirm-new-password-settings" />
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Close"])}
                                </button>
                                <button type="button" class="btn btn-success" id="confirm-changes-password-btn">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Confirm"])}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LANGUAGE -->
                <div class="mb-3">
                    <label for="language" class="form-label">${this.lang.getTranslation(["settings", "Language", "label"])}</label>
                    <select class="form-select" id="language">
                        <option selected>English</option>
                        <option value="1">Spanish</option>
                        <option value="2">French</option>
                    </select>
                    <button type="button" class="btn btn-success custom-button">
                        ${this.lang.getTranslation(["settings", "Language", "saveButton"])}
                    </button>
                </div>

                <!-- DATA HANDLER -->
                <!-- <br> -->
                <div class="mb-3">
                    <button type="button" class="btn btn-info white-txt" data-bs-toggle="modal"
                        data-bs-target="#handleData">
                        ${this.lang.getTranslation(["settings", "DataHandler", "buttonLabel"])}
                    </button>
                </div>
                <!-- <br> -->
                <div class="modal fade" id="handleData" tabindex="-1" aria-labelledby="handleDataLabel"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="handleDataLabel">
                                    ${this.lang.getTranslation(["settings", "DataHandler", "buttonLabel"])}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="mb-3">
                                        <button type="button" class="btn btn-success">
                                            ${this.lang.getTranslation(["settings", "DataHandler", "modalFields", "send"])}
                                        </button>
                                    </div>
                                    <div class="mb-3">
                                        <button type="button" class="btn btn-warning" data-bs-toggle="modal"
                                            data-bs-target="#confirmDeleteAccountModal">
                                            ${this.lang.getTranslation(["settings", "DataHandler", "modalFields", "deleteAccount"])}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    ${this.lang.getTranslation(["settings", "modalButtons", "Close"])}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Delete Account Modal -->
                <div class="modal fade" id="confirmDeleteAccountModal" tabindex="-1" aria-labelledby="confirmDeleteAccountModalLabel" aria-hidden="true">
                     <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="confirmDeleteAccountModalLabel">${this.lang.getTranslation(["settings", "DataHandler", "modalFields", "confirmDeleteAccount"])}</h5>
                               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>${this.lang.getTranslation(["settings", "DataHandler", "modalFields", "questionDeleteAccount"])}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.lang.getTranslation(["settings", "modalButtons", "Cancel"])}</button>
                                <button type="button" class="btn btn-danger" id="confirmDeleteAccountBtn">${this.lang.getTranslation(["settings", "DataHandler", "modalFields", "deleteAccount"])}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
<div class="modal fade" id="changeProfileBackground" tabindex="-1" aria-labelledby="changeProfileBackgroundLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="changeProfileBackgroundLabel">${this.lang.getTranslation(["settings", "Background", "select"])}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Current Profile Background Display -->
                <div class="mb-3">
                    <h6>${this.lang.getTranslation(["settings", "Background", "current"])}</h6>
                    <div id="currentProfileBackgroundPreview" class="rounded"
                        style="width: 11vh; height: 11vh; background-size: cover; background-position: center; background-image: url(../../img/ts/TTPD.jpeg);">
                    </div>
                </div>

                <!-- Choose a Profile Background -->
                <div class="mb-3">
                    <h6>${this.lang.getTranslation(["settings", "Background", "current"])}</h6>
                    <div class="row">
                        <div class="col-4">
                            <img src="../../img/ts/TTPD.jpeg" class="img-fluid rounded border " alt="Background 1"
                                style="cursor: pointer;"
                                >
                        </div>
                        <div class="col-4">
                            <img src="../../img/ts/RED.jpeg" class="img-fluid rounded border" alt="Background 2"
                                style="cursor: pointer;"
                                >
                        </div>
                        <div class="col-4">
                            <img src="../../img/ts/MIDNIGHTS.jpeg" class="img-fluid rounded border" alt="Background 3"
                                style="cursor: pointer;"
                                >
                        </div>
                        <div class="col-4">
                            <img src="../../img/ts/EVERMORE.jpeg" class="img-fluid rounded border" alt="Background 4"
                                style="cursor: pointer;"
                                >
                        </div>
                    </div>
                </div>

                <!-- Upload Your Own Profile Background -->
                <div class="mb-3">
                    <h6>${this.lang.getTranslation(["settings", "Background", "upload"])}</h6>
                    <input type="file" class="form-control" accept="image/*" id="uploadProfileBackground">
                    <button type="button" class="btn btn-success">Upload</button>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    ${this.lang.getTranslation(["settings", "modalButtons", "Close"])}</button>
                <button type="button" class="btn btn-success" id="confirm-profile-background-btn">
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
        showModal("Success", "Username change succesfuly");
        sessionStorage.setItem("username_transcendence", newUsername);
        console.log("rsponse", response);
        const data = await response.json();
        setSessionStorage(data, newUsername);
      } else {
        const log = await this.getErrorLogfromServer(response);
        console.log(log);
        showModal("Error", log);
      }
    } catch (error) {
      console.error("Error in changeUsername Request");
      showModal("Error", error.message);
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
        navigateTo("/login");
        this.showModalWithError(
          "Error",
          "Authentification error, re-login please",
        );
      }
    } catch (error) {
      console.error("Error in checkoldMail:", error);
      throw error;
    }
  }

  async changePassword() {
    const username = sessionStorage.getItem("username_transcendence");
    const oldPassword = document.querySelector(
      "input[name='oldPassword']",
    ).value;
    const newPassword = document.querySelector(
      "input[name='newPassword']",
    ).value;
    const confirmPassword = document.querySelector(
      "input[name='confirmPassword']",
    ).value;
    // if (
    // this.sanitizeInput([newPassword, oldPassword, confirmPassword]) == false
    // ) {
    // return;
    // }
    if (newPassword != confirmPassword) {
      this.showModalWithError(
        "Error",
        "New password and its confirmation do not match",
      );
      return false;
    }
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
        this.showModalWithError("Success", "Password change succesfuly");
        console.log("response", response);
        // const data = await response.json();
        // console.log("data after change =", data);
      } else {
        const logError = await this.getErrorLogfromServer(response);
        this.showModalWithError("Error", logError);
      }
    } catch (error) {
      this.showModalWithError("Error", error.message);
      throw error;
    }
  }

  async changeMail() {
    const username = sessionStorage.getItem("username_transcendence");
    const oldMail = document.querySelector("input[name='oldMail']").value;
    const newMail = document.querySelector("input[name='mailChange']").value;
    const checkMail = document.querySelector("input[name='checkMail']").value;
    if (this.sanitizeInput([newMail, oldMail, checkMail]) == false) {
      return;
    }
    console.log("newMail = ", newMail);
    if (newMail != checkMail) {
      this.showModalWithError(
        "Error",
        "New e-mail and its confirmation do not match",
      );
      return false;
    }
    // try {
    //     if ((await this.checkoldMail(oldMail)) == false) {
    //         this.showModalWithError("Error", "Incorrect old E-mail address");
    //         return;
    //     }
    // } catch (error) {
    //     throw error;
    // }
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
        this.showModalWithError("Success", "E-mail change succesfuly");
        const data = await response.json();
        console.log("data after change =", data);
      } else {
        const dataError = await this.getErrorLogfromServer(response);
        this.showModalWithError("Error", dataError);
      }
    } catch (error) {
      console.error("Error in changeMail Request");
      this.showModalWithError("Error", error.message);
      throw error;
    }
  }

  async deleteAccount() {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest(
        `/api/auth/delete/${username}`, // Assuming this is your delete endpoint
        "DELETE",
      );
      const response = await fetch(request);
      if (response.ok) {
        removeSessionStorage();
        this.cleanModal();
        this.showModalWithError("Success", "Account successfully deleted.");

        navigateTo("/"); // Navigate the user back to login after account deletion
        // window.location.href = "/";
      } else {
        const dataError = await response.json();
        this.showModalWithError("Error", dataError);
      }
    } catch (error) {
      console.error("Error during account deletion request:", error);
      this.showModalWithError("Error", error.message);
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
  async addEventListeners() {
    try {
      const button = document.querySelector("#changeUsername");
      if (button) {
        button.addEventListener("click", async (ev) => {
          ev.preventDefault();
          console.debug("Submit button clicked!");
          try {
            await this.changeUsername();
          } catch (error) {
            console.error("Caught in Event Listener:", error.message);
          }
        });
      }
      const buttonMail = document.querySelector("#confirmChangesMail");
      if (buttonMail) {
        buttonMail.addEventListener("click", async (ev) => {
          ev.preventDefault();
          console.debug("Submit button clicked!");
          try {
            await this.changeMail();
          } catch (error) {
            console.error("error: ", error.message);
            // throw error;
          }
        });
      }
      const buttonPass = document.querySelector(
        "#confirm-changes-password-btn",
      );
      if (buttonPass) {
        buttonPass.addEventListener("click", async (ev) => {
          console.log("change password button pressed");
          ev.preventDefault();
          try {
            await this.changePassword();
          } catch (error) {
            console.error("error: ", error.message);
          }
        });
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

      const openDeleteAccountModalButton =
        document.querySelector(".btn-warning"); // Assuming the "Delete Account" button is the warning button
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
    } catch (error) {
      throw error;
    }
  }

  removeEventListeners() {
    const changeUsernameButton = document.querySelector("#changeUsername");
    if (changeUsernameButton) {
      changeUsernameButton.removeEventListener("click", this.changeUsername);
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
// const confirmButton = document.getElementById('confirm-profile-background-btn');
// if (confirmButton) {
//     confirmButton.addEventListener('click', () => {
//         if (this.selectedBackground) { // Use 'this.selectedBackground'
//             document.getElementById('currentProfileBackground').style.backgroundImage = `url(${this.selectedBackground})`;
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
//                 document.getElementById('currentProfileBackgroundPreview').style.backgroundImage = `url(${this.selectedBackground})`;
//             };
//             reader.readAsDataURL(file);
//         }
//     });
// }
