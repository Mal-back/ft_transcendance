import { navigateTo } from "../router.js";
import { removeSessionStorage, setSessionStorage } from "./Utils.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Login");
  }

  async getHtml() {
    const username = sessionStorage.getItem("username_transcendance");
    if (username) {
      const loginOverlay = document.querySelector("#overlayLogin");
      loginOverlay.innerText = "Logout";
      loginOverlay.href = "/logout";
      navigateTo("/");
      throw new Error("Redirect to Home, User already logged in");
    }
    return `
                <div class="background">
                    <div class="p-5 bg-*">
                        <div class="black-txt bg-form login-form p-4">
                            <h1 class="mb-3 text-center login-title text-decoration-underline">
                                Login
                            </h1>
                            <form id="loginForm">
                                <div class="form-group">
                                    <label for="Username">Username:</label>
                                    <input class="form-control" name="Username" type="text" />
                                </div>
                                <br />
                                <div class="form-group">
                                    <label for="Password">Password</label>
                                    <input class="form-control" name="Password" type="password" />
                                </div>
                                <br />
                                <button id="loginButton" type="submit" class="btn bg-silver">Login</button>
                                <br />
                                <br />
                            </form>
                        </div>
                        <div class="d-flex justify-content-center mt-3">
                            <a id="createUser" type="button" class="btn bg-blue login42 white-txt me-2" href="/createUser" data-link="view">Create New User
                            </a>
                            <a type="button" class="btn bg-blue login42 white-txt">
                                42 Connect
                            </a>
                        </div>
                    </div>
                </div>

          `;
  }

  async loadCss() {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "../css/login.css";
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);
    console.log("adding login.css");
  }

  async loginEvent(ev) {
    ev.preventDefault();
    console.debug("Submit button clicked");
    await this.login();
  }

  async addEventListeners() {
    console.log("adding event addEventListeners");
    const button = document.querySelector("#loginButton");
    if (button) {
      button.addEventListener("click", (ev) => this.loginEvent(ev));
    }
  }

  async login() {
    console.log("login");
    const loginForm = document.querySelector("#loginForm");
    const nameForm = loginForm.querySelector("input[name='Username']").value;
    const paswordForm = loginForm.querySelector("input[name='Password']").value;

    const whitelist = /^[a-zA-Z0-9_@.+-]*$/;
    if (!whitelist.test(nameForm)) {
      alert("Invalid characters ! Allowed: alphanumeric, +, -, ., _, @");
      return;
    }
    try {
      console.log("login before make request");
      const request = await this.makeRequest("/api/auth/login", "POST", {
        username: nameForm,
        password: paswordForm,
      });
      const response = await fetch(request);
      console.log("Response: ", response);
      if (response.ok) {
        console.log("login response.ok");
        const data = await response.json();
        setSessionStorage(data, nameForm);
        const loginOverlay = document.querySelector("#overlayLogin");
        loginOverlay.innerText = "Logout";
        loginOverlay.href = "/logout";
        navigateTo("/");
      } else {
        console.log("login response.notOk");
        const dataError = await response.json();
        console.log("Error in login: " + response.status + "; ", dataError);
      }
    } catch (Error) {
      console.error("Error fetching login:", Error.message);
    }
  }

  removeEventListeners() {
    const button = document.querySelector("#loginButton");
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
    this.removeEventListeners();
    this.removeCss();
  }
}

// async function log() {
//   const username = sessionStorage.getItem("username_transcendance");
//   console.log("trying to get info on " + username);
//
//   const authToken = sessionStorage.getItem("accessJWT_transcendance");
//   console.debug("Auth token from cookie:", authToken);
//
//   try {
//     const myHeaders = new Headers();
//     myHeaders.append("Authorization", "Bearer " + authToken);
//     const request = new Request("/api/auth/" + username, {
//       method: "GET",
//       headers: myHeaders,
//     });
//
//     const response = await fetch(request);
//     console.log("Successful fetch");
//     if (response.ok) {
//       console.log("response: ", response);
//       const data = response.text();
//       console.log("data: ", data);
//     } else {
//       const errorData = await response.test();
//       console.log("error in response: ", errorData);
//       removeSessionStorage();
//       navigateTo("/login");
//     }
//   } catch (error) {
//     console.error("Error logging, fetch on /api/auth/" + username);
//     console.error(error.message);
//   }
// }
