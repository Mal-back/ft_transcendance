import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle("Simple Form");
  }
  async getHtml() {
    return `<form id="createUser">
      <label for="username">Username: </label>
      <input type="text" name="username" required>
      <label for="email">Email: </label>
      <input type="email" name="email" required>
      <label for="password">Password: </label>
      <input type="password" name="password" required>
      <br>
      <input type="submit" value="Create account">
    </form>
    <script src="./form.js"></script>
  `}
}
