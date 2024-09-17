import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Create new user");
  }

  async loadCss() {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "../css/create-user.css";
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);
  }

  async getHtml() {
    return `
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
                        <label for="Password">Password</label>
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
        <div id="createUserResult"></div>
        </div>
            `;
  }

  async submitNewUser() {
    const createUser = document.querySelector("#createUser");

    const username = createUser.querySelector("input[name='Username']").value;
    const whitelist = /^[a-zA-Z0-9_@.+-]*$/;
    const email = createUser.querySelector("input[name='Mail']").value;
    const password = createUser.querySelector("input[name='Password']").value;
    const password2 = createUser.querySelector(
      "input[name='Password-2']",
    ).value;

    if (!whitelist.test(username) || !whitelist.test(email)) {
      alert("Invalid characters ! Allowed: alphanumeric, +, -, ., _, @");
      return;
    }

    console.debug("trying fetch");
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const myBody = JSON.stringify({
        username: username,
        password: password,
        password2: password2,
        email: email,
        two_fa_enable: false,
      });

      const request = new Request("/api/auth/", {
        method: "POST",
        body: myBody,
        headers: myHeaders,
      });

      // console.debug("Method:", request.method); // GET, POST, etc.
      // console.debug("URL:", request.url); // The request URL
      // console.debug("Headers:", Array.from(request.headers.entries())); // All headers
      // console.debug("Body:", myBody); // Whether the body has been read yet
      // console.debug("Mode:", request.mode); // 'cors', 'no-cors', 'same-origin'
      // console.debug("Credentials:", request.credentials); // 'omit', 'same-origin', or 'include'
      // console.debug("Redirect:", request.redirect); // 'follow', 'manual', or 'error'

      const response = await fetch(request);

      if (response.ok) {
        const result = await response.json(); // Parse the JSON response (if it's JSON)
        document.getElementById("createUserResult").innerHTML =
          `<p class="success-msg">Form submitted successfully!</p>`;
        console.debug("Server response:", result);
        navigateTo("/login");
      } else {
        const errorData = await response.json();
        // const errorMessages = Object.entries(errorData).map(([field, messages]) => `${field}: ${messages.join()}`)
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("<br>");
        alert(`Error: ${errorMessages || "Submission failed."}`);
        // document.getElementById("createUserResult").innerHTML =
          // `<p class="error-msg background white-txt">Error: ${errorMessages || "Submission failed."}</p>`;
        console.debug("Server response:", errorData);
      }
    } catch (error) {
      document.getElementById("createUserResult").innerHTML = `
        <p class="error-msg background white-txt">Error: Unable to submit form. Please try again later.</p>`;
      console.error("Error submitting form:", error);
    }
  }

  async addEventListeners() {
    const button = document.querySelector("#createUserButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Submit button clicked!");
        await this.submitNewUser();
      });
    }
  }
}
