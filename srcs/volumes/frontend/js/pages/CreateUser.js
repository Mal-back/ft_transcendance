import { navigateTo } from "../router.js";
import { showModal } from "../Utils/Utils.js";
import AbstractView from "./AbstractViews.js";
import CustomError from "../Utils/CustomError.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.handleSubmitNewUser = this.handleSubmitNewUser.bind(this);
        this.handleInputUsername = this.handleInputUsername.bind(this);
        this.handleInputPassword = this.handleInputPassword.bind(this);
        this.handleInputMail = this.handleInputMail.bind(this);
        this.handleOpenPrivacyPolicy = this.handleOpenPrivacyPolicy.bind(this);
        this.handleOpenTermsOfUse = this.handleOpenTermsOfUse.bind(this);
    }

    async loadCss() {
        this.createPageCss("../css/create-user.css");
    }

    async makeUsers() {
        const user = "user";
        for (let index = 0; index < 4; index++) {
            let username = `${user}${index}`;
            await this.submitNewUser(
                `${username}`,
                `${username}@google.com`,
                `${username}`,
                `${username}`,
            );
            console.log(`${username} created`);
        }
    }

    async getHtml() {
        await this.makeUsers();
        this.setTitle(`${this.lang.getTranslation(["title", "createProfile"])}`);
        return `
      <div class="background createUser removeElem">
        <div class="p-5 bg-* removeElem">
            <div class="black-txt bg-form create-user-form p-4 removeElem">
                <h1 class="mb-3 text-center create-user-title text-decoration-underline removeElem">${this.lang.getTranslation(["title", "createProfile"])}</h1>
                <form id="createUser" class="removeElem">
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Username">${this.lang.getTranslation(["input", "label", "username"])}:</label>
                        <input class="form-control removeElem" name="UsernameUser" id="Username" type="text">
                        <div id="usernameError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Mail">${this.lang.getTranslation(["input", "label", "email"])}:</label>
                        <input class="form-control removeElem" name="MailUser" id="Mail" type="text">
                        <div id="mailError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Password">${this.lang.getTranslation(["input", "label", "password"])}:</label>
                        <input class="form-control removeElem" name="PasswordUser" id="Password" type="password" autocomplete="off">
                        <div id="passwordError" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="form-group removeElem">
                        <label class="removeElem" for="Password-2">${this.lang.getTranslation(["input", "label", "confirm"])} ${this.lang.getTranslation(["input", "label", "password"])}:</label>
                        <input class="form-control removeElem" name="Password-2User" id="Password-2" type="password" autocomplete="off">
                        <div id="password2Error" class="removeElem"></div>
                    </div>
                    <br>
                    <div class="removeElem form-check mb-3">
                      <input class="removeElem form-check-input" type="checkbox" id="agreeToTerms" required>
                      <label class="removeElem form-check-label" for="agreeToTerms">
                        ${this.lang.getTranslation(["policy", "readAndAgree"])} <a href="#" data-bs-toggle="modal" data-bs-target="#legalMentions">${this.lang.getTranslation(["policy", "legalMentions"])}</a>.
                      </label>
                    </div>
                    <button id="createUserButton" type="submit" class="btn bg-silver removeElem">${this.lang.getTranslation(["title", "createProfile"])}</button>
                    <br>
                </form>
            </div>
        </div>
      </div>
      <div class="modal fade" id="legalMentions" tabindex="-1" aria-labelledby="legalMentionsLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content ">
                  <div class="modal-header">
                      <h5 class="modal-title" id="legalMentionsLabel">${this.lang.getTranslation(["policy", "legalMentions"])}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body d-flex justify-content-center">
                      <!-- Buttons without data-bs-toggle and data-bs-target -->
                      <button type="button" class="btn btn-danger white-txt" id="openPrivacyPolicyBtn"
                          style="margin-right: 3px;">
                          ${this.lang.getTranslation(["policy", "privacyPolicy"])}
                      </button>
                      <button type="button" class="btn btn-secondary white-txt" id="openTermsOfUseBtn">
                      ${this.lang.getTranslation(["policy", "termsOfUse"])}
                      </button>
                      <br>
                      <br>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.lang.getTranslation(["button", "cancel"])}</button>
                  </div>
              </div>
          </div>
      </div>
      <!-- Privacy Policy Modal -->
      <div class="modal fade" id="privacyPolicyModal" tabindex="-1" aria-labelledby="privacyPolicyModalLabel"
          aria-hidden="true">
          <div class="modal-dialog modal-80 modal-dialog-centered">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="privacyPolicyModalLabel">${this.lang.getTranslation(["policy", "privacyPolicy"])}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body overflow-auto" style="max-height: 70vh;">
                      <!-- Using <pre> to preserve formatting -->
                      <pre id="privacyPolicyContent" style="white-space: pre-wrap;">Loading...</pre>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.lang.getTranslation(["button", "close"])}</button>
                  </div>
              </div>
          </div>
      </div>
      <!-- Terms of use modal -->
      <div class="modal fade" id="termsOfUseModal" tabindex="-1" aria-labelledby="termsOfUseModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-80 modal-dialog-centered">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="termsOfUseModalLabel">${this.lang.getTranslation(["policy", "termsOfUse"])}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body overflow-auto" style="max-height: 70vh;">
                      <!-- Using <pre> to preserve formatting -->
                      <pre id="termsOfUseContent" style="white-space: pre-wrap;">Loading...</pre>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.lang.getTranslation(["button", "close"])}</button>
                  </div>
              </div>
          </div>
      </div>
            `;
    }

    async checkLogin() {
        const username = sessionStorage.getItem("username_transcendence");
        if (username) {
            navigateTo("/");
            throw new CustomError(
                `${this.lang.getTranslation(["modal", "title", "error"])}`,
                `${this.lang.getTranslation(["modal", "message", "alreadyLog"])}`,
                "/",
            );
        }
        return;
    }

    async errorModalSubmitNewUser(response) {
        const data = await this.getDatafromRequest(response);
        let message = this.JSONtoModal(data);
        if (message == "A user with that username already exists.")
            message = `${this.lang.getTranslation(["modal", "message", "usernameTaken"])}`;
        if (message == "Ensure this field has no more than 150 characters.")
            message = this.lang.getTranslation(["modal", "message", "fieldTooLong"]);
        showModal(
            `${this.lang.getTranslation(["modal", "title", "error"])}`,
            message,
        );
    }

    async submitNewUser(username, email, password, password2) {
        try {
            const request = await this.makeRequest("/api/auth/", "POST", {
                username: encodeURIComponent(username),
                password: password,
                password2: password2,
                email: email,
                two_fa_enable: false,
            });
            const response = await fetch(request);
            if (!response.ok) {
                await this.errorModalSubmitNewUser(response);
                return;
            }

            showModal(
                `${this.lang.getTranslation(["modal", "title", "accountCreation"])}`,
                `${this.lang.getTranslation(["modal", "message", "accountCreation"])}`,
            );
            console.log("");
            navigateTo("/login");
        } catch (error) {
            this.handleCatch(error);
        }
    }

    validateUsername(usernameInput) {
        let errorMessage = "";
        const errorDiv = document.querySelector("#usernameError");
        errorDiv.innerHTML = "";
        if (usernameInput.value.trim() === "") {
            errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
        } else if (!this.sanitizeInput(usernameInput.value)) {
            errorMessage = `${this.lang.getTranslation(["input", "label", "username"])} ${this.lang.getTranslation(["input", "error", "invalidChar"])}`;
        }
        if (errorMessage) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = "red";
            errorDiv.style.fontStyle = "italic";
        }
        errorDiv.classList.add("removeElem");
        return errorMessage;
    }

    validatePassword(passwordInput) {
        let errorMessage = "";
        const errorDiv = document.querySelector("#passwordError");
        errorDiv.innerHTML = "";
        if (passwordInput.value.trim() === "") {
            errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
        } else if (passwordInput.value.length < 2) {
            errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "short"])}`;
        }
        if (errorMessage) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = "red";
            errorDiv.style.fontStyle = "italic";
        }
        errorDiv.classList.add("removeElem");
        return errorMessage;
    }

    validateMail(mailInput) {
        let errorMessage = "";
        const errorDiv = document.querySelector("#mailError");
        errorDiv.innerHTML = "";
        if (mailInput.value.trim() === "") {
            errorMessage = `${this.lang.getTranslation(["input", "label", "email"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
        } else if (!this.sanitizeInput(mailInput.value)) {
            errorMessage = `${this.lang.getTranslation(["input", "label", "email"])} ${this.lang.getTranslation(["input", "error", "invalidChar"])}`;
        }
        if (errorMessage) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = "red";
            errorDiv.style.fontStyle = "italic";
        }
        errorDiv.classList.add("removeElem");
        return errorMessage;
    }

    validatePasswordMatch(passwordInput, password2Input) {
        let errorMessage = "";
        const errorDiv = document.querySelector("#password2Error");
        errorDiv.innerHTML = "";
        if (passwordInput.value.trim() === "") {
            errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "empty"])}`;
        }
        if (password2Input.value !== passwordInput.value) {
            errorMessage = `${this.lang.getTranslation(["input", "label", "password"])} ${this.lang.getTranslation(["input", "error", "match"])}`;
        }
        if (errorMessage) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = "red";
            errorDiv.style.fontStyle = "italic";
        }
        errorDiv.classList.add("removeElem");
        return errorMessage;
    }

    async handleSubmitNewUser(ev) {
        ev.preventDefault();
        try {
            const agreeToTermsCheckbox = document.querySelector("#agreeToTerms");
            if (!agreeToTermsCheckbox.checked) {
                showModal(
                    this.lang.getTranslation(["policy", "required"]),
                    this.lang.getTranslation(["policy", "failedReadAndAgree"]),
                );
                return;
            }
            const usernameInput = document.querySelector("#Username");
            const passwordInput = document.querySelector("#Password");
            const password2Input = document.querySelector("#Password-2");
            const mailInput = document.querySelector("#Mail");

            let isValid = true;

            if (this.validateUsername(usernameInput)) isValid = false;
            if (this.validateMail(mailInput)) isValid = false;
            if (this.validatePassword(passwordInput)) isValid = false;
            if (this.validatePasswordMatch(passwordInput, password2Input))
                isValid = false;
            if (!isValid) {
                return;
            }

            await this.submitNewUser(
                usernameInput.value,
                mailInput.value,
                passwordInput.value,
                password2Input.value,
            );
        } catch (error) {
            if (error instanceof CustomError) {
                error.showModalCustom();
                navigateTo(error.redirect);
            } else {
                console.error("handleSubmitNewUser:", error);
            }
        }
    }

    handleInputUsername(ev) {
        ev.preventDefault();
        const usernameInput = document.querySelector("#Username");
        this.validateUsername(usernameInput);
    }

    handleInputPassword(ev) {
        ev.preventDefault();
        const passwordInput = document.querySelector("#Password");
        this.validatePassword(passwordInput);
        const password2Input = document.querySelector("#Password-2");
        this.validatePasswordMatch(passwordInput, password2Input);
    }

    handleInputMail(ev) {
        ev.preventDefault();
        const mailInput = document.querySelector("#Mail");
        this.validateMail(mailInput);
    }

    async handleOpenPrivacyPolicy(ev) {
        ev.preventDefault();
        try {
            const myHeaders = new Headers();
            const response = await fetch(
                `/rgpd/politique-${this.lang.getCurrentLanguage()}.txt`,
                {
                    method: "GET",
                    headers: myHeaders,
                },
            );
            if (response.ok) {
                const data = await response.text();
                document.getElementById("privacyPolicyContent").textContent = data;
            } else {
                console.error("Error fetching the terms of use");
                document.getElementById("privacyPolicyContent").textContent =
                    `${this.lang.getTranslation(["policy", "errorFetching"])} ${this.lang.getTranslation(["policy", "privacyPolicy"])}`;
            }
        } catch (error) {
            console.error("Error fetching the terms of use:", error);
            document.getElementById("privacyPolicyContent").textContent =
                `${this.lang.getTranslation(["policy", "errorLoading"])} ${this.lang.getTranslation(["policy", "privacyPolicy"])}`;
        }
        let privacyPolicyModal = bootstrap.Modal.getInstance(
            document.getElementById("privacyPolicyModal"),
        );
        if (!privacyPolicyModal)
            privacyPolicyModal = new bootstrap.Modal(
                document.getElementById("privacyPolicyModal"),
            );
        privacyPolicyModal.show();
    }

    async handleOpenTermsOfUse(ev) {
        ev.preventDefault();
        try {
            const myHeaders = new Headers();
            const response = await fetch(
                `/rgpd/terms-of-use-${this.lang.getCurrentLanguage()}.txt`,
                {
                    method: "GET",
                    headers: myHeaders,
                },
            );
            if (response.ok) {
                const data = await response.text();
                document.getElementById("termsOfUseContent").textContent = data;
            } else {
                console.error("Error fetching the terms of use");
                document.getElementById("termsOfUseContent").textContent =
                    `${this.lang.getTranslation(["policy", "errorFetching"])} ${this.lang.getTranslation(["policy", "termsOfUse"])}`;
            }
        } catch (error) {
            console.error("Error fetching the terms of use:", error);
            document.getElementById("termsOfUseContent").textContent =
                `${this.lang.getTranslation(["policy", "errorLoading"])} ${this.lang.getTranslation(["policy", "termsOfUse"])}`;
        }
        let termsOfUseModal = bootstrap.Modal.getInstance(
            document.getElementById("termsOfUseModal"),
        );
        if (!termsOfUseModal)
            termsOfUseModal = new bootstrap.Modal(
                document.getElementById("termsOfUseModal"),
            );
        termsOfUseModal.show();
    }

    async addEventListeners() {
        const button = document.querySelector("#createUserButton");
        const usernameInput = document.querySelector("#Username");
        const passwordInput = document.querySelector("#Password");
        const password2Input = document.querySelector("#Password-2");
        const PrivacyPolicyButton = document.querySelector("#openPrivacyPolicyBtn");
        const TermsOfUseButton = document.querySelector("#openTermsOfUseBtn");
        const mailInput = document.querySelector("#Mail");
        if (button) {
            button.addEventListener("click", this.handleSubmitNewUser);
        }
        usernameInput.addEventListener("input", this.handleInputUsername);
        passwordInput.addEventListener("input", this.handleInputPassword);
        password2Input.addEventListener("input", this.handleInputPassword);
        mailInput.addEventListener("input", this.handleInputMail);
        PrivacyPolicyButton.addEventListener("click", this.handleOpenPrivacyPolicy);
        TermsOfUseButton.addEventListener("click", this.handleOpenTermsOfUse);
    }

    removeEventListeners() {
        const button = document.querySelector("#createUserButton");
        if (button) {
            button.removeEventListener("click", this.handleSubmitNewUser);
        }
        const usernameInput = document.querySelector("#Username");
        const passwordInput = document.querySelector("#Password");
        const password2Input = document.querySelector("#Password-2");
        const mailInput = document.querySelector("#Mail");
        if (usernameInput) {
            usernameInput.removeEventListener("input", this.handleInputUsername);
            usernameInput.value = "";
        }
        if (passwordInput) {
            passwordInput.value = "";
            passwordInput.removeEventListener("input", this.handleInputPassword);
        }
        if (password2Input) {
            password2Input.value = "";
            password2Input.removeEventListener("input", this.handleInputPassword);
        }
        if (mailInput) {
            mailInput.removeEventListener("input", this.handleInputMail);
            mailInput.value = "";
        }
        const usernameError = document.querySelector("#usernameError");
        if (usernameError) usernameError.innerHTML = "";
        const passwordError = document.querySelector("#passwordError");
        if (passwordError) passwordError.innerHTML = "";
        const password2Error = document.querySelector("#password2Error");
        if (password2Error) password2Error.innerHTML = "";
        const mailError = document.querySelector("#mailError");
        if (mailError) mailError.innerHTML = "";
        const PrivacyPolicyButton = document.querySelector("#openPrivacyPolicyBtn");
        const TermsOfUseButton = document.querySelector("#openTermsOfUseBtn");
        if (PrivacyPolicyButton)
            PrivacyPolicyButton.removeEventListener(
                "click",
                this.handleOpenPrivacyPolicy,
            );
        if (TermsOfUseButton)
            TermsOfUseButton.removeEventListener("click", this.handleOpenTermsOfUse);
    }
}
