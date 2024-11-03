import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import Pong from "../game/Pong.js";
import CustomError from "../Utils/CustomError.js";
import { getIpPortAdress, showModal } from "../Utils/Utils.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Pong");
    this.pong = new Pong(this.handleGetUsername.bind(this));
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../../css/background-profile.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-battle.css");
  }

  async getHtml() {
    const htmlContent = `<div class="col d-flex flex-column align-items-center justify-content-center">
                <div class="background background-battle d-flex flex-column align-items-center">
                    <div class="d-flex flex-row justify-content-between text-white text-section mt-3 w-80">
                        <div class="text-center d-flex"> 
                          <div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar" id="leftPlayerAvatar"></div>
                          <h3 id="leftPlayer" class=""></h3>
                        </div>
                        <div class="text-center spacingScore">
                            <h2 id="scoreId">0 - 0</h3>
                        </div>
                        <div class="text-center d-flex">
                          <h3 id="rightPlayer"></h3>
                          <div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar" id="rightPlayerAvatar"></div>
                        </div>
                    </div>
                    <div class="canvas-container">
                      <canvas id="ongoing-game"></canvas>
                    </div>
                    <div class="mt-3">
                        <button id="helpButton" type="button" class="btn btn-secondary" style="margin-right: 5vw;">HELP</button>
                        <button id="giveUpButton" type="button" class="btn btn-danger">GIVE UP</button>
                    </div>
                </div>
            </div>`;
    return htmlContent;
  }

  checkLogin() {
    return;
  }

  async game() {
    try {
      const params = new URLSearchParams(window.location.search);
      let auth_token = null;
      let mode = params.get("mode");
      let connection = params.get("connection");
      if (!connection) connection = "local";
      let webScoketURL = `wss://${getIpPortAdress()}/api/game/pong-local/join/`;
      if (connection != "local") {
        webScoketURL = `wss://${getIpPortAdress()}/api/game/pong-remote/join/`;
        auth_token = await this.getToken();
      }
      this.pong.initPong(
        "ongoing-game",
        webScoketURL,
        connection,
        "scoreId",
        auth_token,
      );
      if (mode == "tournament") {
        console.log("tournament mode");
        const tournament = sessionStorage.getItem(
          "tournament_transcendence_local",
        );
        if (!tournament) {
          navigateTo("/pong-local-lobby");
          showModal(
            "Error",
            "could not retrieve your tournament information, please start a new tournament, sorry for the inconvenience",
          );
          return;
        }
        const parsedTournament = JSON.parse(tournament);
        if (
          !parsedTournament.round ||
          !parsedTournament.PlayerA ||
          !parsedTournament.PlayerB
        ) {
          {
            navigateTo("/pong-local-lobby");
            showModal(
              "Error",
              "could not retrieve your tournament information, please start a new tournament, sorry for the inconvenience",
            );
            return;
          }
        }
        console.log("TOURNAMENT START PONG:", parsedTournament);
        this.pong.setUsername(
          parsedTournament.PlayerA[parsedTournament.round.currentMatch].name,
          parsedTournament.PlayerB[parsedTournament.round.currentMatch].name,
          parsedTournament,
        );
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("game:", error);
      }
    }
  }

  async requestAvatars(player_1Username, player_2Username) {
    let ret = [];
    try {
      const requestUser1 = await this.makeRequest(
        `api/users/${player_1Username}`,
        "GET",
      );
      const responseUser1 = await fetch(requestUser1);
      if (responseUser1.ok) {
        const data = await this.getErrorLogfromServer(responseUser1, true);
        ret.push(data.profilePic);
      } else {
        const data = await this.getErrorLogfromServer(responseUser1);
        console.error(`RequestAvatars: fail for ${player_1Username}`, data);
      }
      const requestUser2 = await this.makeRequest(
        `api/users/${player_2Username}`,
        "GET",
      );
      const responseUser2 = await fetch(requestUser2);
      if (responseUser2.ok) {
        const data = await this.getErrorLogfromServer(responseUser2, true);
        ret.push(data.profilePic);
      } else {
        const data = await this.getErrorLogfromServer(responseUser2);
        console.error(`RequestAvatars: fail for ${player_2Username}`, data);
      }
      return ret;
    } catch (error) {
      console.error("requestAvatars:", error);
    }
  }

  async handleGetUsername(mode, player_1Username, player_2Username) {
    try {
      console.log("View:handleGetUsername");
      if (mode == "remote") {
        const avatars = await this.requestAvatars(
          player_1Username,
          player_2Username,
        );
        const leftPlayerAvatar = document.getElementById("leftPlayerAvatar");
        const rightPlayerAvatar = document.getElementById("rightPlayerAvatar");
        if (avatars) {
          leftPlayerAvatar.style = `background-image: url(${avatars[0]})`;
          rightPlayerAvatar.style = `background-image: url(${avatars[1]})`;
        }
      }
      const leftPlayerText = document.getElementById("leftPlayer");
      const rightPlayerText = document.getElementById("rightPlayer");

      leftPlayerText.innerText = player_1Username;
      rightPlayerText.innerText = player_2Username;
    } catch (error) {
      console.error("handleSetUsername:", error);
    }
  }

  async addEventListeners() {
    this.pong.addPongEvent();
  }

  removeEventListeners() {
    this.pong.removePongEvent();
  }
}
