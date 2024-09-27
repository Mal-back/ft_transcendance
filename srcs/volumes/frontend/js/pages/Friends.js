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

  async makeFriend() {
    try {
      const username = sessionStorage.getItem("username_transcendence");
      let friendname = "moi";
      if (username == "moi") friendname = "toi";
      const request = this.makeRequest(
        `/api/users/${username}/friend/add/${friendname}`,
        "PATCH",
        null,
      );
      console.log("FWUFBWUFWBU");
      console.log("Request:", request);

      const response = await fetch(request);
      if (response.ok) {
        // const data = await response.json();
        console.log("response", response);
      } else {
        console.log("response", response);
      }
    } catch (error) {
      console.error("error makefriends:", error.message);
    }
  }

  async getHtml() {
    try {
      await this.makeFriend();
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
    const htmlContent = `
            <div class="background">
              <div class="container mt-4">
                <!-- Search Bar -->
                  <div class="bg-* text-white text-center p-3 rounded">
                   <h3 class="mb-0">Friends</h3>
                  </div>
                  <div class="list-group" id="friendsList">
                  </div>
              </div>
            </div>
            `;
    document.querySelector("#app").innerHTML = htmlContent;
    try {
      await this.createFriendList();
    } catch (error) {
      console.error("error", error.message);
      throw error;
    }
    return htmlContent;
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

    friendModal.appendChild(modalHeader);

    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");

    const modalBodyFlex = document.createElement("div");
    modalBodyFlex.classList.add(
      "d-flex",
      "flex-column",
      "justify-content-center",
      "align-items-center",
    );

    const modalBodyAvatar = document.create("div");
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
    friendMainDiv.appendChild(modalBody);
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
  }

  async createFriendMainDiv(friendList, friendUsername) {
    const friendMainDiv = document.createElement("div");
    const request = this.makeRequest(
      `/api/users/${friendUsername}`,
      "GET",
      null,
    );

    try {
      const response = await fetch(request);
      if (response.ok) {
        const friendJson = await response.json();

        this.createFriendElement(friendMainDiv, friendJson);
        this.createFriendModal(friendMainDiv, friendJson);
        friendList.appendChild(friendMainDiv);
      } else {
        console.error(`Error in fetching info on ${friendUsername}`);
      }
    } catch (error) {
      console.error(`Error in fetching info on ${friendUsername}`);
    }
  }

  async createFriendList() {
    const friendList = document.querySelector("#friendsList");
    const username = sessionStorage.getItem("username_transcendence");
    try {
      const request = await this.makeRequest(
        `/api/users/${username}/friend/`,
        "GET",
        null,
      );
      const response = await fetch(request);

      if (response.ok) {
        const data = await response.json();
        console.log("data:", data);
        if (data.count == 0){
          console.log("LOL NO FRIENDS");
          friendList.textContent = "No Friends :(";
          return ;
        }
        const friendsArray = Object.values(data).map((value) => [value]);
        console.log("friendsArray = ", friendsArray);
        console.log("first friend = ", friendsArray[0]);
        await this.createFriendMainDiv(friendList, friendsArray[0]);
      } else {
        console.log("response: ", response);
      }
    } catch (error) {
      console.error("error in friendlist: ", error.message);
      console.trace();
    }
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
