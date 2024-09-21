import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Home");
  }

  async loadCss() {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "../css/home.css";
    linkElement.classList.add("page-css");
    document.head.appendChild(linkElement);
  }
  async getHtml() {
    return `
        <div class="container">
            <section class="home text-center p-5">
                <h1 class="welcome">Welcome to Our Pong!</h1>
                <p class="welcome-msg">Explore the depth of the Pong game, play with friends, and personalize your
                    profileas you desire!</p>
                <p class="welcome-msg">✨ Have fun! ✨</p>
            </section>
        </div>
  `;
  }

  removeCss() {
    document.querySelectorAll(".page-css").forEach((e) => {
      console.log("removing: ", e);
      e.remove();
    });
  }

  destroy() {
    this.removeCss();
  }
}

