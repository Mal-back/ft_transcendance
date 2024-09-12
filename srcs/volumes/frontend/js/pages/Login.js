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

  async login() {
    const loginForm = document.querySelector("login");
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
    }
    const Body = JSON.stringify({

    })
  }
}
