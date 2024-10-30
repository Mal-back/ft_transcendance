import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import Pong from "../game/Pong.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Local Pong");
    this.tournament = null;
    this.pong = new Pong();
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-battle.css");
  }

  async getHtml() {
    const htmlContent = `<div class="col d-flex flex-column align-items-center justify-content-center">
                <div class="background background-battle d-flex flex-column align-items-center">
                    <div class="d-flex flex-row justify-content-between text-white text-section mt-3 w-80">
                        <div class="text-center d-flex"> 
                          <div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar"></div>
                          <h3 id="leftPlayer" class=""></h3>
                        </div>
                        <div class="text-center spacingScore">
                            <h2 id="scoreId">0 - 0</h3>
                        </div>
                        <div class="text-center d-flex">
                          <h3 id="rightPlayer"></h3>
                          <div class="Avatar Avatar-Resize status-playing me-3" alt="Avatar"></div>
                        </div>
                    </div>
                    <div class="canvas-container">
                      <canvas id="ongoing-game"></canvas>
                    </div>
                </div>
            </div>`;
    return htmlContent;
  }

  checkLogin() {
    return;
  }

  async game() {
    const params = new URLSearchParams(window.location.search);
    let mode = params.get("mode");
    if (!mode) mode = "local";
    console.log("Init Game");
    this.pong.initPong(
      "ongoing-game",
      "wss://localhost:8080/api/game/pong-local/join/",
      mode,
      "scoreId",
    );
    const leftPlayerText = document.getElementById("leftPlayer");
    const rightPlayerText = document.getElementById("rightPlayer");
    if (mode == "tournament_local") {
      console.log("tournament mode")
      this.tournament = JSON.parse(
        sessionStorage.getItem("tournament_transcendence_local"),
      );
      this.pong.setUsername(
        this.tournament.PlayerA[this.tournament.round.currentMatch].name,
        this.tournament.PlayerB[this.tournament.round.currentMatch].name,
      );

    } else {
            console.log("not tournament mode")

    }
    const objectPlayers = this.pong.getUsername();
    leftPlayerText.innerText = objectPlayers.leftPlayer;
    rightPlayerText.innerText = objectPlayers.rightPlayer;
  }

  async addEventListeners() {
    this.pong.addPongEvent();
  }

  removeEventListeners() {
    this.pong.removePongEvent();
  }
}
