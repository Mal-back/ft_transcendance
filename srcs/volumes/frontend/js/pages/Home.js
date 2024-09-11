import AbstractView from "./AbstractViews.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Home");
  }
  async getHtml() {
    return `<p>This is the Home</p>
  `}
}
