import Home from "./pages/Home.js";
import Form from "./pages/Form.js";

// const navigateTo = (url) => {
//   history.pushState(null, null, url);
//   router();
// };

// const router = async () => {
//   console.log("Router is on");
//   const routes = [
//     { path: "/", view: Home },
//     { path: "/createUser", view: Form },
//   ];
//
// const potentialMatches = routes.map(route => {
//   return {
//     route: route,
//     isMatch: location.pathname === route.path,
//   };
// });
//
// let match = potentialMatches.find(
//   (potentialMatches) => potentialMatches.isMatch,
// );
// if (!match) {
//   match = {
//     route: routes[0],
//     isMatch: true,
//   };
// }
// console.debug("route = " + match.route.path);
//
// // console.log("match = " + match.route.path);
// const view = new match.route.view();

const pathToRegex = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1],
  );

  return Object.fromEntries(
    keys.map((key, i) => {
      return [key, values[i]];
    }),
  );
};

const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

const router = async () => {
  const routes = [
    { path: "/", view: Home },
    { path: "/createUser", view: Form },
  ];

  // Test each route for potential match
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null,
  );

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname],
    };
  }

  const view = new match.route.view(getParams(match));

  document.querySelector("#app").innerHTML = await view.getHtml();
  view.addEventListeners();
};

window.addEventListener("popstate", router);

// async function submitNewUser() {
//     const createUser = document.querySelector("#createUser");
//     // const formData = new FormData(createUser);
//     // const formObject = Object.fromEntries(formData.entries());
//     // console.debug("Form Data:", formObject);
//     console.debug("trying fetch");
//     try {
//       const myHeaders = new Headers();
//       myHeaders.append("Content-Type", "application/json");
//       const Body = JSON.stringify({
//         username: "moi",
//         password: "moi",
//         email: "moi@google.com",
//         two_fa_enable: "false",
//       });
//
//       const request = new Request("/api/auth/", {
//         method: "POST",
//         body: JSON.stringify({
//           username: "moi",
//           password: "toi",
//           email: "moi@google.com",
//           two_fa_enable: true,
//         }),
//         headers: myHeaders,
//       });
//       console.debug("Method:", request.method); // GET, POST, etc.
//       console.debug("URL:", request.url); // The request URL
//       console.debug("Headers:", Array.from(request.headers.entries())); // All headers
//       console.debug("Body:", Body); // Whether the body has been read yet
//       console.debug("Mode:", request.mode); // 'cors', 'no-cors', 'same-origin'
//       console.debug("Credentials:", request.credentials); // 'omit', 'same-origin', or 'include'
//       console.debug("Redirect:", request.redirect); // 'follow', 'manual', or 'error'
//       // console.debug(Request.toString()); /
//       const response = await fetch(request);
//
//       // const response = await fetch("https://127.0.0.1:8443/api/auth/", {
//       //   method: "POST",
//       //   headers: {
//       //     "Content-Type": "application/json",
//       //   },
//       //   body: formData,
//       // });
//       if (response.ok) {
//         const result = await response.json(); // Parse the JSON response (if it's JSON)
//         document.getElementById("result").innerHTML =
//           "Form submitted successfully!";
//         console.debug("Server response:", result);
//       } else {
//         document.getElementById("result").innerHTML = "Error submitting form.";
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }
//   }
//

async function submitAuthForm(username, email, password) {
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

document.addEventListener("DOMContentLoaded", async () => {
  // await submitNewUser();
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });
  // await submitAuthForm("moi", "moi@google.com", "toi");
  router();
});
