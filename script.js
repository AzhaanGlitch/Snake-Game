let gameContainer = document.getElementById("game-container");
let currentScoreEl = document.getElementById("current-score");
let highScoreEl = document.getElementById("high-score");
let startScreen = document.getElementById("start-screen");
let gameOverScreen = document.getElementById("game-over-screen");
let btnStart = document.getElementById("btn-start");
let btnRestart = document.getElementById("btn-restart");
let finalScoreEl = document.getElementById("final-score");
let difficultySelect = document.getElementById("difficulty");

let foodX, foodY;
let headX = 12, headY = 12;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let score = 0;
let highScore = 0;
let gameInterval;
let gameSpeed = 100;
let isGameRunning = false;
let isPaused = false;

// Load high score from memory
function loadHighScore() {
    highScore = 0;
    highScoreEl.textContent = highScore;
}

// Save high score to memory
function saveHighScore() {
    // Just update the display
    highScoreEl.textContent = highScore;
}

function generateFood() {
    foodX = Math.floor(Math.random() * 25) + 1;
    foodY = Math.floor(Math.random() * 25) + 1;
    
    // Check if food spawns on snake
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeBody[i][1] === foodY && snakeBody[i][0] === foodX) {
            generateFood();
            return;
        }
    }
}

function resetGame() {
    headX = 12;
    headY = 12;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    score = 0;
    isPaused = false;
    updateScore();
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }
    
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = "flex";
}

function updateScore() {
    currentScoreEl.textContent = score;
}

function renderGame() {
    if (isPaused) return;
    
    let updatedGame = `<div class="food" style="grid-area: ${foodY}/${foodX};"></div>`;
    
    // Check if snake ate food
    if (foodX === headX && headY === foodY) {
        snakeBody.push([foodX, foodY]);
        generateFood();
        score += 10;
        updateScore();
    }
    
    // Move snake
    snakeBody.pop();
    headX += velocityX;
    headY += velocityY;
    snakeBody.unshift([headX, headY]);
    
    // Check wall collision
    if (headX === 0 || headY === 0 || headX === 26 || headY === 26) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let i = 1; i < snakeBody.length; i++) {
        if (snakeBody[0][0] === snakeBody[i][0] && snakeBody[0][1] === snakeBody[i][1]) {
            gameOver();
            return;
        }
    }
    
    // Render snake
    for (let i = 0; i < snakeBody.length; i++) {
        updatedGame += `<div class="snake" style="grid-area: ${snakeBody[i][1]}/${snakeBody[i][0]};"></div>`;
    }
    
    gameContainer.innerHTML = updatedGame;
}

function startGame() {
    resetGame();
    generateFood();
    gameSpeed = parseInt(difficultySelect.value);
    startScreen.style.display = "none";
    isGameRunning = true;
    gameInterval = setInterval(renderGame, gameSpeed);
}

function restartGame() {
    gameOverScreen.style.display = "none";
    startGame();
}

function togglePause() {
    if (isGameRunning && velocityX !== 0 || velocityY !== 0) {
        isPaused = !isPaused;
    }
}

// Event Listeners
btnStart.addEventListener("click", startGame);
btnRestart.addEventListener("click", restartGame);

document.addEventListener("keydown", function(e) {
    let key = e.key;
    
    // Prevent default arrow key behavior
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
        e.preventDefault();
    }
    
    // Start game on first arrow key press
    if (!isGameRunning && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        startGame();
    }
    
    // Handle pause
    if (key === " ") {
        togglePause();
        return;
    }
    
    if (isPaused) return;
    
    // Handle direction changes
    if (key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (key === "ArrowLeft" && velocityX !== 1) {
        velocityY = 0;
        velocityX = -1;
    } else if (key === "ArrowRight" && velocityX !== -1) {
        velocityY = 0;
        velocityX = 1;
    }
});

// Initialize
loadHighScore();