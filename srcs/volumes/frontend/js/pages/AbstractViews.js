export default class {
  constructor() {}

  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  addEventListeners() {
    // Intentionally left blank, to be optionally overridden by derived classes
  }
}
