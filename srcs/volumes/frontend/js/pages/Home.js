import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Home");
  }

  async loadCss() {
    this.createPageCss("../css/home.css");
  }
  async getHtml() {
    return `
        <div class="background">
          <div class="container">
              <section class="home text-center p-5">
                  <h1 class="welcome">Welcome to Our Pong!</h1>
                  <p class="welcome-msg">Explore the depth of the Pong game, play with friends, and personalize your
                      profileas you desire!</p>
                  <p class="welcome-msg">✨ Have fun! ✨</p>
              </section>
          </div>
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

