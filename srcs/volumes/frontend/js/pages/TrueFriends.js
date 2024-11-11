import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import {
  removeSessionStorage,
  setSessionStorage,
  showModal,
} from "../Utils/Utils.js";
import CustomError from "../Utils/CustomError.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.handleRemoveFriends = this.handleRemoveFriends.bind(this);
    this.handleAddFriend = this.handleAddFriend.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/friend-list.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-profile.css");
  }

  async getHtml() {
    this.setTitle(`${this.lang.getTranslation(["title", "friends"])}`);
    const mainDiv = document.createElement("div");
    mainDiv.innerHTML = await this.getMaindiv();
    return mainDiv.innerHTML;
  }

  async addFriendRequest(friendname) {
    try {
      const username = sessionStorage.getItem("username_transcendence");
      if (username == friendname) {
        showModal(
          this.lang.getTranslation(["modal", "title", "error"]),
          this.lang.getTranslation(["modal", "message", "addYourself"]),
        );
        return;
      }
      const request = await this.makeRequest(
        `/api/users/${username}/friend/add/${friendname}/`,
        "PATCH",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        const data = await this.getDatafromRequest(response);
        showModal(
          this.lang.getTranslation(["modal", "title", "success"]),
          data.OK,
        );
        navigateTo("/friends");
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async getMaindiv() {
    let friendList = null;
    try {
      friendList = await this.getFriendList();
    } catch (error) {
      this.handleCatch(error);
      friendList = `<div class="removeElem">${this.lang.getTranslation(["Friends", "error", "failList"])}</div>`;
    }

    return `
<div class="background removeElem">
  <div class="container mt-4 removeElem">
	  <div class="bg-* text-white text-center p-3 rounded removeElem">
		  <div class="d-flex justify-content-between align-items-center removeElem">
			  <h3 class="mb-0 removeElem">${this.lang.getTranslation(["title", "friends"])}</h3>
			  <button class="btn btn-primary removeElem" data-bs-toggle="modal" data-bs-target="#addFriendModal"><i class="bi bi-person-plus"></i>
				  ${this.lang.getTranslation(["button", "addFriend"])}</button>
		  </div>
	  </div>
    ${friendList}
	</div>
 </div>
<div class="modal fade removeElem" id="addFriendModal" tabindex="-1" aria-labelledby="addFriendModalLabel" aria-hidden="true">
		  <div class="modal-dialog removeElem">
			  <div class="modal-content removeElem">
				  <div class="modal-header removeElem">
					  <h5 class="modal-title removeElem" id="addFriendModalLabel">${this.lang.getTranslation(["button", "addFriend"])}</h5>
					  <button type="button" class="btn-close removeElem" data-bs-dismiss="modal" aria-label="Close"></button>
				  </div>
				  <div class="modal-body removeElem">
					  <form id="addFriendForm" class="removeElem">
						  <div class="mb-3 removeElem">
							  <label for="friendUsername" class="form-label removeElem">${this.lang.getTranslation(
                  ["input", "preview", "username"],
                )}</label>
							  <input type="text" class="form-control removeElem" name="friendRequest" id="friendUsername" required>
						  </div>
					  </form>
				  </div>
				  <div class="modal-footer removeElem">
					  <button type="button" class="btn btn-secondary removeElem" data-bs-dismiss="modal">${this.lang.getTranslation(
              ["button", "close"],
            )}</button>
					  <button type="submit" class="btn btn-primary removeElem" form="addFriendForm"
						  id="addFriendRequest">${this.lang.getTranslation(["button", "addFriend"])}</button>
				  </div>
			  </div>
		  </div>
		</div>
`;
  }

  async getFriendList() {
    const username = sessionStorage.getItem("username_transcendence");
    let data = null;
    try {
      const request = await this.makeRequest(
        `/api/users/${username}/friend/`,
        "GET",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        data = await response.json();
        if (data.count === 0) {
          return this.noFriendDiv();
        }
      }
    } catch (error) {
      this.handleCatch(error);
      return;
    }
    const friendList = document.createElement("div");

    let friendsArray = data.results;
    const friendsHtml = friendsArray
      .map((friendJson) => this.createFriendElement(friendJson))
      .join("");
    friendList.innerHTML = friendsHtml;

    let nextPage = data.next;
    try {
      while (nextPage) {
        const request = await this.makeRequest(nextPage, "GET");
        const response = await fetch(request);
        if (await this.handleStatus(response)) {
          const pageData = await response.json();
          friendsArray = pageData.results;
          const newFriendsHtml = friendsArray
            .map((friendJson) => this.createFriendElement(friendJson))
            .join("");
          friendList.innerHTML += newFriendsHtml;
          nextPage = pageData.next;
        } else {
          break;
        }
      }
    } catch (error) {
      this.handleCatch(error);
    }
    return `<div class="list-group removeElem" id="friendList">${friendList.innerHTML}</div>`;
  }

  createFriendElement(friendJson) {
    console.log("Friend:", friendJson)
    const friendStatus = friendJson.is_online
      ? "status-online"
      : "status-offline";
    const friendAvatar = `background-image: url('${friendJson.profilePic}');`;
    console.log("AVATAR:", friendAvatar);

    return `
      <div class="list-group-item d-flex align-items-center mb3 rounded removeElem">
        <div class="removeElem rounded-circle Avatar ${friendStatus} me-3" style="${friendAvatar}" alt="Avatar"></div>
        <div class="flex-fill removeElem">
          <h5 class="mb-0 removeElem">${friendJson.username}</h5>
          <button
            class="text-decoration-none text-primary removeElem"
            data-bs-toggle="modal"
            data-bs-target="#modal${friendJson.username}"
          >
            ${this.lang.getTranslation(["button", "show"])}${this.lang.getTranslation(["title", "profile"])}
          </button>
        </div>
        <button class="btn btn-sm btn-danger ms-auto removefriend removeElem">
          <i class="bi bi-x-circle removeElem"></i> ${this.lang.getTranslation(["button", "remove"])}
        </button>
      </div>
      ${this.createFriendModal(friendJson)}
    `;
  }

  createFriendModal(friendJson) {
    console.log(friendJson);
    const modalId = `modal${friendJson.username}`;
    const modalStatus = friendJson.is_online
      ? "status-online"
      : "status-offline";

    return `
      <div class="modal fade removeElem" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered removeElem">
          <div class="modal-content removeElem">
            <div class="modal-header removeElem">
              <h5 class="modal-title removeElem" id="${modalId}Label">${friendJson.username}</h5>
              <button type="button" class="btn-close removeElem" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body removeElem">
              <div class="d-flex flex-column justify-content-center align-items-center removeElem">
                <div class="removeElem rounded-circle Avatar ${modalStatus} mb-3" style="background-image: url('${friendJson.profilePic}');"></div>
                <h3 class="removeElem">${friendJson.username}</h3>
                <p class="black-txt removeElem">${this.lang.getTranslation(["game", "winRate"])}: ${friendJson.single_games_win_rate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  noFriendDiv() {
    return `<div class="list-group removeElem" id="friendsList">
              <div class="removeElem list-group-item d-flex flex-column align-items-center justify-content-center mb-3 rounded">
                <p class="h4 removeElem">✨ <i class="removeElem">${this.lang.getTranslation(["user", "maiden"])}</i> ✨</p>
                <p class="h4 removeElem">${this.lang.getTranslation(["user", "pleaseFriend"])}</p>
              </div>
            </div>`;
  }

  async removeFriends(friendUsername) {
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest(
        `/api/users/${username}/friend/delete/${friendUsername}/`,
        "DELETE",
      );
      const response = await fetch(request);
      if (await this.handleStatus(response)) {
        console.log("response:", response);
        navigateTo("/friends");
      }
    } catch (error) {
      this.handleCatch(error);
    }
  }

  async handleRemoveFriends(ev) {
    const button = ev.currentTarget;
    const friendUsername = button
      .closest(".list-group-item")
      .querySelector("h5").textContent;

    ev.preventDefault();
    try {
      await this.removeFriends(friendUsername);
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      } else {
        console.error("handleRemoveFriends:", error);
      }
    }
  }

  async handleAddFriend(ev) {
    ev.preventDefault();
    const addFriendUsername = document.querySelector(
      "input[name='friendRequest']",
    ).value;
    try {
      await this.addFriendRequest(addFriendUsername);
    } catch (error) {
      if (error instanceof CustomError) {
        showModal(error.title, error.message);
        navigateTo(error.redirect);
      } else {
        console.error("handleAddFriend:", error);
      }
    }
  }

  async addEventListeners() {
    document.querySelectorAll(".btn-danger").forEach((button) => {
      button.addEventListener("click", this.handleRemoveFriends);
    });

    const addFriendButton = document.querySelector("#addFriendRequest");
    addFriendButton.addEventListener("click", this.handleAddFriend);
  }

  removeEventListeners() {
    const changeUsernameButton = document.querySelector("#addFriendRequest");
    if (changeUsernameButton) {
      changeUsernameButton.removeEventListener("click", this.handleAddFriend);
    }
    document.querySelectorAll(".btn-danger").forEach((button) => {
      button.removeEventListener("click", this.handleRemoveFriends);
    });
  }
}
