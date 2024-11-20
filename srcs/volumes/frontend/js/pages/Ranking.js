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
    this.rank = 0;
    this.nextPage = undefined;
    this.previousPage = undefined;
    this.handleNextPage = this.handleNextPage.bind(this);
    this.handlePreviousPage = this.handlePreviousPage.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/game-menu-buttons.css");
    this.createPageCss("../css/margin.css");
    this.createPageCss("../css/ranking/global-ranking-remote.css");
  }

  async getHtml() {
    try {
      this.setTitle(`${this.lang.getTranslation(["title", "ranking"])}`);
      const users = await this.getAllUsers();
      const [html, modalhtml] = this.getHTMLallUsers(users);
      const modalsBattleHistory = await this.getAllHistoryModals(users);
      const html_content = `
<div class="removeElem background ">
    <h1 class="removeElem mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
        REMOTE - CONNECT 4 - GLOBAL RANKING</h1>
    <br>
    <div class="removeElem tournament-creation ranking">
        <div class="removeElem  text-center text-white  rounded">
            <h4 class="removeElem form-label text-decoration-underline" id="SelectPlayersTitle">Search Player:</h4>
            <div class="removeElem input-group mb-3">
                <input id="searchPlayerInput" type="search" class="removeElem form-control" placeholder="Search"
                    aria-label="Recipient's username" aria-describedby="basic-addon2">
                <div class="removeElem input-group-append">
                    <button id="searchPlayerButton" class="removeElem btn btn-outline-primary" type="submit"><i
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
                    ${this.lang.getTranslation(["title", "rank"]).toUpperCase()}
                </div>
                <div class="removeElem Avatar-Fake me-3"></div>
                <div class="removeElem flex-fill">
                    <h5 class="removeElem mb-0">${this.lang.getTranslation(["input", "label", "username"]).toUpperCase()}</h5>
                </div>
            </div>
            <div class="removeElem score">${this.lang.getTranslation(["title", "gamesPlayed"])}
            </div>
        </div>
    </div>
    <div id="rankingUsers" class="removeElem tournament-creation list-group ranking" style="max-height: 40vh;">
        ${html}
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
<div id="modalsRanking" class="removeElem">${modalhtml}${modalsBattleHistory}</div>
              `;
      return html_content;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  getHTMLforUser(rank, username, avatar, gamesPlayed, status) {
    let color = "black"
    if (rank == 1) color = "gold"
    else if (rank == 2) color = "silver"
    else if (rank == 3) color = "bronze"
    return `
    <div class="removeElem list-group-item d-flex align-items-center justify-content-between rounded w-100">
        <div class="removeElem d-flex align-items-center">
            <div class="removeElem ranking-number ${color}">${rank}</div>
            <div class="removeElem Avatar ${status} me-3" style="background-image: url(${avatar});"></div>
            <div class="removeElem flex-fill">
                <h5 class="removeElem username mb-0" data-bs-toggle="modal"
                    data-bs-target="#${username}History">${username}</h5>
            </div>
        </div>
        <div class="removeElem score">
            <span>${this.lang.getTranslation(["title", "played"])} : ${gamesPlayed}</span>
        </div>
    </div>
    `
  }

  toggleButtons() {
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
    let data = [];
    for (let rank = 0; rank < players.length; rank++) {
      const username = players[rank].username
      if (username == "deleted_account") continue;
      const user_info = await this.getUserInfo(username)
      data.push(user_info)
    }
    console.log("All users =>", data);
    return data
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
      return await this.getAllUserData(playersArray)
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
      return await this.getAllUserData(playersArray)
    } catch (error) {
      this.handleCatch(error);
    }
  }


  async createMatchElement(data, userData) {
    try {
      const boolWin = userData.username == data.winner ? true : false;
      const opponentName = boolWin ? data.looser : data.winner;
      const opponentInfo = await this.getUserInfo(opponentName);
      const color = boolWin ? "bg-dark" : "bg-gray";
      let lostWin = boolWin
        ? this.lang.getTranslation(["game", "won"]).toUpperCase()
        : this.lang.getTranslation(["game", "lost"]).toUpperCase();
      lostWin += "-";
      lostWin = boolWin
        ? this.lang.getTranslation(["game", "won"]).toUpperCase()
        : this.lang.getTranslation(["game", "lost"]).toUpperCase();
      return `
  <div class="${color} text-white text-center px-3 py-1 mb-1 rounded">
    <div class="d-flex justify-content-around align-items-center">
      <div class="text-center player-container">
        <div class="player-circle mx-auto mb-2" style="background-image: url('${userData.profilePic}')"></div>
        <div class="player-name">
          <span>${userData.username}</span>
        </div>
      </div>
      <div class="text-center match-info">
        <h5>${lostWin}</h5> 
        <h4>${boolWin ? data.winner_points : data.looser_points} - ${boolWin ? data.looser_points : data.winner_points}</h4>
        <p id="matchDate">${formateDate(data.played_at)}</p>
      </div>
        <div class="text-center player-container">
          <div class="player-circle mx-auto mb-2" style="background-image: url('${opponentInfo.profilePic}')"></div>
          <div class="player-name">
            <span>${opponentName}</span>
          </div>
        </div>
      </div>
    </div> 
          `;
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }

  async createTournamentElement(data, userData) {
    try {
      const color = "bg-midnightblue";
      const rank = data.final_ranking.findIndex(user => user.username === userData.username) + 1;
      console.log("getRank =>", data.final_ranking)
      const total_ranks = data.final_ranking.length;
      return `
  <div class="${color} text-white text-center px-3 py-1 mb-1 rounded">
    <div class="d-flex justify-content-around align-items-center">
      <div class="text-center player-container mt-1">
        <div class="player-circle mx-auto mb-2" style="background-image: url('${userData.profilePic}')"></div>
        <div class="player-name">
          <span>${userData.username}</span>
        </div>
      </div>
      <div class="text-center match-info mt-1">
          <h4 style="margin-bottom: 0;">${this.lang.getTranslation(["title", "rank"]).toUpperCase()}: ${rank} / ${total_ranks}</h4>
          <button class="btn text-decoration-none text-white color text-decoration-underline"
            style="cursor: text; user-select: text; border: none; background: none;">
            ${formateDate(data.played_at)}
          </button>
      </div>
      </div>
    </div> 
          `;
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }

  async getMatchHistory(userData, endpoint) {
    const mainDiv = document.createElement("div");
    try {
      const mainRequest = await this.makeRequest(endpoint);
      const mainResponse = await fetch(mainRequest);
      if (await this.handleStatus(mainResponse)) {
        const data = await this.getDatafromRequest(mainResponse);
        // console.log("matchHistory: data:", data);

        let matchesArray = data.results;
        const matchesHTMLArray = await Promise.all(
          matchesArray.map((matchData) =>
            this.createMatchElement(matchData, userData),
          ),
        );
        mainDiv.innerHTML = matchesHTMLArray.join("");
        let nextPage = data.next;
        while (nextPage) {
          const request = await this.makeRequest(nextPage, "GET");
          const response = await fetch(request);
          if (await this.handleStatus(response)) {
            const pageData = await response.json();
            matchesArray = pageData.results;
            const newMatchHtmlArray = await Promise.all(
              matchesArray.map((matchData) =>
                this.createMatchElement(matchData, userData),
              ),
            );
            mainDiv.innerHTML += newMatchHtmlArray.join("");
            nextPage = pageData.next;
          } else {
            break;
          }
        }
        return mainDiv.innerHTML;
      }
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }


  async getTournamentHistory(user, endpoint) {
    const mainDiv = document.createElement("div");
    try {
      const mainRequest = await this.makeRequest(endpoint);
      const mainResponse = await fetch(mainRequest);
      if (await this.handleStatus(mainResponse)) {
        const data = await this.getDatafromRequest(mainResponse);

        let matchesArray = data.results;
        const matchesHTMLArray = await Promise.all(
          matchesArray.map((matchData) =>
            this.createTournamentElement(matchData, user),
          ),
        );
        mainDiv.innerHTML = matchesHTMLArray.join("");
        let nextPage = data.next;
        while (nextPage) {
          const request = await this.makeRequest(nextPage, "GET");
          const response = await fetch(request);
          if (await this.handleStatus(response)) {
            const pageData = await response.json();
            matchesArray = pageData.results;
            const newMatchHtmlArray = await Promise.all(
              matchesArray.map((matchData) =>
                this.createTournamentElement(matchData, user),
              ),
            );
            mainDiv.innerHTML += newMatchHtmlArray.join("");
            nextPage = pageData.next;
          } else {
            break;
          }
        }
        return mainDiv.innerHTML;
      }
    } catch (error) {
      this.handleCatch(error);
      return "";
    }
  }

  async getAllHistoryModals(users) {
    try {
      let history = "";
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        if (user.username == "user0") {
          console.log("DATA USER1", user)
          console.log("WR single games =>", user.single_games_c4_win_rate * 100, user.single_games_pong_win_rate * 100)
        }

        let singleGamesC4 = user.single_games_c4_win_rate * 100;
        let singleGamesPong = user.single_games_pong_win_rate * 100;
        let tournamentGamesC4 = user.tournament_c4_win_rate * 100;
        let tournamentGamesPong = user.tournament_pong_win_rate * 100;
        if (user.total_single_games_c4 == 0) singleGamesC4 = undefined
        if (user.total_single_games_pong == 0) singleGamesPong = undefined
        if (user.total_tournaments_c4 == 0) tournamentGamesC4 = undefined
        if (user.total_tournaments_pong == 0) tournamentGamesPong = undefined

        let fillModalMatchPong = await this.getMatchHistory(user, user.pong_matches);
        if (!fillModalMatchPong)
          fillModalMatchPong = `<p class="text-center">${this.lang.getTranslation(["game", "n/a"])}</p>`;

        let fillModalMatchC4 = await this.getMatchHistory(user, user.c4_matches);
        if (!fillModalMatchC4)
          fillModalMatchC4 = `<p class="text-center">${this.lang.getTranslation(["game", "n/a"])}</p>`;

        let fillModalTournamentPong = await this.getTournamentHistory(user, user.pong_tournaments);
        if (!fillModalTournamentPong)
          fillModalTournamentPong = `<p class="text-center">${this.lang.getTranslation(["game", "n/a"])}</p>`;

        let fillModalTournamentC4 = await this.getTournamentHistory(user, user.c4_tournaments);
        if (!fillModalTournamentC4)
          fillModalTournamentC4 = `<p class="text-center">${this.lang.getTranslation(["game", "n/a"])}</p>`;

        const modalPong = this.getModalPong(user.username, fillModalMatchPong, fillModalTournamentPong, singleGamesPong, tournamentGamesPong);
        const modalC4 = this.getModalC4(user.username, fillModalMatchC4, fillModalTournamentC4, singleGamesC4, tournamentGamesC4);
        history += modalPong + modalC4;
      }
      return history
    } catch (error) {
      this.handleCatch(error);
    }

  }

  getUserChooseHistoryModal(username) {
    const battleHistory =
      this.lang.getTranslation(["game", "battle"]) +
      " " +
      this.lang.getTranslation(["game", "history"]);
    return `
    <div class="modal fade" id="${username}History" tabindex="-1" aria-labelledby="${username}HistoryLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content ">
                <div class="modal-header">
                    <h5 class="modal-title" id="${username}HistoryLabel">${battleHistory}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body d-flex justify-content-center">
                    <!-- Buttons without data-bs-toggle and data-bs-target -->
                    <button type="button" class="btn btn-danger white-txt"
                    data-bs-toggle="modal"
                    data-bs-target="#pongBattleHistoryModal${username}"
                        style="margin-right: 3px;">
                        ${this.lang.getTranslation(["title", "pong"])} ${this.lang.getTranslation(["game", "history"])}
                    </button>
                    <button type="button" class="btn btn-secondary white-txt" 
                    data-bs-toggle="modal"
                    data-bs-target="#connect4BattleHistoryModal${username}">
                        ${this.lang.getTranslation(["title", "c4"])} ${this.lang.getTranslation(["game", "history"])}
                    </button>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    `;
  }

  getHTMLallUsers(data) {
    let usersHTML = "";
    let usersModal = "";
    for (let index = 0; index < data.length; index++) {
      const userRank = index + 1 + (this.rank * 10);
      const username = data[index].username;
      const avatar = data[index].profilePic;
      const total = data[index].total_single_games_c4 + data[index].total_single_games_pong + data[index].total_tournaments_c4 + data[index].total_tournaments_pong;
      const status = data[index].is_online ? "status-online" : "status-offline";
      const html = this.getHTMLforUser(userRank, username, avatar, total, status)
      usersHTML += html;
      if (username == "user1")
        console.log("What's inside?", data[index])
      const htmlModal = this.getUserChooseHistoryModal(username);
      usersModal += htmlModal;
    }
    return [usersHTML, usersModal];
  }

  async handleNextPage() {
    console.log("next!")
    if (this.nextPage) {
      try {
        this.rank += 1;
        const data = await this.getUsers(this.nextPage)
        const [html, modalhtml] = this.getHTMLallUsers(data);
        const history = await this.getAllHistoryModals(data);
        let ranking = document.getElementById("rankingUsers");
        ranking.innerHTML = "";
        ranking.innerHTML = html;
        let modals = document.getElementById("modalsRanking");
        modals.innerHTML = "";
        modals.innerHTML = modalhtml + history;
        // console.log("ENDHTML =>", history);
      } catch (error) {
        if (error instanceof CustomError) {
          error.showModalCustom();
          navigateTo(error.redirect);
        } else {
          console.error("handleNextPage", error);
        }
      }
    }
    else return
    this.toggleButtons()
  }

  async handlePreviousPage() {
    console.log("previous!")
    if (this.previousPage) {
      try {
        this.rank -= 1;
        const data = await this.getUsers(this.previousPage);
        const [html, modalhtml] = this.getHTMLallUsers(data);
        const history = await this.getAllHistoryModals(data);
        // console.log("ENDHTML =>", html);
        let ranking = document.getElementById("rankingUsers");
        ranking.innerHTML = "";
        ranking.innerHTML = html;
        let modals = document.getElementById("modalsRanking");
        modals.innerHTML = "";
        modals.innerHTML = modalhtml + history;
      } catch (error) {
        if (error instanceof CustomError) {
          error.showModalCustom();
          navigateTo(error.redirect);
        } else {
          console.error("handlePrevousPage", error);
        }
      }
    }
    else return
    this.toggleButtons()
  }

  async searchUser(username) {
    const request = await this.makeRequest(`/api/users/${username}/`, "GET");
    const response = await fetch(request);
    let data = null;
    if (await this.handleStatus(response))
      data = await this.getDatafromRequest(response);
    if (data == null) {
      throw new CustomError(
        `${this.lang.getTranslation(["modal", "title", "error"])}`,
        `${username} ${this.lang.getTranslation(["input", "error", "unknown"])}`,
        "/rankings",
      );
    }
    return data
  }

  async handleSearch(ev) {
    ev.preventDefault(); const input = document.getElementById("searchPlayerInput")
    const name_to_find = input.value.trim();
    if (name_to_find == "deleted_account") {
      showModal(
        this.lang.getTranslation(["modal", "title", "error"]),
        this.lang.getTranslation(["modal", "message", "user_does_not_exist"]),
      );
      return;
    }
    try {
      const user = await this.searchUser(name_to_find)
      const modalTry = document.getElementById(`${name_to_find}History`);
      if (modalTry) {
        const myModal = new bootstrap.Modal(modalTry);
        myModal.show();
      }
      else {
        // console.log("idiot")
        const [, modalhtml] = this.getHTMLallUsers([user]);
        const modalsBattleHistory = await this.getAllHistoryModals([user]);
        let modals = document.getElementById("modalsRanking");
        modals.innerHTML += modalhtml + modalsBattleHistory;
        const modal = document.getElementById(`${name_to_find}History`);
        const myModal = new bootstrap.Modal(modal);
        myModal.show();
      }
    } catch (error) {
      if (error instanceof CustomError) {
        error.showModalCustom();
        if (error.message !== `${name_to_find} ${this.lang.getTranslation(["input", "error", "unknown"])}`)
          navigateTo(error.redirect)
      } else {
        console.error("handleSearch", error);
      }
    }
  }

  async addEventListeners() {
    const previousButton = document.querySelector("#previousPageBtn");
    previousButton.addEventListener("click", this.handlePreviousPage)

    const nextButton = document.querySelector("#nextPageBtn");
    nextButton.addEventListener("click", this.handleNextPage)

    const searchButton = document.querySelector("#searchPlayerButton");
    searchButton.addEventListener("click", this.handleSearch);
  }

  removeEventListeners() {
    const previousButton = document.querySelector("#previousPageBtn");
    if (previousButton)
      previousButton.removeEventListener("click", this.handlePreviousPage)

    const nextButton = document.querySelector("#nextPageBtn");
    if (nextButton)
      nextButton.removeEventListener("click", this.handleNextPage)

    const searchButton = document.querySelector("#searchPlayerButton");
    if (searchButton)
      searchButton.removeEventListener("click", this.handleSearch);

  }

  getModalC4(username, remoteBattlesC4, remoteTournamentsC4, rmBattles, rmTournaments) {
    const singleGames = rmBattles !== undefined ? `<div class="text-center">${this.lang.getTranslation(["game", "winRate"])}: ${rmBattles}%</div>` : ""
    const tournamentGames = rmTournaments !== undefined ? `<div class="text-center">${this.lang.getTranslation(["game", "winRate"])}: ${rmTournaments}%</div>` : ""
    const battleHistory =
      this.lang.getTranslation(["game", "battle"]) +
      " " +
      this.lang.getTranslation(["game", "history"]);
    return `
<div class="modal fade" id="connect4BattleHistoryModal${username}" tabindex="-1"
    aria-labelledby="connect4BattleHistoryModal${username}Label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-80 modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${this.lang.getTranslation(["title", "c4"])} ${battleHistory}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body overflow-auto" style="max-height: 60vh;">
                <div class="row justify-content-center align-items-start">
                    <div class="col-6">
                        <h5 class="text-center mb-3">${this.lang.getTranslation(["title", "remote"])} ${this.lang.getTranslation(["game", "battle"])}:</h5>
                        <div class="box bg-light history">
                            ${remoteBattlesC4}
                        </div>
                    </div>
                    <div class="col-6">
                        <h5 class="text-center mb-3">${this.lang.getTranslation(["title", "remote"])} ${this.lang.getTranslation(["title", "tournament"])}:</h5>
                        <div class="box bg-light history">
                            ${remoteTournamentsC4}
                        </div>
                    </div>
                </div>
                <div class="row justify-content-center align-items-start">
                    <div class="col-6">
                      ${singleGames}
                    </div>
                    <div class="col-6">
                      ${tournamentGames}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
    `
  }

  getModalPong(username, remoteBattlesPong, remoteTournamentsPong, rmBattles, rmTournaments) {
    const singleGames = rmBattles !== undefined ? `<div class="text-center">${this.lang.getTranslation(["game", "winRate"])}: ${rmBattles}%</div>` : ""
    const tournamentGames = rmTournaments !== undefined ? `<div class="text-center">${this.lang.getTranslation(["game", "winRate"])}: ${rmTournaments}%</div>` : ""
    const battleHistory =
      this.lang.getTranslation(["game", "battle"]) +
      " " +
      this.lang.getTranslation(["game", "history"]);
    return `
<div class="modal fade" id="pongBattleHistoryModal${username}" tabindex="-1"
    aria-labelledby="pongBattleHistoryModal${username}Label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-80 modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${this.lang.getTranslation(["title", "pong"])} ${battleHistory}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body overflow-auto" style="max-height: 70vh;">
                <div class="row justify-content-center align-items-start">
                    <div class="col-6">
                        <h5 class="text-center mb-3">${this.lang.getTranslation(["title", "remote"])} ${this.lang.getTranslation(["game", "battle"])}:</h5>
                        <div class="box bg-light history">
                            ${remoteBattlesPong}
                        </div>
                    </div>
                    <div class="col-6">
                        <h5 class="text-center mb-3">${this.lang.getTranslation(["title", "remote"])} ${this.lang.getTranslation(["title", "tournament"])}:</h5>
                        <div class="box bg-light history">
                            <!-- match div -->
                            ${remoteTournamentsPong}
                        </div>
                    </div>
                </div>
                <div class="row justify-content-center align-items-start">
                    <div class="col-6">
                      ${singleGames}
                    </div>
                    <div class="col-6">
                      ${tournamentGames}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
    `
  }

}
