import AbstractView from "./AbstractViews.js";
import { navigateTo } from "../router.js";
import { removeSessionStorage, setSessionStorage } from "./Utils.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Settings");
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/background-profile.css");
    this.createPageCss("../css/buttons.css");
  }

  async getHtml() {
    return `
                  <div class="background">
                    <div class="Profile container">
                        <div class="container mt-4">
                            <h1>Settings</h1>
                            <form>
                                <!-- USERNAME -->
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="usernameChange" value="CurrentUsername" />
                                    <button id="changeUsername" type="button" class="btn btn-success custom-button">
                                        Save Username
                                    </button>
                                </div>

                                <!-- MAIL HANDLER -->
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <br />
                                    <button type="button" class="btn btn-secondary" data-bs-toggle="modal"
                                        data-bs-target="#handleEmail">
                                        Handle Email
                                    </button>
                                </div>
                                <div class="modal fade" id="handleEmail" tabindex="-1"
                                    aria-labelledby="handleEmailLabel" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="handleEmailLabel">
                                                    Change Mail
                                                </h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                    aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form>
                                                    <div class="mb-3">
                                                        <label for="email" class="form-label">Old Email</label>
                                                        <input type="email" class="form-control" id="email"
                                                            value="old-email@google.com" />
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="email" class="form-label">New Email</label>
                                                        <input type="email" class="form-control" id="email"
                                                            value="new-email@google.com" />
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="email" class="form-label">Confirm New Email</label>
                                                        <input type="email" class="form-control" id="email"
                                                            value="new-email@google.com" />
                                                    </div>
                                                </form>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                                    Close
                                                </button>
                                                <button type="button" class="btn btn-success"
                                                    id="confirm-changes-email-btn">
                                                    Confirm Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- PASSWORD -->
                                <div class="mb-3">
                                    <label for="password" class="form-label">Password</label>
                                    <br />
                                    <button type="button" class="btn btn-secondary" data-bs-toggle="modal"
                                        data-bs-target="#handlePassword">
                                        Handle Password
                                    </button>
                                </div>
                                <div class="modal fade" id="handlePassword" tabindex="-1"
                                    aria-labelledby="handlePasswordLabel" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="handlePasswordLabel">
                                                    Change password
                                                </h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                    aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form>
                                                    <div class="mb-3">
                                                        <label for="password" class="form-label">Old Password</label>
                                                        <input type="password" class="form-control"
                                                            id="old-password-settings" />
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="password" class="form-label">New Password</label>
                                                        <input type="password" class="form-control"
                                                            id="new-password-settings" />
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="password" class="form-label">Confirm New
                                                            Password</label>
                                                        <input type="password" class="form-control"
                                                            id="new-password-settings" />
                                                    </div>
                                                </form>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                                    Close
                                                </button>
                                                <button type="button" class="btn btn-success"
                                                    id="confirm-changes-password-btn">
                                                    Confirm Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- LANGUAGE -->
                                <div class="mb-3">
                                    <label for="language" class="form-label">Language</label>
                                    <select class="form-select" id="language">
                                        <option selected>English</option>
                                        <option value="1">Spanish</option>
                                        <option value="2">French</option>
                                    </select>
                                    <button type="button" class="btn btn-success custom-button">
                                        Save Language
                                    </button>
                                </div>

                                <!-- DATA HANDLER -->
                                <!-- <br> -->
                                <div class="mb-3">
                                    <button type="button" class="btn btn-info white-txt" data-bs-toggle="modal"
                                        data-bs-target="#handleData">
                                        Handle Data
                                    </button>
                                </div>
                                <!-- <br> -->
                                <button type="button" class="btn btn-success" data-bs-toggle="modal"
                                    data-bs-target="#alertInvalid">
                                    Save All Changes
                                </button>
                                <div class="modal fade" id="handleData" tabindex="-1" aria-labelledby="handleDataLabel"
                                    aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="handleDataLabel">
                                                    Handle Data
                                                </h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                    aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form>
                                                    <div class="mb-3">
                                                        <button type="button" class="btn btn-success">
                                                            Send All Data
                                                        </button>
                                                    </div>
                                                    <div class="mb-3">
                                                        <button type="button" class="btn btn-warning">
                                                            Delete Account
                                                        </button>
                                                    </div>
                                                    <div class="mb-3">
                                                        <button type="button" class="btn btn-danger">
                                                            Delete All Data
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            `;
  }

  async changeUsername() {
    const username = sessionStorage.getItem("username_transcendence");
    const newUsername = document.querySelector("#usernameChange");
    if (this.sanitizeInput([newUsername])) return;

    try {
      const request = await this.makeRequest(
        "/api/update/" + username,
        "PATCH",
        {
          username: newUsername,
        },
      );
      const response = await fetch(request);
      if (response.ok) {
        sessionStorage.setItem("username_transcendence", newUsername);
      } else {
        const dataError = await response.json();
        this.showModalWithError("Error");
      }
    } catch {}
  }

  async addEventListeners() {
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
  }

  removeEventListeners() {
    document.querySelectorAll('[data-link="view"]').forEach((button) => {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleClick);
    });
    const changeUsernameButton = document.querySelector("#changeUsername");
    if (changeUsernameButton) {
      changeUsernameButton.removeEventListener("click", this.changeUsername);
    }
  }

  removeCss() {
    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.remove();
    });
  }
  destroy() {
    this.removeEventListeners();
    this.removeCss();
  }
}
