import { navigateTo } from "../router.js";
import { showModal } from "../Utils/Utils.js";
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
      ${listPlayer}
      </div>
      <div class="d-flex align-items-center justify-content-center mt-2">
        <button type="button" class="btn btn-light white-txt btn-lg bg-midnightblue custom-button" data-bs-toggle="modal"
              data-bs-target="#next-game-modal">loading icon modal</button>
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
    this.tournament.PlayerA.array.forEach(element => {
      if (element != undefined)
        listPlayer.push(element);
    });
    this.tournament.PlayerB.array.forEach(element => {
      listPlayer.push(element);
    });
    console.log(listPlayer)
    listPlayer.sort((a, b) => b.winRate - a.winRate)
    console.log(listPlayer)
    for (let index = 0; index < listPlayer.length; index++) {
      const current = listPlayer[index];
      current.rank = index + 1;  // Assign rank based on sorted order

      // Update rank in PlayerA array if current player is found there
      const playerIndexInA = this.tournament.PlayerA.array.findIndex(player => player.name === current.name);
      if (playerIndexInA !== -1) {
        this.tournament.PlayerA.array[playerIndexInA].rank = current.rank;
      }
      const playerIndexInB = this.tournament.PlayerB.array.findIndex(player => player.name === current.name);
      if (playerIndexInB !== -1) {
        this.tournament.PlayerB.array[playerIndexInB].rank = current.rank;
      }
    }
  }

  getNextMatch() {
    if (this.tournament.PlayerA[this.tournament.round.currentMatch] == undefined) {
      return `
    <strong role="text">${this.tournament.PlayerB[this.tournament.round.currentMatch].name}</strong>
    <br>
    <strong role="text">You got a bye round! Congrats! ;)</strong>
    `
    }
    return `
  <strong role="text">${this.tournament.PlayerA[this.tournament.round.currentMatch].name}</strong>
  <br>
  <strong role="text">VS</strong>
  <br>
  <strong role="text">${this.tournament.PlayerB[this.tournament.round.currentMatch].name}</strong>`
  }

  getNextRankDivPlayer(count) {
    let nextPlayerRank = null;
    for (let i = 0; i < this.tournament.PlayerA.length; i++) {
      if (this.tournament.PlayerA[i].rank === count) {
        nextPlayerRank = this.tournament.PlayerA[i];
        break;
      }
      else if (this.tournament.PlayerB[i].rank === count) {
        nextPlayerRank = this.tournament.PlayerB[i];
        break;
      }
    }
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
          `
  }

  getListPlayer() {
    const divList = document.createElement("div");
    divList.innerHTML = "";
    for (let count = 1; count <= (this.tournament.PlayerA.length * 2); count++) {
      divList.innerHTML += this.getNextRankDivPlayer(count);
    }
    return divList.innerHTML;
  }

  rotatePlayers() {
    const immovable = this.tournament.PlayerA.shift();
    const toPushInB = this.tournament.PlayerA.pop()
    const toPushInA = this.tournament.PlayerB.shift()
    this.tournament.PlayerA.unshift(toPushInA)
    this.tournament.PlayerA.unshift(immovable)
    this.tournament.PlayerB.push(toPushInB)
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
      this.rotatePlayers();
    }
    if (this.tournament.round == this.tournament.max)
      return this.endTournament();
  }
}
