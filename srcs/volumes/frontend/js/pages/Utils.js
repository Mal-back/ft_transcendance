  export function removeSessionStorage() {
    sessionStorage.removeItem("accessJWT_transcendence");
    sessionStorage.removeItem("refreshJWT_transcendence");
    sessionStorage.removeItem("username_transcendence");
  }

  export function setSessionStorage(data, username) {
    if (username){
      sessionStorage.setItem("username_transcendence", username);
    }
    sessionStorage.setItem("accessJWT_transcendence", data.access);
    sessionStorage.setItem("refreshJWT_transcendence", data.refresh);
  }
