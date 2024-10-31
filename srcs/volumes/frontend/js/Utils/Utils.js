export function removeSessionStorage() {
  sessionStorage.removeItem("accessJWT_transcendence");
  sessionStorage.removeItem("refreshJWT_transcendence");
  sessionStorage.removeItem("username_transcendence");
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
  const modalTitleElement = document.getElementById("alertLabel");
  const errorMessageElement = document.getElementById("alertMessage");
  if (title == "Error" || title == "Erreur") {
    modalTitleElement.style.color = "red";
  } else if (title == "Success" || title == "Succes") {
    modalTitleElement.style.color = "blue";
  } else {
    modalTitleElement.style.color = "black";
  }

  modalTitleElement.textContent = title;
  errorMessageElement.innerHTML = message;
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

export function getIpPortAdress() {
  const url = new URL(window.location.href);

  // Regex for IP addresses or domain names with letters, numbers, hyphens, and dots
  const validHostnamePattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  const hostname = url.hostname;
  const port = url.port || (url.protocol === "https:" ? "443" : "80"); // Default ports if none specified

  if (validHostnamePattern.test(hostname)) {
    const hostAndPort = `${hostname}:${port}`;
    console.log("Host and Port:", hostAndPort); // Output like "blob-54-f45.fr:8080"
    return hostAndPort;
  } else {
    console.log("Invalid Hostname:", hostname);
  }
}
