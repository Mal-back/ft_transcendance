import Home from "./pages/Home.js";
import Profile from "./pages/Profile.js";
import CreateUser from "./pages/CreateUser.js";
import Login from "./pages/Login.js";
import Logout from "./pages/Logout.js";
import Settings from "./pages/settings.js";
import Friends from "./pages/TrueFriends.js";
import Ranking from "./pages/Ranking.js";

import PongLocal from "./pages/PongLocal.js";
import PongMenu from "./pages/PongMode.js";
import PongLocalMenu from "./pages/PongLocalMenu.js";
import PongRemoteMenu from "./pages/PongRemoteMenu.js";
import PongLocalLobby from "./pages/PongLocalLobby.js";
import PongRemoteLobby from "./pages/PongRemoteLobby.js";
import PongRemoteTournament from "./pages/PongRemoteTournament.js";
import PongLocalTournament from "./pages/PongLocalTournament.js";

// import Puissance4 Local
import Connect4Local from "./pages/Connect4Local.js";
import Connect4Menu from "./pages/Connect4Mode.js";
import Connect4LocalMenu from "./pages/Connect4LocalMenu.js";
import Connect4RemoteMenu from "./pages/Connect4RemoteMenu.js";
import Connect4LocalLobby from "./pages/Connect4LocalLobby.js";
import Connect4RemoteLobby from "./pages/Connect4RemoteLobby.js";
import Connect4LocalTournament from "./pages/Connect4LocalTournament.js";
import AbstractViews from "./pages/AbstractViews.js";
import CustomError from "./Utils/CustomError.js";
import { showModal } from "./Utils/Utils.js";

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
    { path: "/profile", view: Profile },
    { path: "/createUser", view: CreateUser },
    { path: "/login", view: Login },
    { path: "/logout", view: Logout },
    { path: "/settings", view: Settings },
    { path: "/friends", view: Friends },
    { path: "/rankings", view: Ranking },
    // { path: "/pong", view: Pong },
    { path: "/pong", view: PongLocal },
    { path: "/pong-menu", view: PongMenu },
    { path: "/pong-local-menu", view: PongLocalMenu },
    { path: "/pong-remote-menu", view: PongRemoteMenu },
    { path: "/pong-local-lobby", view: PongLocalLobby },
    { path: "/pong-remote-lobby", view: PongRemoteLobby },
    { path: "/pong-remote-tournament", view: PongRemoteTournament },
    { path: "/pong-local-tournament", view: PongLocalTournament },

    //PUISSANCE 4 routes
    { path: "/c4", view: Connect4Local },
    { path: "/c4-menu", view: Connect4Menu },
    { path: "/c4-local-menu", view: Connect4LocalMenu },
    { path: "/c4-remote-menu", view: Connect4RemoteMenu },
    { path: "/c4-local-lobby", view: Connect4LocalLobby },
    { path: "/c4-remote-lobby", view: Connect4RemoteLobby },
    { path: "/c4-local-tournament", view: Connect4LocalTournament },
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

  view = null;
  view = new match.route.view();

  try {
    await view.loadCss();
    await view.lang.fetchJSONLanguage();

    document.querySelector("#app").innerHTML = "";
    await view.checkLogin();
    document.querySelector("#app").innerHTML = await view.getHtml();
    if (match.route.path == "/c4" || match.route.path == "/pong")
      await view.game();
    await view.addEventListeners();
  } catch (error) {
    if (error instanceof CustomError) {
      console.error("error in view", error);
      error.showModalCustom();
      navigateTo(error.redirect);
    } else {
      console.error("error in view", error);
      navigateTo("/");
    }
  }

  // Function to print all CSS links on the page
  function printAllCssLinks() {
    // Select all <link> elements with rel="stylesheet"
    console.log("PRINT CSS");
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');

    // Loop through each <link> element
    cssLinks.forEach((link) => {
      // Print the href attribute (URL of the stylesheet) to the console
      console.log(link.href);
    });
  }

  // Call the function to print all CSS links

  // print all html
  // printAllCssLinks();
  //   console.log("PRINT HTML")
  // console.log(document.documentElement.outerHTML);
};

window.addEventListener("popstate", async () => {
  if (view) view.destroy();
  router();
});

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

function closeSidebar(sidebar) {
  const offcanvasInstance = bootstrap.Offcanvas.getInstance(sidebar);

  if (offcanvasInstance && sidebar.classList.contains("show")) {
    offcanvasInstance.hide();

    sidebar.addEventListener(
      "hidden.bs.offcanvas",
      function () {
        const backdrop = document.querySelector(".offcanvas-backdrop");
        if (backdrop) {
          backdrop.remove();
        }
      },
      { once: true },
    );
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

document.querySelector("#headerSpanish").addEventListener("click", (ev) => {
  ev.preventDefault();
  sessionStorage.setItem("transcendence_language", "es");
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

document
  .getElementById("buttonOnGoingGame")
  .addEventListener("click", async (ev) => {
    try {
      ev.preventDefault();
      const url = ev.currentTarget.dataset.redirectUrl;
      if (url) {
        if (ev.target.innerText == "CANCEL") {
          const request = await view.makeRequest(url, "DELETE");
          const response = await fetch(request);
          if (view.handleStatus(response)) {
            const divOnGoingGame = document.querySelector("#divOnGoingGame");
            divOnGoingGame.style.display = "none";
          }
        } else navigateTo(url);
        const friendModalDiv = document.querySelector("#inviteUserModal");
        const modal = bootstrap.Modal.getInstance(friendModalDiv);
        modal.hide();
      }
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      }
    }
  });
