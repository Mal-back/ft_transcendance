import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";
import {
  removeSessionStorage,
  showModal,
  formateDate,
} from "../Utils/Utils.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.users = [];
    this.rank = 1;
    this.nextPage = undefined;
    this.previousPage = undefined;
    this.handleNextPage = this.handleNextPage.bind(this);
    this.handlePreviousPage = this.handlePreviousPage.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/ranking/global-ranking-remote.css");
    const currentUrl = window.location.href;
    console.log("current url =>", currentUrl);
  }

  async getHtml() {
    try {
      this.setTitle(`${this.lang.getTranslation(["title", "ranking"])}`);
      this.users = await this.getAllUsers();
      const modalsBattleHistory = await this.getAllHistoryModals();
      // const ranking = await this.getRanking(data);
      const html_content = `
<div class="removeElem background ">
    <h1 class="removeElem mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
        REMOTE - CONNECT 4 - GLOBAL RANKING</h1>
    <br>
    <div class="removeElem tournament-creation ranking">
        <div class="removeElem  text-center text-white  rounded">
            <h4 class="removeElem form-label text-decoration-underline" id="SelectPlayersTitle">Search Player:</h4>
            <div class="removeElem input-group mb-3">
                <input type="search" class="removeElem form-control" placeholder="Search"
                    aria-label="Recipient's username" aria-describedby="basic-addon2">
                <div class="removeElem input-group-append">
                    <button class="removeElem btn btn-outline-primary" type="submit"><i
                            class="removeElem bi bi-search"></i></button>
                </div>
            </div>
        </div>
    </div>
    <h5 class="removeElem form-label text-center text-white text-decoration-underline" id="Page-index-title">
        Page 1</h5>
    <div class="removeElem tournament-creation list-group ranking">
        <div class="removeElem list-group-item d-flex align-items-center justify-content-between rounded w-100">
            <div class="removeElem d-flex align-items-center">
                <div class="removeElem ranking-number-fake">
                    RANK
                </div>
                <div class="removeElem Avatar-Fake me-3"></div>
                <div class="removeElem flex-fill">
                    <h5 class="removeElem mb-0">USERNAME</h5>
                </div>
            </div>
            <div class="removeElem score">WIN RATE
            </div>
        </div>
    </div>
    <div id="rankingUsers" class="removeElem tournament-creation list-group ranking" style="max-height: 40vh;">
        <--{this.getRankingUsers()-->
        <div class="removeElem list-group-item d-flex align-items-center justify-content-between rounded w-100">
            <div class="removeElem d-flex align-items-center">
                <div class="removeElem ranking-number gold">1</div>
                <div class="removeElem Avatar status-online me-3"></div>
                <div class="removeElem flex-fill">
                    <h5 class="removeElem mb-0">USERNAMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE</h5>
                </div>
            </div>
            <div class="removeElem score">
                <span>Played : 2</span>
                <br>
                <span>WR: 50%</span>
            </div>
        </div>
    </div>

    <br>

    <div class="removeElem d-flex flex-column justify-content-center align-items-center">
        <nav aria-label="...">
            <ul class="removeElem pagination">
                <li class="removeElem page-item disabled" id="disablePrev">
                    <a class="removeElem page-link" tabindex="-1" aria-disabled="true" id="previousPageBtn">Previous</a>
                </li>
                <li class="removeElem page-item" id="disableNext">
                    <a class="removeElem page-link" id="nextPageBtn">Next</a>
                </li>
            </ul>
        </nav>
    </div>
</div>
<div id="modalsRanking" class="removeElem"></div>
              `;
      return html_content;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  getHTMLforUser(rank, username, avatar, gamesPlayed, winrate, status) {
    let color = "black"
    if (rank == 1) color = "gold"
    else if (rank == 2) color = "silver"
    else if (rank == 3) color = "bronze"
    return `
    <div class="removeElem list-group-item d-flex align-items-center justify-content-between rounded w-100">
        <div class="removeElem d-flex align-items-center">
            <div class="removeElem ranking-number ${color}">${rank}</div>
            <div class="removeElem Avatar ${status} me-3" style="${avatar}"></div>
            <div class="removeElem flex-fill">
                <h5 class="removeElem mb-0">${username}</h5>
            </div>
        </div>
        <div class="removeElem score">
            <span>Played : ${gamesPlayed}</span>
            <br>
            <span>WR: ${winrate}%</span>
        </div>
    </div>
    `
  }

  async getRankingUsers() {
    let ranking = ""
    for (let index = 0; index < this.users.length(); index++) {
      const user = this.users[index]
      ranking += this.getHTMLforUser(user.rank, user.username, user.avatar, user.gamesPlayed, user.winrate, user.status);
    }
    return ranking
  }

  async toggleButtons() {
    const prev = document.getElementById("disablePrev");
    if (!this.previousPage) {
      prev.classList.add("disabled");
    }
    else {
      prev.classList.remove("disabled")
    }
    const next = document.getElementById("disableNext");
    if (!this.nextPage) {
      next.classList.add("disabled");
    }
    else {
      next.classList.remove("disabled")
    }
  }

  async getAllUserData(players) {
    for (let rank = 0; rank < players.length; rank++) {
      const username = players[rank].username
      const user_info = await this.getUserInfo(username)
      console.log(user_info)
    }
  }
  async getNextUsers() {

  }

  async getUsers(url) {
    try {
      let request = await this.makeRequest(url);
      let response = await fetch(request);
      let data = null;
      if (await this.handleStatus(response))
        data = await this.getDatafromRequest(response);
      if (data == null) {
        throw new Error(`fail to get info on ${user}`);
      }
      console.log("data", data)
      let playersArray = data.results;
      console.log("players", playersArray);
      this.previousPage = data.previous;
      this.nextPage = data.next;
      await this.getAllUserData(playersArray)
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async getAllUsers() {
    try {
      let request = await this.makeRequest("/api/users/?order_by=username");
      let response = await fetch(request);
      let data = null;
      if (await this.handleStatus(response))
        data = await this.getDatafromRequest(response);
      if (data == null) {
        throw new Error(`fail to get info on ${user}`);
      }
      console.log("data", data)
      let playersArray = data.results;
      console.log("players", playersArray);
      this.previousPage = data.previous;
      this.nextPage = data.next;
      await this.getAllUserData(playersArray)
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async getAllHistoryModals() { }

  async handleNextPage() {
    console.log("next!")
    if (this.nextPage) {
      await this.getUsers(this.nextPage)
    }
    else return
    await this.toggleButtons()
  }

  async handlePreviousPage() {
    console.log("previous!")
    if (this.previousPage) {
      await this.getUsers(this.previousPage)
    }
    else return
    await this.toggleButtons()
  }

  async addEventListeners() {
    const previousButton = document.querySelector("#previousPageBtn");
    previousButton.addEventListener("click", this.handlePreviousPage)

    const nextButton = document.querySelector("#nextPageBtn");
    nextButton.addEventListener("click", this.handleNextPage)
  }

  removeEventListeners() {
    const previousButton = document.querySelector("#previousPageBtn");
    if (previousButton)
      previousButton.removeEventListener("click", this.handlePreviousPage)

    const nextButton = document.querySelector("#nextPageBtn");
    if (nextButton)
      nextButton.removeEventListener("click", this.handleNextPage)
  }
}
