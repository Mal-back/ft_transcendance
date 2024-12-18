import CustomError from "./CustomError.js";
import Language from "./Language.js";

export function removeSessionStorage() {
  console.trace("remove sessionStorage trace:");
  sessionStorage.removeItem("accessJWT_transcendence");
  sessionStorage.removeItem("refreshJWT_transcendence");
  sessionStorage.removeItem("username_transcendence");
  sessionStorage.removeItem("transcendence_game_id")
  removeTournamentStorage();
}

export function removeTournamentStorage() {
  sessionStorage.removeItem("tournament_transcendence_local");
}

export function setSessionStorage(data, username) {
  if (username) {
    // console.log("setting new username:", username);
    sessionStorage.setItem("username_transcendence", username);
  }
  // console.log("Setting new accessJWT:", data.access);
  sessionStorage.setItem("accessJWT_transcendence", data.access);
  // console.log("Setting new refreshJWT:", data.refresh);
  sessionStorage.setItem("refreshJWT_transcendence", data.refresh);
  if (data.lang)
	sessionStorage.setItem("transcendence_language", data.lang)
else {
	console.error("NO LANG")
}
}

export function closeModal() {
  const modalId = document.getElementById("alertModal");
  const modal = bootstrap.Modal.getInstance(modalId);
  if (modal) {
    modal.hide();
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
  }
}

export function showModal(title, message) {
  console.trace("showModal: ");
  const modalTitleElement = document.getElementById("alertLabel");
  const errorMessageElement = document.getElementById("alertMessage");
  console.log("ErrorModalMessage:", message);
  if (title == "Error" || title == "Erreur") {
    modalTitleElement.style.color = "red";
  } else if (title == "Success" || title == "Succes") {
    modalTitleElement.style.color = "blue";
  } else {
    modalTitleElement.style.color = "black";
  }

  modalTitleElement.textContent = title;
  errorMessageElement.innerHTML = message;
  console.log("Message:", message);
  const modalId = document.getElementById("alertModal");
  let modal = bootstrap.Modal.getInstance(modalId);
  if (!modal) {
    modal = new bootstrap.Modal(modalId);
  }
  modal.show();

  modalId.querySelector(".btn-close").onclick = (ev) => {
    ev.preventDefault();
    closeModal();
  };
}

export function showModalGameResult(
  winnerUsername,
  loserUsername,
  gif = undefined,
  score = undefined,
) {
  const lang = new Language();
  const winner = document.getElementById("gameWinnerTitle");
  const loser = document.getElementById("gameLoserTitle");
  const scoreGame = document.getElementById("scoreGameResult");

  winner.innerHTML = `${lang.getTranslation(["game", "winner"])} : <span style="color:red" id="winnerGameResult">${winnerUsername}</span>`;
  loser.innerHTML = `${lang.getTranslation(["game", "loser"])} : <span style="color:blue" id="loserGameResult">${loserUsername}</span>`;

  if (gif != undefined) {
    const gifElement = document.getElementById("gifGameResult");
    gifElement.style.backgroundImage = `url(${gif})`;
  }

  if (score != undefined) {
    scoreGame.innerText = score;
  } else {
    scoreGame.style.display = "none";
  }

  const modalId = document.getElementById("gameResultModal");
  let modal = bootstrap.Modal.getInstance(modalId);
  if (!modal) {
    modal = new bootstrap.Modal(modalId);
  }
  modal.show();
  modalId.querySelector(".btn-close").onclick = (ev) => {
    ev.preventDefault();
    closeModal();
  };
}

export function getIpPortAdress() {
  const url = new URL(window.location.href);

  const validHostnamePattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$|^localhost$/;

  const lang = new Language();
  const hostname = url.hostname;
  const port = url.port || (url.protocol === "https:" ? "443" : "80"); 
  if (validHostnamePattern.test(hostname)) {
    const hostAndPort = `${hostname}:${port}`;
    console.log("Host and Port:", hostAndPort); 
    return hostAndPort;
  } else {
    throw new CustomError(
      `${lang.getTranslation(["modal", "title", "error"])}`,
      `${lang.getTranslation(["modal", "message", "invalidHost"])}`,
      `/`
    )
  }
}

export function formateDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
