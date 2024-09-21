  export function removeSessionStorage() {
    sessionStorage.removeItem("accessJWT_transcendance");
    sessionStorage.removeItem("refreshJWT_transcendance");
    sessionStorage.removeItem("username_transcendance");
  }

  export function setSessionStorage(data, username) {
    if (username){
      sessionStorage.setItem("username_transcendence", username);
    }
    sessionStorage.setItem("accessJWT_transcendence", data.access);
    sessionStorage.setItem("refreshJWT_transcendence", data.refresh);
  }
