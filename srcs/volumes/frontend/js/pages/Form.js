import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Form");
  }
  async getHtml() {
    return `<form id="createUser">
      <label for="username">Username: </label>
      <input type="text" name="username" required>
      <label for="email">Email: </label>
      <input type="email" name="email" required>
      <label for="password">Password: </label>
      <input type="password" name="password" required>
      <br>
      <button id="formButton" type="submit">
    </form>
    <div id="result"></div>
  `;
  }

  async submitNewUser() {
    const createUser = document.querySelector("#createUser");
    const formData = new FormData(createUser);
    const formObject = Object.fromEntries(formData.entries());
    console.debug("Form Data:", formObject);
    console.debug("trying fetch");
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const Body = JSON.stringify({
        username: "moi",
        password: "toi",
        password2: "toi",
        email: "moi@google.com",
        two_fa_enable: false,
      });

      const request = new Request("/api/auth/", {
        method: "POST",
        body: JSON.stringify({
          username: "moi2",
          password: "toi",
          password2: "toi",
          email: "moi2@google.com",
          two_fa_enable: false,
        }),
        headers: myHeaders,
      });
      console.debug("Method:", request.method); // GET, POST, etc.
      console.debug("URL:", request.url); // The request URL
      console.debug("Headers:", Array.from(request.headers.entries())); // All headers
      console.debug("Body:", Body); // Whether the body has been read yet
      console.debug("Mode:", request.mode); // 'cors', 'no-cors', 'same-origin'
      console.debug("Credentials:", request.credentials); // 'omit', 'same-origin', or 'include'
      console.debug("Redirect:", request.redirect); // 'follow', 'manual', or 'error'

      const response = await fetch(request);

      if (response.ok) {
        const result = await response.json(); // Parse the JSON response (if it's JSON)
        document.getElementById("result").innerHTML = `
          Form submitted successfully!;
          user = $`;
        console.debug("Server response:", result);
      } else {
        document.getElementById("result").innerHTML = "Error submitting form.";
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  addEventListeners() {
    const button = document.querySelector("#formButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Submit button clicked!");
        await this.submitNewUser();
      });
    }
  }
}
