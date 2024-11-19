import { closeModal, showModal } from "./Utils.js";

export default class CustomError extends Error {
  constructor(modalTitle, modalMessage, redirect) {
    super(modalMessage);
    this.modalTitle = modalTitle;
    this.redirect = redirect;
    // this.modalMessage = modalMessage;
    // Error.captureStackTrace(this, this.constructor);
  }

  showModalCustom() {
    showModal(this.modalTitle, this.message);
  }
}
