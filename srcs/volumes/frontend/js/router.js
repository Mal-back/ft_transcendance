import Home from "./pages/Home.js";
import Form from "./pages/Form.js";

const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

const router = async () => {
  console.log("Router is on");
  const routes = [
    { path: "/", view: Home },
    { path: "/createUser", view: Form },
  ];

  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      isMatch: location.pathname === route.path,
    };
  });

  let match = potentialMatches.find(
    (potentialMatches) => potentialMatches.isMatch,
  );
  if (!match) {
    match = {
      route: routes[0],
      isMatch: true,
    };
  }

  // console.log("match = " + match.route.path);
  const view = new match.route.view();
  document.querySelector("#app").innerHTML = await view.getHtml();
  await view.addEventListeners();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });
  router();
});

// const handleLocation = async () => {
//   const path = window.location.pathname;
//   const route = routes[path] || routes[404];
//   const html = await fetch(route).then((data) => data.text());
//   console.log(html);
//   document.getElementById("test").innerHTML = html;
// };
//
// window.onpopstate = handleLocation;
// window.route = route;
//
// handleLocation();
