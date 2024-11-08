import { navigateTo } from "../router.js";
import { showModal, removeSessionStorage } from "../Utils/Utils.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";

// `
// <div>
//           <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
//             <div class="d-flex align-items-center">
//               <div class="ranking-number gold">1</div>
//               <div class="Avatar status-online me-3"></div>
//               <div class="flex-fill">
//                 <h5 class="mb-0">USERNAME</h5>
//               </div>
//             </div>
//             <div class="score">
//               <span>WINS: 1</span>
//               <br>
//               <span>LOSS: 2</span>
//             </div>
//           </div>
//         </div>
//         <div>
//           <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
//             <div class="d-flex align-items-center">
//               <div class="ranking-number silver">2</div>
//               <div class="Avatar status-online me-3"></div>
//               <div class="flex-fill">
//                 <h5 class="mb-0">USERNAME2</h5>
//               </div>
//             </div>
//             <div class="score">
//               <span>WINS: 1</span>
//               <br>
//               <span>LOSS: 2</span>
//             </div>
//           </div>
//         </div>
// `

/*
            <div class="modal fade" id="next-game-modal" tabindex="-1" aria-labelledby="next-game-modalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered loading-modal-diag">
                    <div class="modal-content">
                        <div class="modal-body next-battle-modal-body text-center">
                            <strong role="text">PLAYER 1</strong>
                            <br>
                            <strong role="text">VS</strong>
                            <br>
                            <strong role="text">PLAYER 2</strong>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button id="startBattle" type="button" class="btn btn-secondary">Start Battle</button>

                        </div>
                    </div>
                </div>
            </div>
 */
export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Connect4 Tournament Local");
    this.tournament = null;
    this.handleStartGame = this.handleStartGame.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/tournament-local.css");
    this.createPageCss("../css/connect-local.css");
    this.createPageCss("../css/ranking-tournament.css");
  }

  async checkLogin() {
    const username = sessionStorage.getItem("username_transcendence");
    if (username) {
      try {
        if ((await this.fetchNotifications()) === undefined) {
          throw new CustomError(
            `${this.lang.getTranslation(["modal", "title", "error"])}`,
            `${this.lang.getTranslation(["modal", "message", "authError"])}`,
          );
        }
      } catch (error) {
        removeSessionStorage();
        this.handleCatch(error);
      }
    }
  }

  async getHtml() {
    let listPlayer = null;
    try {
      this.actualizeTournament();
      listPlayer = this.getListPlayer();
    } catch (error) {
      if (error instanceof CustomError) throw error;
      else {
        console.error("Connect4LocalTournament:getHtml:", error);
      }
    }
    return `
    <div class="background" style="background-image:url('../img/forest.png');">
      <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
      ${this.lang.getTranslation(["game", "tournament"])} - ${this.lang.getTranslation(["game", "c4", "title"])} - ${this.lang.getTranslation(["game", "Ranking"])}</h1>
      <br>
      <div class="tournament-creation list-group ranking">
      ${listPlayer}
      </div>
      <div class="d-flex align-items-center justify-content-center mt-2">
        <button type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button" data-bs-toggle="modal"
              data-bs-target="#next-game-modal">Next Match</button>
      </div>
    </div>
    <div class="modal fade" id="next-game-modal" tabindex="-1" aria-labelledby="next-game-modalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered loading-modal-diag">
                    <div class="modal-content">
                        <div class="modal-body next-battle-modal-body text-center">
                            ${this.getNextMatch()}
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button id="startBattle" type="button" class="btn btn-secondary">Start Battle</button>
                        </div>
                    </div>
                </div>
    </div>
        `;
  }

  updateRank() {
    const listPlayer = [];
    this.tournament.PlayerA.forEach((element) => {
      if (element != undefined) listPlayer.push(element);
    });
    this.tournament.PlayerB.forEach((element) => {
      if (element != undefined) listPlayer.push(element);
    });
    listPlayer.sort((a, b) => b.winRate - a.winRate);
    for (let index = 0; index < listPlayer.length; index++) {
      const current = listPlayer[index];
      current.rank = index + 1; // Assign rank based on sorted order

      // Update rank in PlayerA array if current player is found there
      const playerIndexInA = this.tournament.PlayerA.findIndex(
        (player) => player && player.name === current.name,
      );
      if (playerIndexInA !== -1) {
        this.tournament.PlayerA[playerIndexInA].rank = current.rank;
      }
      const playerIndexInB = this.tournament.PlayerB.findIndex(
        (player) => player && player.name === current.name,
      );
      if (playerIndexInB !== -1) {
        this.tournament.PlayerB[playerIndexInB].rank = current.rank;
      }
    }
  }

  getNextMatch() {
    console.log(this.tournament.round.currentMatch);
    if (this.tournament.round.current == this.tournament.round.max) {
      return `<h4> <strong> Tournament is over</strong></h4>
              <br>
              <h5><strong>click here if you want to start another</strong></h5>
             `;
    }

    if (!this.tournament.PlayerA[this.tournament.round.currentMatch]) {
      console.log(
        "PlayerA ",
        this.tournament.PlayerA[this.tournament.round.currentMatch],
      );
      console.log(
        "PlayerB ",
        this.tournament.PlayerB[this.tournament.round.currentMatch],
      );
      return `
    <strong role="text">${this.tournament.PlayerB[this.tournament.round.currentMatch].name}</strong>
    <br>
    <strong role="text">You got a bye round! Congrats! ;)</strong>
            `;
    }
    if (!this.tournament.PlayerB[this.tournament.round.currentMatch]) {
      return `
    <strong role="text">${this.tournament.PlayerA[this.tournament.round.currentMatch].name}</strong>
    <br>
    <strong role="text">You got a bye round! Congrats! ;)</strong>
            `;
    }
    return `
  <strong role="text">${this.tournament.PlayerA[this.tournament.round.currentMatch].name}</strong>
  <br>
  <strong role="text">VS</strong>
  <br>
  <strong role="text">${this.tournament.PlayerB[this.tournament.round.currentMatch].name}</strong>
          `;
  }

  handleStartGame(ev) {
    ev.preventDefault();
    if (this.tournament.round.current == this.tournament.round.max) {
      sessionStorage.removeItem("tournament_transcendence_local");
      navigateTo("/c4-local-lobby");
      return;
    }
    // if (!this.tournament.PlayerA[this.tournament.round.currentMatch]) {
    //   this.tournament.PlayerB[this.tournament.round.currentMatch].win += 1;
    //   this.tournament.round.currentMatch += 1;
    //   sessionStorage.setItem(
    //     "tournament_transcendence_local",
    //     JSON.stringify(this.tournament),
    //   );
    //   this.tournament = null;
    //   navigateTo("/pong-local-tournament");
    // } else if (!this.tournament.PlayerB[this.tournament.round.currentMatch]) {
    //   this.tournament.PlayerA[this.tournament.round.currentMatch].win += 1;
    //   this.tournament.round.currentMatch += 1;
    //   sessionStorage.setItem(
    //     "tournament_transcendence_local",
    //     JSON.stringify(this.tournament),
    //   );
    //   this.tournament = null;
    //   navigateTo("/pong-local-tournament");
    // } else {
    sessionStorage.setItem(
      "tournament_transcendence_local",
      JSON.stringify(this.tournament),
    );
    this.tournament = null;
    navigateTo("/c4?connection=local&mode=tournament");
    // }
  }

  getPlayerByRank(count) {
    let nextPlayerRank = null;
    for (let i = 0; i < this.tournament.PlayerA.length; i++) {
      if (
        this.tournament.PlayerA[i] &&
        this.tournament.PlayerA[i].rank === count
      ) {
        nextPlayerRank = this.tournament.PlayerA[i];
        break;
      } else if (
        this.tournament.PlayerB[i] &&
        this.tournament.PlayerB[i].rank === count
      ) {
        nextPlayerRank = this.tournament.PlayerB[i];
        break;
      }
    }
    return nextPlayerRank;
  }
  getNextRankDivPlayer(count) {
    const nextPlayerRank = this.getPlayerByRank(count);
    if (nextPlayerRank == null) return "";
    console.log("nextPlayer:", nextPlayerRank.name);
    return `
        <div>
          <div class="list-group-item d-flex align-items-center justify-content-between mb-3 rounded w-100">
            <div class="d-flex align-items-center">
              <div class="ranking-number silver">${nextPlayerRank.rank}</div>
              <div class="Avatar status-online me-3"></div>
              <div class="flex-fill">
                <h5 class="mb-0">${nextPlayerRank.name}</h5>
              </div>
            </div>
            <div class="score">
              <span>WINS: ${nextPlayerRank.win}</span>
              <br>
              <span>LOSS: ${nextPlayerRank.loss}</span>
            </div>
          </div>
        </div>
          `;
  }

  getListPlayer() {
    const divList = document.createElement("div");
    divList.innerHTML = "";
    for (let count = 1; count <= this.tournament.PlayerA.length * 2; count++) {
      divList.innerHTML += this.getNextRankDivPlayer(count);
    }
    return divList.innerHTML;
  }

  rotatePlayers() {
    const immovable = this.tournament.PlayerA.shift();
    const toPushInB = this.tournament.PlayerA.pop();
    const toPushInA = this.tournament.PlayerB.shift();
    this.tournament.PlayerA.unshift(toPushInA);
    this.tournament.PlayerA.unshift(immovable);
    this.tournament.PlayerB.push(toPushInB);
  }

  getNextRound() {
    this.tournament.round.current++;
    this.tournament.round.currentMatch = 0;
    this.rotatePlayers();
  }

  skipByeMatch() {
    const playerA = this.tournament.PlayerA;
    const playerB = this.tournament.PlayerB;
    while (
      !playerA[this.tournament.round.currentMatch] ||
      !playerB[this.tournament.round.currentMatch]
    ) {
      this.tournament.round.currentMatch += 1;
      if (this.tournament.round.currentMatch >= this.tournament.PlayerA.length)
        this.getNextRound();
      if (this.tournament.round.current >= this.tournament.round.max) break;
      console.log(
        `current ROUND: ${this.tournament.round.current}; maxRound: ${this.tournament.round.max}`,
      );
    }
    console.log(
      `next match is : ${playerA[this.tournament.round.currentMatch].name} vs ${playerB[this.tournament.round.currentMatch].name}`,
    );
  }

  actualizeTournament() {
    this.tournament = JSON.parse(
      sessionStorage.getItem("tournament_transcendence_local"),
    );
    if (!this.tournament) {
      throw new CustomError(
        "error",
        "failed to retrieve tournament information",
        "/",
      );
    }
    console.log("tournament start:", this.tournament);
    this.updateRank();
    this.skipByeMatch();
    if (this.tournament.round.currentMatch >= this.tournament.PlayerA.length)
      this.getNextRound();
    if (this.tournament.round.current >= this.tournament.round.max) {
      showModal(
        "Congratulations",
        `${this.getPlayerByRank(1).name} won the tournament`,
      );
      sessionStorage.removeItem("tournament_transcendence_local");
      return;
    }
  }

  async addEventListeners() {
    const startGameButton = document.querySelector("#startBattle");
    if (startGameButton)
      startGameButton.addEventListener("click", this.handleStartGame);
  }

  removeEventListeners() {
    const startGameButton = document.querySelector("#startBattle");
    if (startGameButton)
      startGameButton.removeEventListener("click", this.handleStartGame);
  }
}
