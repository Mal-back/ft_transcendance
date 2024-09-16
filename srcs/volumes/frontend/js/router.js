import Home from "./pages/Home.js";
import Game from "./pages/Game.js";
import Profile from "./pages/Profile.js";
import Authentification from "./pages/Authentification.js";
import CreateUser from "./pages/CreateUser.js";
import Login from "./pages/Login.js";
import Matchmaking from "./pages/Matchmaking.js";

export const navigateTo = (url) => {
  console.info("navigateTo : " + url);
  history.pushState(null, null, url);
  router();
};

let view = null;

const router = async () => {
  console.info("Router is on");
  const routes = [
    { path: "/", view: Home },
    { path: "/game", view: Game },
    { path: "/profile", view: Profile },
    { path: "/authentification", view: Authentification },
    { path: "/createUser", view: CreateUser },
    { path: "/login", view: Login },
    { path: "/matchmaking", view: Matchmaking },
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
    console.info("default");
    match = {
      route: routes[0],
      isMatch: true,
    };
  }
  console.info("route = " + match.route.path);

  let previousView = null;
  if (view) {
    previousView = view;
  }
  view = new match.route.view();

  if (previousView) {
    previousView.destroy();
  }

  // view.loadCss();

  // const pathToRegex = (path) =>
  //   new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
  //
  // const getParams = (match) => {
  //   const values = match.result.slice(1);
  //   const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
  //     (result) => result[1],
  //   );
  //
  //   return Object.fromEntries(
  //     keys.map((key, i) => {
  //       return [key, values[i]];
  //     }),
  //   );
  // };
  //
  // const navigateTo = (url) => {
  //   history.pushState(null, null, url);
  //   router();
  // };
  //
  // const router = async () => {
  //   const routes = [
  //     { path: "/", view: Home },
  //     { path: "/createUser", view: Form },
  //   ];
  //
  //   // Test each route for potential match
  //   const potentialMatches = routes.map((route) => {
  //     return {
  //       route: route,
  //       result: location.pathname.match(pathToRegex(route.path)),
  //     };
  //   });
  //
  //   let match = potentialMatches.find(
  //     (potentialMatch) => potentialMatch.result !== null,
  //   );
  //
  //   if (!match) {
  //     match = {
  //       route: routes[0],
  //       result: [location.pathname],
  //     };
  //   }
  //
  //   const view = new match.route.view(getParams(match));

  view.loadCss();
  document.querySelector("#app").innerHTML = await view.getHtml();
  view.addEventListeners();

};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", async () => {
  document.body.addEventListener("click", (e) => {
    console.info("Event");
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });
  router();
});
