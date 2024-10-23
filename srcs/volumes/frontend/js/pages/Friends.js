import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Friends");
  }

  async loadCss() {
    this.createPageCss("../css/friend-list.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-profile.css");
  }

  async addFriendRequest(friendname) {
    try {
      const username = sessionStorage.getItem("username_transcendence");
      const request = await this.makeRequest(
        `/api/users/${username}/friend/add/${friendname}`,
        "PATCH",
        null,
      );
      console.log("Request:", request);

      const response = await fetch(request);
      if (response.ok) {
        const data = await this.getErrorLogfromServer(response);
        this.showModalWithError("Success", data);
        navigateTo("/friends");
      } else {
        console.info("RESPONSE: ", response);
        const dataError = await this.getErrorLogfromServer(response);
        this.showModalWithError("Error", dataError);
      }
    } catch (error) {
      console.error("error makefriends:", error.message);
      this.showModalWithError("Error", error.message);
    }
  }

  async getHtml() {
    try {
      // await this.makeFriend("toi");
      // await this.makeFriend("moi");
      // await this.makeFriend("joi");
    } catch (error) {
      console.error("error making friends:", error.message);
    }
    let tokenProfile = null;
    try {
      tokenProfile = await this.getToken();
    } catch (error) {
      console.error("Error in getHtml", error.message);
      throw error;
    }
    if (tokenProfile == null) {
      console.log("token = ", tokenProfile);
      this.showModalWithError("Error", "User is not authentified");
      navigateTo("/login");
      throw new Error("Redirect to login");
    }
    const background = document.createElement("div");
    background.classList.add("background");
    const container = document.createElement("div");
    container.classList.add("container", "mt-4");
    const textDiv = document.createElement("div");
    textDiv.classList.add(
      "bg-*",
      "text-white",
      "text-center",
      "p-3",
      "rounded",
    );
    const flexDivFriend = document.createElement("div");
    flexDivFriend.classList.add(
      "d-flex",
      "justify-content-between",
      "align-items-center",
    );
    const text = document.createElement("h3");
    text.classList.add("mb-0");
    text.textContent = "Friends";
    flexDivFriend.appendChild(text);
    const addFriendButton = document.createElement("button");
    addFriendButton.classList.add("btn", "btn-primary");
    addFriendButton.setAttribute("data-bs-toggle", "modal");
    addFriendButton.setAttribute("data-bs-target", "#addFriendModal");
    addFriendButton.innerHTML = `<i class="bi bi-person-plus"></i> Add Friend`;
    flexDivFriend.appendChild(addFriendButton);
    textDiv.appendChild(flexDivFriend);
    container.appendChild(textDiv);

    this.addNewFriendModal(container);
    const list = document.createElement("div");
    list.classList.add("list-group");
    list.id = "friendsList";
    try {
      await this.createFriendList(list);
    } catch (error) {
      console.error("error", error.message);
      throw error;
    }
    container.appendChild(list);
    background.appendChild(container);
    // console.info("BACKGROUND", background.outerHTML);
    return background.outerHTML;
  }

  addNewFriendModal(container) {
    const modalFriend = document.createElement("div");
    modalFriend.classList.add("modal", "fade");
    modalFriend.id = "addFriendModal";
    modalFriend.setAttribute("tabindex", "-1");
    modalFriend.setAttribute("aria-labelledby", "addFriendModalLabel");
    modalFriend.setAttribute("aria-hidden", "true");

    modalFriend.innerHTML = `<div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="addFriendModalLabel">Add Friend</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                                            aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <form id="addFriendForm">
                                            <div class="mb-3">
                                                <label for="friendUsername" class="form-label">Enter Username</label>
                                                <input type="text" class="form-control" name="friendRequest" id="friendUsername" required>
                                            </div>
                                        </form>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary"
                                            data-bs-dismiss="modal">Close</button>
                                        <button type="submit" class="btn btn-primary" form="addFriendForm" id="addFriendRequest">Add
                                            Friend</button>
                                    </div>
                                </div>
                            </div>`;
    container.appendChild(modalFriend);
  }

  createAvatarElement(friendJson) {
    let friendStatus = "status-offline";
    if (friendJson.is_online == true) {
      friendStatus = "status-online";
    }
    const friendAvatar = document.createElement("div");
    friendAvatar.classList.add(
      "rounded-circle",
      "Avatar",
      friendStatus,
      "me-3",
    );
    friendAvatar.style = `background-image: ${friendJson.profilePic}`;
    // friendAvatar.style.backgroundImage = `url('${friendJson.profilePic}')`;
    friendAvatar.alt = "Avatar";
    return friendAvatar;
  }

  createNameElement(friendJson) {
    const friendName = document.createElement("div");
    friendName.classList.add("flex-fill");

    const textName = document.createElement("h5");
    textName.classList.add("mb-0");
    textName.textContent = friendJson.username;

    friendName.appendChild(textName);

    const nameModal = `#modal${friendJson.username}`;
    const buttonProfile = document.createElement("button");
    buttonProfile.classList.add("text-decoration-none", "text-primary");
    buttonProfile.setAttribute("data-bs-toggle", "modal");
    buttonProfile.setAttribute("data-bs-target", nameModal);
    buttonProfile.textContent = "Show Profile";

    friendName.appendChild(buttonProfile);
    return friendName;
  }

  createFriendModal(friendMainDiv, friendJson) {
    const friendModal = document.createElement("div");
    const modalId = `modal${friendJson.username}`;
    friendModal.classList.add("modal", "fade");
    friendModal.id = modalId;
    friendModal.setAttribute("tabindex", "-1");
    friendModal.setAttribute("aria-labelledby", `${modalId}Label`);
    friendModal.setAttribute("aria-hidden", "true");

    const modalDialog = document.createElement("div");
    modalDialog.classList.add("modal-dialog", "modal-dialog-centered");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const modalHeader = document.createElement("div");
    modalHeader.classList.add("modal-header");

    const modalHeaderText = document.createElement("h5");
    modalHeaderText.classList.add("modal-title");
    modalHeaderText.id = `modal${friendJson.username}Label`;
    modalHeaderText.textContent = friendJson.username;
    modalHeader.appendChild(modalHeaderText);

    const modalHeaderButton = document.createElement("button");
    modalHeaderButton.setAttribute("type", "button");
    modalHeaderButton.classList.add("btn-close");
    modalHeaderButton.setAttribute("data-bs-dismiss", "modal");
    modalHeaderButton.setAttribute("aria-label", "Close");
    modalHeader.appendChild(modalHeaderButton);

    modalContent.appendChild(modalHeader);

    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");

    const modalBodyFlex = document.createElement("div");
    modalBodyFlex.classList.add(
      "d-flex",
      "flex-column",
      "justify-content-center",
      "align-items-center",
    );

    const modalBodyAvatar = document.createElement("div");
    let onlineStatus = "status-offline";
    if (friendJson.is_online == true) onlineStatus = "status-online";
    modalBodyAvatar.classList.add(
      "rounded-circle",
      "Avatar",
      onlineStatus,
      "mb-3",
    );
    modalBodyAvatar.style = `background-image: ${friendJson.profilePic}`;
    modalBodyFlex.appendChild(modalBodyAvatar);

    const modalBodyName = document.createElement("h3");
    modalBodyName.textContent = friendJson.username;
    modalBodyFlex.appendChild(modalBodyName);

    const modalBodyText = document.createElement("p");
    modalBodyText.classList.add("black-txt");
    modalBodyText.textContent = `Win Rate: ${friendJson.single_games_win_rate}`;
    modalBodyFlex.appendChild(modalBodyText);

    modalBody.appendChild(modalBodyFlex);
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    friendModal.appendChild(modalDialog);
    friendMainDiv.appendChild(friendModal);
    console.log("Created modal:", friendModal);
  }

  createFriendElement(friendMainDiv, friendJson) {
    const friendListGroup = document.createElement("div");
    friendListGroup.classList.add(
      "list-group-item",
      "d-flex",
      "align-items-center",
      "mb3",
      "rounded",
    );
    // const friendAvatar = this.createAvatarElement(friendJson);
    friendListGroup.appendChild(this.createAvatarElement(friendJson));

    // const friendName = this.createNameElement(friendJson);
    friendListGroup.appendChild(this.createNameElement(friendJson));

    const buttonRemoveFriend = document.createElement("button");
    buttonRemoveFriend.classList.add(
      "btn",
      "btn-sm",
      "btn-danger",
      "ms-auto",
      "removefriend",
    );
    buttonRemoveFriend.innerHTML = '<i class="bi bi-x-circle"></i> Remove';
    friendListGroup.appendChild(buttonRemoveFriend);

    friendMainDiv.appendChild(friendListGroup);
    console.log("FRIENDLISTGROUP: ", friendListGroup);
  }

  createFriendMainDiv(friendList, friendJson) {
    const friendMainDiv = document.createElement("div");
    this.createFriendElement(friendMainDiv, friendJson);
    this.createFriendModal(friendMainDiv, friendJson);
    friendList.appendChild(friendMainDiv);
    console.log("FRIENDLISTEND:", friendList);
  }

  forLoopArray(friendsArray, friendList) {
    for (let indexArray = 0; indexArray < friendsArray.length; indexArray++) {
      const userJson = friendsArray[indexArray];
      console.log("friendJson:", userJson);
      this.createFriendMainDiv(friendList, userJson);
    }
  }

  noFriendDiv(friendList) {
    friendList.innerHTML = `<div class="list-group-item d-flex flex-column align-items-center justify-content-center mb-3 rounded">
                                <p class="h4">✨ <i>Maidenless</i> ✨</p>
                                
                                <p class="h4">Please, add friends</p>
                            </div>`;
  }

  async createFriendList(friendList) {
    const username = sessionStorage.getItem("username_transcendence");
    let data = null;
    try {
      const request = await this.makeRequest(
        `/api/users/${username}/friend/`,
        "GET",
        null,
      );
      const response = await fetch(request);

      if (!response.ok) {
        console.log("response: ", response);
        return;
      }
      data = await response.json();
      console.log("data:", data);
      if (data.count == 0) {
        console.log("LOL NO FRIENDS");
        this.noFriendDiv(friendList);
        return;
      }
    } catch (error) {
      console.error("error in friendlist: ", error.message);
      console.trace();
    }

    let friendsArray = data.results;
    // console.log("FRIENDARRAY:", friendsArray);

    this.forLoopArray(friendsArray, friendList);
    let nextPage = data.next;
    while (nextPage) {
      try {
        const request = await this.makeRequest(nextPage, "GET", null);
        const response = await fetch(request);
        if (response.ok) {
          const pageData = await response.json();
          friendsArray = pageData.results; // Fetch new results
          this.forLoopArray(friendsArray, friendList); // Append new friends
          nextPage = pageData.next; // Update next page
        } else {
          const log = await this.getErrorLogfromServer(response);
          console.log(log);
          break;
        }
      } catch (error) {
        console.error("Error fetching next page:", error.message);
        break;
      }
    }
  }

  async removeFriends(friendUsername) {
    console.log("Removing:", friendUsername);
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest(
        `/api/users/${username}/friend/delete/${friendUsername}`,
        "DELETE",
        null,
      );
      const response = await fetch(request);
      if (response.ok) {
        console.log("Removed friend:", friendUsername);
        console.log("response:", response);
        navigateTo("/friends");
      } else {
        console.log("response:", response);
      }
    } catch (error) {
      console.error("Error in removeFriends: ", error.message);
    }
  }

  async addEventListeners() {
    document.querySelectorAll(".btn-danger").forEach((button) => {
      button.addEventListener("click", async (ev) => {
        const friendUsername = button
          .closest(".list-group-item")
          .querySelector("h5").textContent;
        console.log("Removing:", friendUsername);
        ev.preventDefault();
        try {
          await this.removeFriends(friendUsername);
        } catch (error) {
          console.error("Error In remove Button: ", error.message);
        }
      });
    });
    const addFriendButton = document.querySelector("#addFriendRequest");
    addFriendButton.addEventListener("click", async (ev) => {
      ev.preventDefault();
      const addFriendUsername = document.querySelector(
        "input[name='friendRequest']",
      ).value;
      try {
        await this.addFriendRequest(addFriendUsername);
      } catch (error) {
        console.error("Error in Request Friend", error.message);
      }
    });
  }

  removeEventListeners() {
    const changeUsernameButton = document.querySelector("#changeUsername");
    if (changeUsernameButton) {
      changeUsernameButton.removeEventListener("click", this.changeUsername);
    }
  }

  removeCss() {
    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.remove();
    });
  }

  destroy() {
    this.cleanModal();
    this.removeEventListeners();
    this.removeCss();
  }
}
