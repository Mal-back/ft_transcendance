import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Login");
  }
  async getHtml() {
    return `
        <div class="p-5 bg-*">
            <div class="black-txt bg-form login-form p-4">
                <h1 class="mb-3 text-center login-title text-decoration-underline">Login</h1>
                <form id="login">
                    <div class="form-group">
                        <label for="Username">Username:</label>
                        <input class="form-control" name="Username" type="text">
                    </div>
                    <br>
                    <div class="form-group">
                        <label for="Password">Password</label>
                        <input class="form-control" name="Password" type="password">
                    </div>
                    <br>
                    <button id="loginButton" type="button" class="btn bg-silver">Login</button>
                    <br>
                    <br>
                </form>
            </div>
            <div class="d-flex justify-content-center mt-3">
                <button id="login42Button" type="button" class="btn bg-blue login42 white-txt">42 Connect</button>
            </div>
            <div class="background white-txt" id="loginResult"></div>
        </div>`;
  }

  async loadCss() {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "../css/login.css";
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);
  }

  async addEventListeners() {
    console.log("adding event addEventListeners");
    const button = document.querySelector("#loginButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Submit button clicked!");
        await this.login();
      });
    } else {
      console.error("fail to get event");
    }
  }

  async log() {
    const username = localStorage.getItem("username");
    console.log("trying to get info on " + username);

    const authToken = localStorage.getItem("accessJWT");
    console.debug("Auth token from cookie:", authToken);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", "Bearer " + authToken);
      const request = new Request("/api/auth/" + username, {
        method: "GET",
        headers: myHeaders,
      });

      const response = await fetch(request);
      console.log("Successful fetch");
      if (response.ok) {
        console.log("response: ", response);
        const data = response.json();
        conole.log("data: ", data);
      } else {
        const errorData = await response.json();
        console.log("error in response: ", errorData);
      }
    } catch {
      console.error("Error logging, fetch on /api/auth/" + username);
    }
  }

  async login() {
    console.log("login");
    const loginForm = document.querySelector("#login");
    const username = loginForm.querySelector("input[name='Username']").value;
    const password = loginForm.querySelector("input[name='Password']").value;

    const whitelist = /^[a-zA-Z0-9_@.+-]*$/;
    if (!whitelist.test(username)) {
      alert("Invalid characters ! Allowed: alphanumeric, +, -, ., _, @");
      return;
    }
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const myBody = JSON.stringify({
        username: username,
        password: password,
      });

      const request = new Request("/api/auth/login", {
        method: "POST",
        body: myBody,
        headers: myHeaders,
      });
      const response = await fetch(request);

      console.debug("Successful fetch login");
      if (response.ok) {
        console.debug("response:", response);
        const data = await response.json();

        const tokenAccess = data.access;
        localStorage.setItem("accessJWT", tokenAccess);
        const tokenRefresh = data.refresh;
        localStorage.setItem("refreshJWT", tokenRefresh);
        localStorage.setItem("username", username);
        document.getElementById("loginResult").innerHTML = "Successful login";
        console.debug("Successful login");
        // await this.log();
        navigateTo("/");
      } else {
        document.getElementById("result").innerHTML =
          "Invalid Login, please try again";
      }
    } catch (error) {
      console.error("Error submitting from login: ", error);
    }
  }
}
