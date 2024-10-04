const canvas = document.getElementById("ongoing-game");
const context = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth * 0.95; // 95% of the viewport width
canvas.height = window.innerHeight * 0.99; // 99% of the viewport height

// Adjust for high-DPI displays
const scaleFactor = window.devicePixelRatio || 1;
canvas.width *= scaleFactor;
canvas.height *= scaleFactor;
context.scale(scaleFactor, scaleFactor);

// Load paddle images
const leftPaddleImg = new Image();
leftPaddleImg.src = '../../img/left-paddle.png';
const rightPaddleImg = new Image();
rightPaddleImg.src = '../../img/right-paddle.png';

// Paddle positions
const paddleWidth = 10;
const paddleHeight = 40;
const leftPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2 };
const rightPaddle = { x: canvas.width - paddleWidth - 10, y: canvas.height / 2 - paddleHeight / 2 };

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 5,
    speedX: 2,
    speedY: 1
};

// Score variables
let leftScore = 0;
let rightScore = 0;

// Function to draw paddles
function drawPaddles() {
    context.drawImage(leftPaddleImg, leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
    context.drawImage(rightPaddleImg, rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
}

function drawBall() {
    context.fillStyle = 'white'; // Set color to white for the ball
    context.beginPath(); // Start a new path
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false); // Draw the ball
    context.fill(); // Fill the ball
    context.closePath(); // Close the path
}

// Function to draw scores
function drawScores() {
    context.fillStyle = 'white'; // Set color to white for scores
    context.font = '24px Arial'; // Increase font size for clarity
    context.textAlign = 'left'; // Align left for left player score
    context.fillText(`Left: ${leftScore}`, 20, 30); // Draw left score
    context.textAlign = 'right'; // Align right for right player score
    context.fillText(`Right: ${rightScore}`, canvas.width - 20, 30); // Draw right score
}

// Update the ball position
function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Check for ball collision with top and bottom walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY; // Reverse direction
    }

    // Check for ball going out of bounds
    if (ball.x - ball.radius < 0) {
        rightScore++; // Right player scores
        resetBall(); // Reset ball position
    } else if (ball.x + ball.radius > canvas.width) {
        leftScore++; // Left player scores
        resetBall(); // Reset ball position
    }
}

// Reset ball to center after scoring
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = 5 * (Math.random() < 0.5 ? 1 : -1); // Random direction
    ball.speedY = 3; // Reset speed
}

// Main draw loop
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawPaddles(); // Draw paddles
    drawBall(); // Draw the ball
    updateBall(); // Update ball position
    drawScores(); // Draw scores
}

// Ensure images are loaded before starting the game loop
leftPaddleImg.onload = () => {
    console.log("Left paddle image loaded");
    rightPaddleImg.onload = () => {
        console.log("Right paddle image loaded");
        setInterval(draw, 1000 / 60); // 60 frames per second
    };
};

leftPaddleImg.onerror = () => {
    console.error("Error loading left paddle image");
};

rightPaddleImg.onerror = () => {
    console.error("Error loading right paddle image");
};

// Handle window resizing
window.addEventListener('resize', () => {
    // Reset canvas dimensions
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.99;

    // Adjust for high-DPI displays
    const scaleFactor = window.devicePixelRatio || 1;
    canvas.width *= scaleFactor;
    canvas.height *= scaleFactor;
    context.scale(scaleFactor, scaleFactor);
});
