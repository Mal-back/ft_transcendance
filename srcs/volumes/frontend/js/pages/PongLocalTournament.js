import { navigateTo } from "../router.js";
import { showModal } from "../Utils/Utils.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Pong Tournament Local");
    this.tournament = null;
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/tournament-local.css");
    this.createPageCss("../css/connect-local.css");
    this.createPageCss("../css/ranking-tournament.css");
  }

  async getHtml() {
    actualizeTournament();
    const listPlayer = getListPlayer();
    return `
    <div class="background">
      <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
        TOURNAMENT - PONG - RANKING</h1>
      <br>
      <div class="tournament-creation list-group ranking">
        <div>
          <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
            <div class="d-flex align-items-center">
              <div class="ranking-number gold">1</div>
              <div class="Avatar status-online me-3"></div>
              <div class="flex-fill">
                <h5 class="mb-0">USERNAME</h5>
              </div>
            </div>
            <div class="score">
              <span>WINS: 1</span>
              <br>
              <span>LOSS: 2</span>
            </div>
          </div>
        </div>
        <div>
          <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
            <div class="d-flex align-items-center">
              <div class="ranking-number silver">2</div>
              <div class="Avatar status-online me-3"></div>
              <div class="flex-fill">
                <h5 class="mb-0">USERNAME2</h5>
              </div>
            </div>
            <div class="score">
              <span>WINS: 1</span>
              <br>
              <span>LOSS: 2</span>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-center mt-2">
        <button type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button"
          id="TournamentButton">NEXT GAME</button>
      </div>
    </div>
        `;
  }

  updateRank() {

  }

  getListPlayer() {
    const divList = document.createElement("div");
    divList.innerHTML = "";
    for (let count = 1; count <= (this.tournament.PlayerA.length * 2); count++) {
      divList.innerHTML += this.getNextRankDivPlayer(count);
    }
  }

  actualizeTournament() {
    this.tournament = JSON.parse(
      sessionStorage.getItem("tournament_transcendence_local"),
    );
    //TODO protect tournament
    this.updateRank();
    if (this.tournament.round.currentMatch != this.tournament.PlayerA.length) {
      this.tournament.round.currentMatch++
    }
    else {
      this.tournament.round.current++
      this.tournament.round.currentMatch = 0
    }
    if (this.tournament.round == this.tournament.max)
      return this.endTournament();
  }
}
