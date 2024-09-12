import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Form");
  }
  async getHtml() {
    return `<form id="login">
      <label for="username">Username: </label>
      <input type="text" name="username" required>
      <label for="password">Password: </label>
      <input type="password" name="password" required>
      <br>
      <button id="formButton" type="submit">
    </form>
    <div id="result"></div>
  `;
  }

  addEventListeners() {
    const button = document.querySelector("#formButton");
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
    const username = loginForm.querySelector("input[name='username']").value;
    const password = loginForm.querySelector("input[name='password']").value;

    console.debug("username = " + username);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const body = JSON.stringify({
        username: username,
        password: password,
      });

      const request = new Request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: username,
          password: password,
        }),
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
