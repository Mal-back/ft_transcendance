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
    const tournamentMode =
      this.tournament.round.max > 4
        ? `Swiss Round Tournament`
        : `Round Robin Tournament`;
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

  rankPlayers() {
    if (this.tournament.round.number == 0) return;
    Object.keys(this.tournament.players).forEach((playerKey) => {
      const player = this.tournament.players[playerKey];
      const totalGames = player.win + player.loss;
      player.winRate = totalGames > 0 ? (player.win / totalGames) * 100 : 0;
    });

    const sortedPlayers = Object.entries(this.tournament.players)
      .map(([key, player]) => ({ key, ...player })) // Convert each player entry into an object
      .sort((a, b) => b.winRate - a.winRate); // Sort by win rate descending

    sortedPlayers.forEach((player, index) => {
      player.rank = index + 1; // Rank starts at 1 for the highest win rate
    });

    this.tournament.players = sortedPlayers.reduce((acc, player) => {
      acc[player.key] = player;
      delete acc[player.key].key; // Optional: Clean up temporary key property
      return acc;
    }, {});
  }

  hasPlayedAgainst(player, opponentName) {
    if (opponentName in player.played) return true;
    return false;
  }

  computeMatches() {
    const playerCount = Object.keys(tournament.players).length;
    let matchmaking = Array.from({ length: playerCount }, (_, i) => i + 1);
    while (matchmaking.length > 0) {
      for (let target = 1; target < matchmaking.length; target++) {
        let playerToMatch = this.tournament.players[`player${matchmaking[0]}`];
        let opponent = this.tournament.players[`player${matchmaking[target]}`];
        if (!this.hasPlayedAgainst(playerToMatch, opponent)) {
          matchmaking.splice(0, 1);
          matchmaking.splice(target, 1);
          break;
        }
      }
    }
  }

  computeNextRound() {
    this.rankPlayers();
    this.computeMatches();
  }

  actualizeTournament() {
    this.tournament = JSON.parse(
      sessionStorage.getItem("tournament_transcendence_local"),
    );
    //TODO protect tournament
    if (!this.tournament.round.match) {
      this.tournament.round++;
      if (this.tournament.round == this.tournament.max)
        return this.endTournament();
      this.computeNextRound();
    }
  }
}
