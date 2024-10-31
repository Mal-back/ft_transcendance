import { navigateTo } from "../router.js";
import AbstractView from "./AbstractViews.js";
import Connect4 from "../game/Connect4.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Local Connect4");
        this.tournament = null;
        this.connect4 = new Connect4();
    }

    async loadCss() {
        this.createPageCss("../../css/normal-mode.css");
        this.createPageCss("../../css/background-profile.css");
        this.createPageCss("../../css/background-c4.css");
        this.createPageCss("../../css/connect4/hover-red.css");
    }

    async getHtml() {
        const htmlContent = `
        <div class="col d-flex flex-column align-items-center justify-content-center">
            <div class="background background-battle d-flex flex-column align-items-center">

                <!-- Text Section: Usernames and Score -->

                <div class="d-flex justify-content-center text-black text-section mt-4 w-80">
                    <div class="row w-100 text-center">
                        <div class="col-4 d-flex justify-content-center" id="User1">
                            <h3 class="username-outline" style="cursor: pointer;" data-bs-toggle="modal"
                                data-bs-target="#playerModal1"><span id="leftUser" class="user1-txt"></span></h3>
                        </div>
                        <div class="col-4 d-flex justify-content-center">
                            <h3>VS</h3>
                        </div>
                        <div class="col-4 d-flex justify-content-center" id="User2">
                            <h3 class="username-outline" style="cursor: pointer;" data-bs-toggle="modal"
                                data-bs-target="#playerModal2"><span id="rightUser" class="user2-txt"></span></h3>
                        </div>
                    </div>
                </div>

                <!-- Modal for Player 1 -->
                <div class="modal fade" id="playerModal1" tabindex="-1" aria-labelledby="playerModal1Label"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="playerModal1Label">Player Information</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body" id="user1-modal">
                                <p>Folklore is <span class="user1-txt">Red</span></p>
                            </div>
                            <div class=" modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal for Player 2 -->
                <div class="modal fade" id="playerModal2" tabindex="-1" aria-labelledby="playerModal2Label"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="playerModal2Label">Player Information</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body" id="user2-modal">
                                <p>Evermore is <span class="user2-txt">Blue</span></p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="canvas-container">
                    <div class="grid">


                        <!-- ROW 0 -->
                        <div id="cell0-0" class="cell cell-empty"></div>
                        <div id="cell0-1" class="cell cell-empty"></div>
                        <div id="cell0-2" class="cell cell-empty"></div>
                        <div id="cell0-3" class="cell cell-empty"></div>
                        <div id="cell0-4" class="cell cell-empty"></div>
                        <div id="cell0-5" class="cell cell-empty"></div>
                        <div id="cell0-6" class="cell cell-empty"></div>


                        <!-- ROW 1 -->
                        <div id="cell1-0" class="cell cell-empty"></div>
                        <div id="cell1-1" class="cell cell-empty"></div>
                        <div id="cell1-2" class="cell cell-empty"></div>
                        <div id="cell1-3" class="cell cell-empty"></div>
                        <div id="cell1-4" class="cell cell-empty"></div>
                        <div id="cell1-5" class="cell cell-empty"></div>
                        <div id="cell1-6" class="cell cell-empty"></div>


                        <!-- ROW 2 -->
                        <div id="cell2-0" class="cell cell-empty"></div>
                        <div id="cell2-1" class="cell cell-empty"></div>
                        <div id="cell2-2" class="cell cell-empty"></div>
                        <div id="cell2-3" class="cell cell-empty"></div>
                        <div id="cell2-4" class="cell cell-empty"></div>
                        <div id="cell2-5" class="cell cell-empty"></div>
                        <div id="cell2-6" class="cell cell-empty"></div>


                        <!-- ROW 3 -->
                        <div id="cell3-0" class="cell cell-empty"></div>
                        <div id="cell3-1" class="cell cell-empty"></div>
                        <div id="cell3-2" class="cell cell-empty"></div>
                        <div id="cell3-3" class="cell cell-empty"></div>
                        <div id="cell3-4" class="cell cell-empty"></div>
                        <div id="cell3-5" class="cell cell-empty"></div>
                        <div id="cell3-6" class="cell cell-empty"></div>


                        <!-- ROW 4 -->
                        <div id="cell4-0" class="cell cell-empty"></div>
                        <div id="cell4-1" class="cell cell-empty"></div>
                        <div id="cell4-2" class="cell cell-empty"></div>
                        <div id="cell4-3" class="cell cell-empty"></div>
                        <div id="cell4-4" class="cell cell-empty"></div>
                        <div id="cell4-5" class="cell cell-empty"></div>
                        <div id="cell4-6" class="cell cell-empty"></div>


                        <!-- ROW 5 -->
                        <div id="cell5-0" class="cell cell-empty"></div>
                        <div id="cell5-1" class="cell cell-red"></div>
                        <div id="cell5-2" class="cell cell-blue"></div>
                        <div id="cell5-3" class="cell cell-empty"></div>
                        <div id="cell5-4" class="cell cell-empty"></div>
                        <div id="cell5-5" class="cell cell-empty"></div>
                        <div id="cell5-6" class="cell cell-empty"></div>

                    </div>
                </div>
                <div class="d-flex flex-row justify-content-center text-white text-section mt-3 w-80"
                    style="background-color: rgb(0, 0, 0,0.5);">
                    <div class="text-center" id="Turn">
                        <h3>It's <span class="user1-txt" id="userTurn"></span>'s turn!</h3>
                    </div>
                </div>
            </div>
        </div>
            `;
        return htmlContent;
    }

    checkLogin() {
        return;
    }

    async game() {
        const params = new URLSearchParams(window.location.search);
        let mode = params.get("mode");
        if (!mode) mode = "local";
        console.log("Init Game");
        this.connect4.initC4(
            "ongoing-game",
            "wss://localhost:8080/api/game/c4-local/join/",
            mode,
        );
        const User1Text = document.getElementById("leftUser");
        const User2Text = document.getElementById("rightUser");
        const UserTurnText = document.getElementById("userTurn");
        if (mode == "tournament_local") {
            console.log("tournament mode")
            this.tournament = JSON.parse(
                sessionStorage.getItem("tournament_transcendence_local"),
            );
            console.log("TOURNAMENT START CONNECT4:", this.tournament);
            this.connect4.setUsername(
                this.tournament.PlayerA[this.tournament.round.currentMatch].name,
                this.tournament.PlayerB[this.tournament.round.currentMatch].name,
                this.tournament
            );

        } else {
            console.log("not tournament mode")

        }
        const objectPlayers = this.connect4.getUsername();
        User1Text.innerText = objectPlayers.User1;
        User2Text.innerText = objectPlayers.User2;
        UserTurnText.innerText = objectPlayers.UserTurn;
    }

    async addEventListeners() {
        this.connect4.addC4Event();
    }

    removeEventListeners() {
        this.connect4.removeC4Event();
    }
}
