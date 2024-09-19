import { navigateTo } from "../router.js";

export default class FetchApi {
  constructor() {}

  makeHeaders(accessToken, boolJSON) {
    const myHeaders = newHeaders();
    if (accessToken != null) {
      myHeaders.append("Authorization", "Bearer " + accessToken);
    }
    if (boolJSON === true) {
      myHeaders.append("Content-type", "application/json");
    }
    return myHeaders;
  }

  async makeRequest(url, myMethod, myBody) {
    const username = sessionStorage.getItem("username_transcendance");
    const myRequest = new Request(url, {
      method: myMethod,
    });

    let accessToken = null;
    if (username) {
      accessToken = await this.getToken();
    }
    if (myBody != null) {
      myRequest.headers = this.makeHeaders(accessToken, true);
      myRequest.body = JSON.stringify(myBody);
    } else myRequest.headers = this.makeHeaders(accessToken, false);
    return myRequest;
  }

  parseJwt(token) {
    let base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    let jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  }

  async refreshToken(authToken) {
    const refreshJWT = sessionStorage.getItem("refreshJWT_transcendance");
    if (!refreshJWT || !authToken) {
      //ALERT ERROR
      removeSessionStorage();
      navigateTo("/login");
      throw Error("Redirect to login, invalid token");
    }
    try {
      const myHeaders = this.makeHeaders(authToken, true);
      const request = new Request("/api/auth/refresh", {
        method: "POST",
        headers: myHeaders,
        body: refreshJWT,
      });
      const response = await fetch(request);
      if (response.ok) {
        const data = await response.json();
        setSessionStorage(data, null);
      } else {
        //ALERT ERROR
        this.removeSessionStorage();
        navigateTo("/login");
        throw Error("Redirect to login, invalid token");
      }
    } catch (error) {
      console.error("Error refreshing token: ", error);
      this.removeSessionStorage();
      navigateTo("/login");
      throw Error("Redirect to login, invalid token");
    }
  }

  async getToken() {
    let authToken = sessionStorage.getItem("accessJWT_transcendance");
    if (!authToken) {
      return null;
    }
    const parseToken = this.parseJwt(authToken);
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseToken.expire + 1 >= currentTime) {
      authToken = await this.refreshToken(authToken);
    }
    return authToken;
  }
}
