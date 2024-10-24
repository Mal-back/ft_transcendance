import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import Pong from "../game/Pong.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Local Pong");
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
                          <h3>${this.lang.getTranslation(["game", "leftPlayer"])}</h3>
                        </div>
                        <div class="text-center">
                            <h3 id="scoreId">0 - 0</h3>
                        </div>
                        <div class="text-center d-flex">
                          <h3>${this.lang.getTranslation(["game", "rightPlayer"])}</h3>
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

  game() {
    this.pong.initPong(
      "ongoing-game",
      "ws://localhost:8080/api/game/ws/14545",
      "local",
      "scoreId",
    );
  }

  async addEventListeners() {
    this.pong.addPongEvent();
  }

  removeEventListeners() {
    this.pong.removePongEvent();
  }
}
