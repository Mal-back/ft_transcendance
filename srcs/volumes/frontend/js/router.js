import Home from "./pages/Home.js";
// import Game from "./pages/Game.js";
import Profile from "./pages/Profile.js";
import CreateUser from "./pages/CreateUser.js";
import Login from "./pages/Login.js";
import Matchmaking from "./pages/Matchmaking.js";
import EpicMode from "./pages/epicMode.js";
import Logout from "./pages/Logout.js";
import Settings from "./pages/settings.js";
import TrueFriends from "./pages/Friends.js";
import Friends from "./pages/TrueFriends.js";
// import Pong from "./pages/Pong.js";
import PongLocal from "./pages/PongLocal.js";
import CustomError from "./Utils/CustomError.js";
import PongMenu from "./pages/PongMode.js";
import PongLocalMenu from "./pages/PongLocalMenu.js";
import PongLocalLobby from "./pages/PongLocalLobby.js";

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
    { path: "/friendstrue", view: TrueFriends },
    // { path: "/pong", view: Pong },
    { path: "/ponglocal", view: PongLocal },
    { path: "/pong-menu", view: PongMenu },
    { path: "/pong-local-menu", view: PongLocalMenu },
    { path: "/pong-local-lobby", view: PongLocalLobby },
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
    document.querySelector("#app").innerHTML = await view.getHtml();
    if (match.route.path == "/pongLocal" || match.route.path == "/pong")
      await view.game();
    await view.addEventListeners();
  } catch (error) {
    if (error instanceof CustomError) {
      error.showModalCustom();
      navigateTo(error.redirect);
    } else {
      console.error("Error in get Html():", error);
      console.trace();
      navigateTo("/");
    }
  }

  // Function to print all CSS links on the page
  function printAllCssLinks() {
    // Select all <link> elements with rel="stylesheet"
  console.log("PRINT CSS")
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');

    // Loop through each <link> element
    cssLinks.forEach((link) => {
      // Print the href attribute (URL of the stylesheet) to the console
      console.log(link.href);
    });
  }

  // Call the function to print all CSS links

  // print all html
//   printAllCssLinks();
//   console.log("PRINT HTML")
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

document.addEventListener("keydown", (ev) => {
  const modal = document.querySelector("#alertModal");
  if (modal.classList.contains("show")) {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
  }
});


// const  inviteModalEl = document.getElementById('inviteModal');
// inviteModalEl.addEventListener('show.bs.modal', function () {
//     populateInvites(invites); // Call your function to populate invites
// });
//
// const invites = [
//     {
//         profilePic: './img/ts/RED.jpeg',
//         name: 'John Doe',
//         message: 'John Doe has sent you an invite for a local pong!'
//     },
//     {
//         profilePic: './img/ts/RED.jpeg',
//         name: 'Jane Smith',
//         message: 'Jane Smith has sent you an invite for a remote pong!'
//     },
//     {
//         profilePic: './img/ts/RED.jpeg',
//         name: 'Thomas Moore',
//         message: 'Thomas Moore has sent you an invite for a local connect4!'
//     },
//     {
//         profilePic: './img/ts/RED.jpeg',
//         name: 'Guillaume',
//         message: 'Guillaume has sent you an invite for a remote connect4!'
//     }
//     ,
//     {
//         profilePic: './img/ts/RED.jpeg',
//         name: 'Xavier Sirius',
//         message: 'Xavier Sirius has sent you an invite for a pong tournament!'
//     },
//     {
//         profilePic: './img/ts/RED.jpeg',
//         name: 'Leo Nidas',
//         message: 'Leo Nidas has sent you an invite for a connect4 tournament!'
//     }
// ];

// function populateInvites(invites) {
//     const inviteList = document.getElementById('inviteList');
//     inviteList.innerHTML = ''; // Clear existing invites
//
//     invites.forEach(invite => {
//         const inviteItem = document.createElement('li');
//         inviteItem.className = 'list-group-item';
//
//         inviteItem.innerHTML = `
//     <div class="d-flex align-items-center">
//         <img src="${invite.profilePic}" alt="${invite.name}" class="rounded-circle me-3" width="50" height="50">
//         <div class="flex-grow-1">
//             <h5><strong>${invite.name}</strong></h5>
//             <p>${invite.message}</p>
//         </div>
//     </div>
//     <div class="d-flex justify-content-end mt-2">
//         <button class="btn btn-success btn-sm me-2" onclick="acceptInvite('${invite.name}')">
//             <i class="bi bi-check-circle"></i> Accept
//         </button>
//         <button class="btn btn-danger btn-sm" onclick="refuseInvite('${invite.name}')">
//             <i class="bi bi-x-circle"></i> Refuse
//         </button>
//     </div>
// `;
//
//         inviteList.appendChild(inviteItem);
//     });
// }
//
// function acceptInvite(name) {
//     alert(`${name} has been accepted!`); // Placeholder action
//     // Add your logic for accepting the invite
// }
//
// function refuseInvite(name) {
//     alert(`${name} has been refused!`); // Placeholder action
//     // Add your logic for refusing the invite
// }
//
// function updateNotificationCount(count) {
//     const badge = document.getElementById('notificationbell');
//     badge.textContent = count;
//
//     if (count > 0) {
//         badge.innerHTML = `<div class="notification-badge">${count}</div>`
//     }
// }
// setTimeout(() => {
//     updateNotificationCount(2); // Update count to 2
// }, 3000);

