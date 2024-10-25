export function removeSessionStorage() {
  sessionStorage.removeItem("accessJWT_transcendence");
  sessionStorage.removeItem("refreshJWT_transcendence");
  sessionStorage.removeItem("username_transcendence");
  for (let count = 1; count <= 10; count++) {
    sessionStorage.removeItem(`transcendeance_tournament_player${count}`);
  }
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
