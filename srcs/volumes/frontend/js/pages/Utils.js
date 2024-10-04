export function removeSessionStorage() {
  sessionStorage.removeItem("accessJWT_transcendence");
  sessionStorage.removeItem("refreshJWT_transcendence");
  sessionStorage.removeItem("username_transcendence");
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
