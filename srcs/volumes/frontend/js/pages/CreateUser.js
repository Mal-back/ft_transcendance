import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Create new user");
  }

  async loadCss() {
    this.createPageCss("../css/create-user.css");
  }

  async getHtml() {
    return `
      <div class="background">
        <div class="p-5 bg-*">
            <div class="black-txt bg-form create-user-form p-4">
                <h1 class="mb-3 text-center create-user-title text-decoration-underline">Create User</h1>
                <form id="createUser">
                    <div class="form-group">
                        <label for="Username">Username:</label>
                        <input class="form-control" name="Username" id="Username" type="text">
                    </div>
                    <br>
                    <div class="form-group">
                        <label for="Mail">Mail:</label>
                        <input class="form-control" name="Mail" id="Mail" type="text">
                    </div>
                    <br>
                    <div class="form-group">
                        <label for="Password">${getlanguage(userLanguage, Password)}</label>
                        <input class="form-control" name="Password" id="Password" type="password">
                    </div>
                    <br>
                    <div class="form-group">
                        <label for="Password-2">Password 2</label>
                        <input class="form-control" name="Password-2" id="Password-2" type="password">
                    </div>
                    <br>
                    <button id="createUserButton" type="submit" class="btn bg-silver">Create New Profile</button>
                    <br>
                    <br>
                </form>
            </div>
            <div class="d-flex justify-content-center mt-3">
                <button type="button" class="btn bg-blue login42-create white-txt">42 Connect</button>
            </div>
        </div>
      </div>
            `;
  }

  async submitNewUser() {
    const createUser = document.querySelector("#createUser");

    const username = createUser.querySelector("input[name='Username']").value;
    const email = createUser.querySelector("input[name='Mail']").value;
    const password = createUser.querySelector("input[name='Password']").value;
    const password2 = createUser.querySelector(
      "input[name='Password-2']",
    ).value;

    if (this.sanitizeInput([username, email, password, password2]) == false)
      return;
    console.debug("trying fetch");
    try {
      const request = await this.makeRequest("/api/auth/", "POST", {
        username: username,
        password: password,
        password2: password2,
        email: email,
        two_fa_enable: false,
      });
      const response = await fetch(request);

      if (response.ok) {
        this.showModalWithError(
          "Account creation",
          "New account successfuly created",
        );
        navigateTo("/login");
      } else {
        const log = await this.getErrorLogfromServer(response);
        this.showModalWithError(
          "Error",
          `${log || "Submission failed."}`,
        );
        console.debug("Server response:", log);
      }
    } catch (error) {
      console.error("Error in Request:", error.message);
      this.showModalWithError(
        "Error",
        "Unable to connect to the server, please wait",
      );
      navigateTo("/");
      // throw new Error("Redirect to /home, server is dead, good luck");
    }
  }

  async addEventListeners() {
    const button = document.querySelector("#createUserButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Submit button clicked!");
        try {
          await this.submitNewUser();
        } catch (error) {
          console.error("Caught in Event Listener:", error.message);
        }
      });
    }
  }

  removeEventListeners() {
    const button = document.querySelector("#createUserButton");
    if (button) {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.loginEvent);
    }
    document.querySelectorAll('[data-link="view"]').forEach((button) => {
      console.info("removing event click on button : " + button.innerText);
      button.removeEventListener("click", this.handleClick);
    });
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
