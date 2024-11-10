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
    this.handleSettingButton = this.handleSettingButton.bind(this);
  }

  async loadCss() {
    this.createPageCss("../css/profile.css");
    this.createPageCss("../css/battle-history.css");
    this.createPageCss("../css/background-profile.css");
  }

  async getHtml() {

  }
}
