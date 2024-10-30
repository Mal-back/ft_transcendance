document.addEventListener('DOMContentLoaded', function () {
    // Define players
    const p1 = {
        username: document.getElementById("User1").innerText,
        color: 'Red',
        span: `<span class="user1-txt">`
    };

    const p2 = {
        username: document.getElementById("User2").innerText,
        color: 'Blue',
        span: `<span class="user2-txt">`
    };

    // Set title attribute when hovering over user names
    document.getElementById('User1').innerHTML = `<h3 class="username-outline" style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#playerModal1">${p1.span}${p1.username}</span></h3>`
    document.getElementById('User2').innerHTML = `<h3 class="username-outline" style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#playerModal2">${p2.span}${p2.username}</span></h3>`
    document.getElementById('User1').setAttribute('title', `${p1.username} is ${p1.color}`);
    document.getElementById('User2').setAttribute('title', `${p2.username} is ${p2.color}`);
    document.getElementById('user1-modal').innerHTML = `<p>${p1.username} is <span class="user1-txt">${p1.color}</span></p>`;
    document.getElementById('user2-modal').innerHTML = `<p>${p2.username} is <span class="user2-txt">${p2.color}</span></p>`;
    document.getElementById("Turn").innerHTML = `<h3>It's ${p1.span}${p1.username}</span>'s turn!</h3>`;
});

const rows = 6;
const cols = 7;
const board = [];
const p1 = {
    username: document.getElementById("User1").innerText,
    color: 'Red',
    span: `<span class="user1-txt">`
};

const p2 = {
    username: document.getElementById("User2").innerText,
    color: 'Blue',
    span: `<span class="user2-txt">`
};
let player1 = document.getElementById("User1").innerText;
let player2 = document.getElementById("User2").innerText;
let currentPlayer = p1; // Player 1 starts with red
let currentColor = 'red';
let gameActive = true;

// Initialize the board with empty cells
for (let i = 0; i < rows; i++) {
    board.push(Array(cols).fill(null));
}

// Function to place a piece in the lowest available row of a column
function placePiece(col) {
    if (!gameActive) return;

    // Find the lowest empty row in the clicked column
    console.log(col);
    for (let row = rows - 1; row >= 0; row--) {
        if (!board[row][col]) {
            board[row][col] = currentPlayer.username;
            updateUI(row, col);
            if (checkWin(row, col)) {
                document.getElementById('Turn').innerHTML = `<h3>Player ${currentPlayer.span}${currentPlayer.username}</span> wins!</h3>`;
                gameActive = false;
            } else {
                togglePlayer();
                document.getElementById('Turn').innerHTML = `<h3>It's ${currentPlayer.span}${currentPlayer.username}</span>'s turn!</h3>`;
            }
            return;
        }
    }
}

// Toggle the current player
function togglePlayer() {
    currentColor = currentPlayer === p1 ? 'blue' : 'red';
    currentPlayer = currentPlayer === p1 ? p2 : p1;
}

// Update the UI to show the piece in the correct grid cell
function updateUI(row, col) {
    const cell = document.getElementById(`cell${row}-${col}`);
    cell.classList.remove('cell-empty');
    cell.classList.add(`cell-${currentColor}`);
    const theme = document.getElementById('theme');

    // Toggle between light.css and dark.css
    if (theme.getAttribute('href') == '../../css/connect4/hover-red.css') {
        theme.setAttribute('href', '../../css/connect4/hover-blue.css');
    } else {
        theme.setAttribute('href', '../../css/connect4/hover-red.css');
    }
}

// Check if there's a win (4 in a row) after placing a piece
function checkWin(row, col) {
    return checkDirection(row, col, 1, 0) ||  // Horizontal
        checkDirection(row, col, 0, 1) ||  // Vertical
        checkDirection(row, col, 1, 1) ||  // Diagonal down-right
        checkDirection(row, col, 1, -1);   // Diagonal down-left
}

// Check a direction (e.g., horizontal, vertical, diagonal) for 4 in a row
function checkDirection(row, col, rowIncrement, colIncrement) {
    let count = 0;
    for (let dir of [-1, 1]) {
        let r = row, c = col;
        while (true) {
            r += dir * rowIncrement;
            c += dir * colIncrement;
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== currentPlayer.username) break;
            count++;
        }
    }
    return count >= 3; // We already have the current cell, so we just need 3 more
}

// Add event listeners to all cells for clicking (selecting a column)
document.querySelectorAll('.cell').forEach((cell, index) => {
    const col = index % cols;
    cell.addEventListener('click', () => placePiece(col));
});
