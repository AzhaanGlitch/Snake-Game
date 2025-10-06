let gameContainer = document.getElementById("game-container");
let currentScoreEl = document.getElementById("current-score");
let highScoreEl = document.getElementById("high-score");
let startScreen = document.getElementById("start-screen");
let gameOverScreen = document.getElementById("game-over-screen");
let pauseOverlay = document.getElementById("pause-overlay");
let btnStart = document.getElementById("btn-start");
let btnRestart = document.getElementById("btn-restart");
let finalScoreEl = document.getElementById("final-score");
let difficultySelect = document.getElementById("difficulty");
let themeToggle = document.getElementById("theme-toggle");

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

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('snakeGameTheme');
    const theme = savedTheme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('snakeGameTheme', newTheme);
}

// High Score Management
function loadHighScore() {
    const saved = localStorage.getItem('snakeGameHighScore');
    highScore = saved ? parseInt(saved) : 0;
    highScoreEl.textContent = highScore;
}

function saveHighScore() {
    localStorage.setItem('snakeGameHighScore', highScore);
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
    pauseOverlay.style.display = "none";
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
    if (snakeBody.length > 0) {
        snakeBody.pop();
    }
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
    if (isGameRunning && (velocityX !== 0 || velocityY !== 0)) {
        isPaused = !isPaused;
        pauseOverlay.style.display = isPaused ? "flex" : "none";
    }
}

// Event Listeners
btnStart.addEventListener("click", startGame);
btnRestart.addEventListener("click", restartGame);
themeToggle.addEventListener("click", toggleTheme);

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
    if (key === " " || key === "Spacebar") {
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

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

gameContainer.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

gameContainer.addEventListener('touchend', function(e) {
    if (isPaused) return;
    
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, false);

function handleSwipe() {
    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;
    
    // Start game on first swipe
    if (!isGameRunning) {
        startGame();
    }
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 30 && velocityX !== -1) {
            velocityY = 0;
            velocityX = 1;
        } else if (diffX < -30 && velocityX !== 1) {
            velocityY = 0;
            velocityX = -1;
        }
    } else {
        // Vertical swipe
        if (diffY > 30 && velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        } else if (diffY < -30 && velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        }
    }
}

// Initialize
initTheme();
loadHighScore();