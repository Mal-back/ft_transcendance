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
  `;
  }

  //   async addEventListeners() {
  //     const button = document.querySelector("#formButton");
  //     if (button) {
  //       button.addEventListener("click", () => {
  //         console.debug("Submit button clicked!");
  //         fetchNewUser();
  //       }
  //         }
  //   }
  // }
  //
  //
  // async submitNewUser() {
  //   const createUser = document.querySelector("#createUser");
  //   const formData = new FormData(createUser);
  //   const formObject = Object.fromEntries(formData.entries());
  //   console.debug("Form Data:", formObject);
  //   console.debug("trying fetch");
  //   try {
  //     const myHeaders = new Headers();
  //     myHeaders.append("Content-Type", "application/json");
  //     const Body = JSON.stringify({
  //       username: "moi",
  //       password: "moi",
  //       email: "moi@google.com",
  //       two_fa_enable: true,
  //     });
  //
  //     const request = new Request("/api/auth/", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         username: "moi",
  //         password: "moi",
  //         email: "moi@google.com",
  //         two_fa_enable: true,
  //       }),
  //       headers: myHeaders,
  //     });
  //     console.debug("Method:", request.method); // GET, POST, etc.
  //     console.debug("URL:", request.url); // The request URL
  //     console.debug("Headers:", Array.from(request.headers.entries())); // All headers
  //     console.debug("Body:", Body); // Whether the body has been read yet
  //     console.debug("Mode:", request.mode); // 'cors', 'no-cors', 'same-origin'
  //     console.debug("Credentials:", request.credentials); // 'omit', 'same-origin', or 'include'
  //     console.debug("Redirect:", request.redirect); // 'follow', 'manual', or 'error'
  //     // console.debug(Request.toString()); /
  //     const response = await fetch("https://wikipedia.fr");
  //
  //     // const response = await fetch("https://127.0.0.1:8443/api/auth/", {
  //     //   method: "POST",
  //     //   headers: {
  //     //     "Content-Type": "application/json",
  //     //   },
  //     //   body: formData,
  //     // });
  //     if (response.ok) {
  //       const result = await response.json(); // Parse the JSON response (if it's JSON)
  //       document.getElementById("result").innerHTML =
  //         "Form submitted successfully!";
  //       console.debug("Server response:", result);
  //     } else {
  //       document.getElementById("result").innerHTML = "Error submitting form.";
  //     }
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //   }
  // }

  async submitAuthForm(username, email, password) {
    const url = "/api/auth/"; // Your API endpoint

    // Create the request body
    const body = {
      username: username,
      email: email,
      password: password,
    };
    console.log(body);
    try {
      // Make the POST request
      const response = await fetch(url, {
        method: "POST", // The HTTP method
        headers: {
          "Content-Type": "application/json", // Setting the content type to JSON
        },
        body: JSON.stringify(body), // Convert the body object to a JSON string
      });
      console.log("fetch successful");
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Parse and return the response as JSON (if successful)
      const result = await response.json();
      console.log("Success:", result);
      return result;
    } catch (error) {
      // Handle errors
      console.error("Error submitting form:", error);
    }
  }
  //
  // Example usage:
  // submitAuthForm("john_doe", "john.doe@example.com", "supersecretpassword");

  addEventListeners() {
    const button = document.querySelector("#formButton");
    if (button) {
      button.addEventListener("click", async (ev) => {
        ev.preventDefault();
        console.debug("Submit button clicked!");
        await this.submitAuthForm("moi", "moi@google.com", "toi");
      });
    }
  }
}

// async function submitAuthForm(username, email, password) {
//   const url = "/api/auth/"; // Your API endpoint
//
//   // Create the request body
//   const body = {
//     username: username,
//     email: email,
//     password: password,
//   };
//   console.log(body);
//   try {
//     // Make the POST request
//     const response = await fetch(url, {
//       method: "POST", // The HTTP method
//       headers: {
//         "Content-Type": "application/json", // Setting the content type to JSON
//       },
//       body: JSON.stringify(body), // Convert the body object to a JSON string
//     });
//     console.log("fetch successful");
//     // Check if the response is successful
//     if (!response.ok) {
//       throw new Error(`Error: ${response.status}`);
//     }
//
//     // Parse and return the response as JSON (if successful)
//     const result = await response.json();
//     console.log("Success:", result);
//     return result;
//   } catch (error) {
//     // Handle errors
//     console.error("Error submitting form:", error);
//   }
// }
