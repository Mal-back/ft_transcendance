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
                    <button id="loginbutton" type="submit" class="btn bg-silver">Login</button>
                    <br>
                    <br>
                </form>
            </div>
            <div class="d-flex justify-content-center mt-3">
                <button type="button" class="btn bg-blue login42 white-txt">42 Connect</button>
            </div>
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
    const button = document.querySelector("#loginButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Submit button clicked!");
        await this.login();
      });
    }
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  async log() {
    console.log("cookie=" + document.cookie);
    const authToken = this.getCookie("authToken");
    console.debug("Auth token from cookie:", authToken);
    // fetch("/api/auth/" + username);
  }

  async login() {
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

        console.debug("size of result ", data.length);
        console.debug("RESULT=", data);
        const token = data.access;
        const expires = new Date();
        expires.setTime(expires.getTime() + 5 * 60 * 1000);
        // document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; samesite=none`;
        document.getElementById("result").innerHTML = "Successful login";
        console.debug("Successful login");
        const testLogin = await this.log();
      } else {
        document.getElementById("result").innerHTML =
          "Invalid Login, please try again";
      }
    } catch (error) {
      console.error("Error submitting from login: ", error);
    }
  }
}
