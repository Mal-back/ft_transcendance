import Home from "./pages/Home.js";
import Game from "./pages/Game.js";
import Profile from "./pages/Profile.js";
import CreateUser from "./pages/CreateUser.js";
import Login from "./pages/Login.js";
import Matchmaking from "./pages/Matchmaking.js";
import EpicMode from "./pages/epicMode.js";
import Logout from "./pages/Logout.js";
import Settings from "./pages/settings.js";
import Friends from "./pages/Friends.js";
// import Pong from "./pages/Pong.js";
import PongLocal from "./pages/PongLocal.js";
import CustomError from "./Utils/CustomError.js";

export const navigateTo = (url) => {
  console.info("navigateTo : " + url);
  if (view) {
    view.destroy();
  }
  history.pushState(null, null, url);
  router();
};

let view = null;

const router = async () => {
  console.info("Router is on");
  const routes = [
    { path: "/", view: Home },
    { path: "/game", view: Matchmaking },
    { path: "/profile", view: Profile },
    { path: "/createUser", view: CreateUser },
    { path: "/login", view: Login },
    { path: "/logout", view: Logout },
    { path: "/epic-mode", view: EpicMode },
    { path: "/settings", view: Settings },
    { path: "/friends", view: Friends },
    // { path: "/pong", view: Pong },
    { path: "/pongLocal", view: PongLocal },
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

  // let previousView = null;
  // if (view) {
  //   previousView = view;
  // }
  view = null;
  view = new match.route.view();

  // if (previousView) {
  //   previousView.destroy();
  //   previousView = null;
  // }

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

  try {
    await view.loadCss();
    await view.lang.fetchJSONLanguage();

    document.querySelector("#app").innerHTML = "";
    document.querySelector("#app").innerHTML = await view.getHtml();
    await view.addEventListeners();
    if (match.route.path == "/pongLocal" || match.route.path == "/pong")
      view.pongGame();
  } catch (error) {
    if (error instanceof CustomError) {
      error.showModalCustom();
      navigateTo(error.redirect);
    } else {
      console.error("Error in get Html():", error.message);
      console.trace();
      navigateTo("/");
    }
  }

  // Function to print all CSS links on the page
  // function printAllCssLinks() {
  //   // Select all <link> elements with rel="stylesheet"
  //   const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  //
  //   // Loop through each <link> element
  //   cssLinks.forEach((link) => {
  //     // Print the href attribute (URL of the stylesheet) to the console
  //     console.log(link.href);
  //   });
  // }

  // Call the function to print all CSS links

  //print all html
  // console.log(document.documentElement.outerHTML);
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", handleClick);
  router();
});

export function handleClick(e) {
  console.info("Event");
  if (e.target.closest("[data-link]")) {
    console.log("REDIRECT");
    e.preventDefault();
    if (!e.target.href) {
      const closestHref = e.target.closest("a");
      navigateTo(closestHref);
    } else {
      console.log(`NavigatingTo href:${e.target.href}`, e.target);
      navigateTo(e.target.href);
    }
  } else {
    console.log("e.target = ", e.target);
  }
}

// function closeSidebar(sidebar) {
//   const offcanvasInstance = bootstrap.Offcanvas.getInstance(sidebar);
//   if (offcanvasInstance) {
//     offcanvasInstance.hide();
//   }
//   }
function closeSidebar(sidebar) {
  const offcanvasInstance = bootstrap.Offcanvas.getInstance(sidebar);

  if (offcanvasInstance && sidebar.classList.contains("show")) {
    offcanvasInstance.hide();

    // Clean up the backdrop after it's fully hidden
    sidebar.addEventListener(
      "hidden.bs.offcanvas",
      function() {
        const backdrop = document.querySelector(".offcanvas-backdrop");
        if (backdrop) {
          backdrop.remove(); // Ensure backdrop is removed
        }
      },
      { once: true },
    ); // Remove listener after it's executed once
  }
}

document.addEventListener("click", (ev) => {
  const sidebar = document.getElementById("sidebar");
  const toggleButton = document.getElementById("toggleSidebar");
  const isClickInsideSidebar = sidebar.contains(ev.target);
  const isClickOnToggleButton = toggleButton.contains(ev.target);

  if (
    !isClickInsideSidebar &&
    !isClickOnToggleButton &&
    sidebar.classList.contains("show")
  )
    closeSidebar(sidebar);
});

document.querySelector("#headerEnglish").addEventListener("click", (ev) => {
  ev.preventDefault();
  sessionStorage.setItem("transcendence_language", "en");
  const currentUrl = new URL(window.location.href);
  navigateTo(currentUrl.toString());
});

document.querySelector("#headerFrench").addEventListener("click", (ev) => {
  ev.preventDefault();
  sessionStorage.setItem("transcendence_language", "fr");
  const currentUrl = new URL(window.location.href);
  navigateTo(currentUrl.toString());
});

document.addEventListener("keydown", (ev) => {
  const modal = document.querySelector("#alertModal");
  if (modal.classList.contains("show")) {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
  }
});
