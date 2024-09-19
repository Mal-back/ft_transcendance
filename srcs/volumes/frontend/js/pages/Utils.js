  export function removeSessionStorage() {
    sessionStorage.removeItem("accessJWT_transcendance");
    sessionStorage.removeItem("refreshJWT_transcendance");
    sessionStorage.removeItem("username_transcendance");
  }

  export function setSessionStorage(data, username) {
    if (username){
      sessionStorage.setItem("username_transcendance", username);
    }
    sessionStorage.setItem("accessJWT_transcendance", data.access);
    sessionStorage.setItem("refreshJWT_transcendance", data.refresh);
  }
