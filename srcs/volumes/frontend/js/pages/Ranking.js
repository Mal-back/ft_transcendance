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
      const data = await this.getAllUsers();
      const pages = await this.getPagination(data);
      const ranking = await this.getRanking(data);
      const html_content = `
<div class="background ">
  <h1 class="mt-20 text-center white-txt text-decoration-underline" id="GameTitle">
      REMOTE - CONNECT 4 - GLOBAL RANKING</h1>
  <br>
  <div class="tournament-creation ranking">
      <div class=" text-center text-white  rounded">
          <h4 class="form-label text-decoration-underline" id="SelectPlayersTitle">Search Player:</h4>
          <div class="input-group mb-3">
              <input type="search" class="form-control" placeholder="Search"
                  aria-label="Recipient's username" aria-describedby="basic-addon2">
              <div class="input-group-append">
                  <button class="btn btn-outline-primary" type="submit"><i
                          class="bi bi-search"></i></button>
              </div>
          </div>
      </div>
  </div>
  <h5 class="form-label text-center text-white text-decoration-underline" id="Page-index-title">
      Page 1</h5>
  <div class="tournament-creation list-group ranking">
      <div class="list-group-item d-flex align-items-center justify-content-between rounded w-100">
          <div class="d-flex align-items-center">
              <div class="ranking-number-fake">
                  RANK
              </div>
              <div class="Avatar-Fake me-3"></div>
              <div class="flex-fill">
                  <h5 class="mb-0">USERNAME</h5>
              </div>
          </div>
          <div class="score">WIN RATE
          </div>
      </div>
  </div>
  <div class="tournament-creation list-group ranking" style="max-height: 40vh;">

  <div class="list-group-item d-flex align-items-center justify-content-between rounded w-100">
      <div class="d-flex align-items-center">
          <div class="ranking-number gold">1</div>
          <div class="Avatar status-online me-3"></div>
          <div class="flex-fill">
              <h5 class="mb-0">USERNAMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE</h5>
          </div>
      </div>
      <div class="score">
          <span>Played : 2</span>
          <br>
          <span>WR: 50%</span>
      </div>
  </div>
</div>
  <br>
  <div class="d-flex justify-content-center align-items-center">
      <nav aria-label="...">
          <ul class="pagination">
              <li class="page-item disabled">
                  <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
              </li>
              <li class="page-item active" aria-current="page"><a class="page-link" href="#">1</a>
              </li>
              <li class="page-item"><a class="page-link" href="#">2</a></li>
              <li class="page-item"><a class="page-link" href="#">3</a></li>
              <li class="page-item"><a class="page-link" href="#">...</a></li>
              <li class="page-item"><a class="page-link" href="#">10</a></li>
              <li class="page-item">
                  <a class="page-link" href="#">Next</a>
              </li>
          </ul>
      </nav>
  </div>
</div>
              `;
      return html_content;
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async getAllUsers() {
    try {
      const request = await this.makeRequest("/api/users/");
    } catch (error) {
      this.handleCatch(error);
    }
  }
}
