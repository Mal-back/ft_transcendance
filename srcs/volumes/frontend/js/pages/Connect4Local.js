import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import Connect4 from "../game/Connect4.js";
import CustomError from "../Utils/CustomError.js";
import { getIpPortAdress, showModal } from "../Utils/Utils.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Local Connect4");
    this.connect4 = new Connect4(this.handleGetUsername.bind(this));
  }

  async loadCss() {
    this.createPageCss("../../css/normal-mode.css");
    // this.createPageCss("../../css/background-profile.css");
    this.createPageCss("../../css/background-c4.css");
    this.createPageCss("../../css/connect4/hover-red.css");
  }

  async getHtml() {
    const htmlContent = `
        <div class="col d-flex flex-column align-items-center justify-content-center">
            <div class="background background-battle d-flex flex-column align-items-center">

                <!-- Text Section: Usernames and Score -->

                <div class="d-flex justify-content-center text-black text-section mt-4 w-80">
                    <div class="row w-100 text-center">
                        <div class="col-4 d-flex justify-content-center" id="User1">
                        <div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar" id="leftPlayerAvatar"></div>
                            <h3 class="username-outline" style="cursor: pointer;"><span id="leftUser" class="user1-txt"></span></h3>
                        </div>
                        <div class="col-4 d-flex justify-content-center">
                            <h3>VS</h3>
                        </div>
                        <div class="col-4 d-flex justify-content-center" id="User2">
                            <h3 class="username-outline" style="cursor: pointer;"><span id="rightUser" class="user2-txt"></span></h3>
                            <div class="Avatar Avatar-Resize status-playing ms-3" alt="Avatar" id="rightPlayerAvatar"></div>
                        </div>
                    </div>
                </div>

                

                <div class="canvas-container">
                    <div class="grid">


                        <!-- ROW 0 -->
                        <div id="cell0-0" class="cell cell-empty"></div>
                        <div id="cell0-1" class="cell cell-empty"></div>
                        <div id="cell0-2" class="cell cell-empty"></div>
                        <div id="cell0-3" class="cell cell-empty"></div>
                        <div id="cell0-4" class="cell cell-empty"></div>
                        <div id="cell0-5" class="cell cell-empty"></div>
                        <div id="cell0-6" class="cell cell-empty"></div>


                        <!-- ROW 1 -->
                        <div id="cell1-0" class="cell cell-empty"></div>
                        <div id="cell1-1" class="cell cell-empty"></div>
                        <div id="cell1-2" class="cell cell-empty"></div>
                        <div id="cell1-3" class="cell cell-empty"></div>
                        <div id="cell1-4" class="cell cell-empty"></div>
                        <div id="cell1-5" class="cell cell-empty"></div>
                        <div id="cell1-6" class="cell cell-empty"></div>


                        <!-- ROW 2 -->
                        <div id="cell2-0" class="cell cell-empty"></div>
                        <div id="cell2-1" class="cell cell-empty"></div>
                        <div id="cell2-2" class="cell cell-empty"></div>
                        <div id="cell2-3" class="cell cell-empty"></div>
                        <div id="cell2-4" class="cell cell-empty"></div>
                        <div id="cell2-5" class="cell cell-empty"></div>
                        <div id="cell2-6" class="cell cell-empty"></div>


                        <!-- ROW 3 -->
                        <div id="cell3-0" class="cell cell-empty"></div>
                        <div id="cell3-1" class="cell cell-empty"></div>
                        <div id="cell3-2" class="cell cell-empty"></div>
                        <div id="cell3-3" class="cell cell-empty"></div>
                        <div id="cell3-4" class="cell cell-empty"></div>
                        <div id="cell3-5" class="cell cell-empty"></div>
                        <div id="cell3-6" class="cell cell-empty"></div>


                        <!-- ROW 4 -->
                        <div id="cell4-0" class="cell cell-empty"></div>
                        <div id="cell4-1" class="cell cell-empty"></div>
                        <div id="cell4-2" class="cell cell-empty"></div>
                        <div id="cell4-3" class="cell cell-empty"></div>
                        <div id="cell4-4" class="cell cell-empty"></div>
                        <div id="cell4-5" class="cell cell-empty"></div>
                        <div id="cell4-6" class="cell cell-empty"></div>


                        <!-- ROW 5 -->
                        <div id="cell5-0" class="cell cell-empty"></div>
                        <div id="cell5-1" class="cell cell-empty"></div>
                        <div id="cell5-2" class="cell cell-empty"></div>
                        <div id="cell5-3" class="cell cell-empty"></div>
                        <div id="cell5-4" class="cell cell-empty"></div>
                        <div id="cell5-5" class="cell cell-empty"></div>
                        <div id="cell5-6" class="cell cell-empty"></div>

                    </div>
                </div>
                <div class="d-flex flex-row justify-content-center text-white text-section mt-3 w-80"
                    style="background-color: rgb(0, 0, 0,0.5);">
                    <div class="text-center" id="Turn">
                        <h3>It's <span class="user1-txt" id="userTurn"></span>'s turn!</h3>
                    </div>
                </div>
                <div class="m-3">
                        <button id="helpBtn" type="button" class="btn btn-secondary">HELP</button>
                        <button id="giveUpBtn" type="button" class="btn btn-danger" style="display: none;">GIVE UP</button>
                        <button id="startBtn" type="button" class="removeElem btn btn-success">START</button>
                        <button id="returnBtn" type="button" class="removeElem btn btn-success" style="display: none;">RETURN</button>
                </div>
            </div>
        </div>
            `;
    return htmlContent;
  }

  checkLogin() {
    return;
  }

  async game() {
    console.log("COUCOU");
    try {
      const params = new URLSearchParams(window.location.search);
      let auth_token = null;
      let mode = params.get("mode");
      let connection = params.get("connection");
      if (!connection) connection = "local";
      let webScoketURL = `wss://${getIpPortAdress()}/api/game/c4-local/join/`;
      if (connection != "local") {
        webScoketURL = `wss://${getIpPortAdress()}/api/game/c4-remote/join/`;
        auth_token = await this.getToken();
      }
      this.connect4.initC4(
        "ongoing-game",
        webScoketURL,
        connection,
        auth_token,
      );
      if (mode == "tournament") {
        console.log("tournament mode");
        const tournament = sessionStorage.getItem(
          "tournament_transcendence_local",
        );
        if (!tournament) {
          navigateTo("/c4-local-lobby");
          showModal(
            "Error",
            "could not retrieve your tournament information, please start a new tournament, sorry for the inconvenience",
          );
          return;
        }
        this.connect4.setBackground();
        const parsedTournament = JSON.parse(tournament);
        if (
          !parsedTournament.round ||
          !parsedTournament.PlayerA ||
          !parsedTournament.PlayerB
        ) {
          {
            navigateTo("/c4-local-lobby");
            showModal(
              "Error",
              "could not retrieve your tournament information, please start a new tournament, sorry for the inconvenience",
            );
            return;
          }
        }
        console.log("TOURNAMENT START C4:", parsedTournament);
        this.connect4.setUsername(
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

  async handleGetUsername(
    mode,
    player_1Username,
    player_2Username,
    currentPlayer,
  ) {
    try {
      console.log("View:handleGetUsername");
      if (mode == "remote") {
        const avatars = await this.requestAvatars(
          player_1Username,
          player_2Username,
        );
        const User1Avatar = document.getElementById("User1Avatar");
        const User2Avatar = document.getElementById("User2Avatar");
        if (avatars) {
          User1Avatar.style = `background-image: url(${avatars[0]})`;
          User2Avatar.style = `background-image: url(${avatars[1]})`;
        }
      }
      const User1Text = document.getElementById("leftUser");
      const User2Text = document.getElementById("rightUser");
      const UserTurnText = document.getElementById("userTurn");

      User1Text.innerText = player_1Username;
      User2Text.innerText = player_2Username;
      UserTurnText.innerText = currentPlayer;
    } catch (error) {
      console.error("handleSetUsername:", error);
    }
  }

  async addEventListeners() {
    this.connect4.addC4Event();
  }

  removeEventListeners() {
    if (this.connect4) this.connect4.removeC4Event();
  }
}
