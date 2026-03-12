// Calculator Logic
class Calculator {
    constructor() {
        this.displayElement = document.getElementById('display');
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.shouldResetDisplay = false;
        this.codeBuffer = ''; // Track code entry
        
        this.init();
    }
    
    init() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButtonClick(e));
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleButtonClick(e) {
        const btn = e.target;
        const value = btn.dataset.value;
        
        if (btn.classList.contains('clear')) {
            this.clear();
        } else if (btn.classList.contains('equal')) {
            this.calculate();
        } else if (btn.classList.contains('operator')) {
            this.setOperator(value);
        } else {
            this.appendNumber(value);
        }
    }
    
    handleKeyPress(e) {
        const key = e.key;
        
        if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (['+', '-', '*', '/'].includes(key)) {
            e.preventDefault();
            this.setOperator(key);
        } else if ((key >= '0' && key <= '9') || key === '.') {
            e.preventDefault();
            this.appendNumber(key);
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.backspace();
        }
    }
    
    appendNumber(num) {
        // Track code entry (only digits)
        if (!isNaN(num)) {
            this.codeBuffer += num;
            // Keep only last 4 digits
            if (this.codeBuffer.length > 4) {
                this.codeBuffer = this.codeBuffer.slice(-4);
            }
            // Check for snake game code
            if (this.codeBuffer === '0000') {
                this.activateSnakeGame();
                return;
            }
        } else {
            this.codeBuffer = ''; // Reset on non-digit
        }
        
        // Handle decimal point
        if (num === '.') {
            if (this.currentValue.includes('.')) return;
            this.currentValue += '.';
        } else {
            // Reset display if needed
            if (this.shouldResetDisplay) {
                this.currentValue = num;
                this.shouldResetDisplay = false;
            } else {
                // Prevent leading zeros
                if (this.currentValue === '0' && num !== '.') {
                    this.currentValue = num;
                } else {
                    this.currentValue += num;
                }
            }
        }
        this.updateDisplay();
    }
    
    activateSnakeGame() {
        const calculator = document.querySelector('.calculator');
        const snakeGame = document.getElementById('snakeGame');
        
        if (!snakeGame) return;
        
        // Hide calculator, show game
        calculator.style.display = 'none';
        snakeGame.style.display = 'flex';
        
        // Start or restart the snake game
        if (typeof startSnakeGame !== 'undefined') {
            startSnakeGame();
        }
    }
    
    setOperator(op) {
        if (this.currentValue === '') return;
        
        // If there's a pending operator, calculate first
        if (this.operator !== null && !this.shouldResetDisplay) {
            this.calculate();
        }
        
        this.operator = op;
        this.previousValue = this.currentValue;
        this.shouldResetDisplay = true;
    }
    
    calculate() {
        if (this.operator === null || this.previousValue === '' || this.shouldResetDisplay) {
            return;
        }
        
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;
        
        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = current !== 0 ? prev / current : 0;
                break;
            default:
                return;
        }
        
        // Handle floating point errors
        result = Math.round(result * 100000000) / 100000000;
        
        this.currentValue = result.toString();
        this.operator = null;
        this.previousValue = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.shouldResetDisplay = false;
        this.codeBuffer = '';
        this.updateDisplay();
    }
    
    backspace() {
        if (this.shouldResetDisplay) return;
        
        this.codeBuffer = ''; // Reset code buffer on backspace
        
        if (this.currentValue.length === 1) {
            this.currentValue = '0';
        } else {
            this.currentValue = this.currentValue.slice(0, -1);
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.displayElement.textContent = this.currentValue;
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
    setupSnakeGame();
});

// Snake Game Implementation
let snakeGame = {
    canvas: null,
    ctx: null,
    gameRunning: false,
    gameOver: false,
    score: 0,
    snake: [{x: 10, y: 10}],
    food: {x: 15, y: 15},
    dx: 1,
    dy: 0,
    nextDx: 1,
    nextDy: 0,
    gridSize: 20,
    gameSpeed: 10,
    updateInterval: null
};

function setupSnakeGame() {
    const backBtn = document.getElementById('backToCalc');
    if (backBtn) {
        backBtn.addEventListener('click', backToCalculator);
    }
    
    document.addEventListener('keydown', handleSnakeKeyPress);
}

function startSnakeGame() {
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;
    
    snakeGame.canvas = canvas;
    snakeGame.ctx = canvas.getContext('2d');
    
    // Set canvas size
    snakeGame.canvas.width = 400;
    snakeGame.canvas.height = 400;
    
    // Reset game state
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.food = generateFood();
    snakeGame.dx = 1;
    snakeGame.dy = 0;
    snakeGame.nextDx = 1;
    snakeGame.nextDy = 0;
    snakeGame.score = 0;
    snakeGame.gameOver = false;
    snakeGame.gameRunning = true;
    
    document.getElementById('snakeScore').textContent = '0';
    
    // Start game loop
    if (snakeGame.updateInterval) clearInterval(snakeGame.updateInterval);
    snakeGame.updateInterval = setInterval(updateSnakeGame, 1000 / snakeGame.gameSpeed);
}

function generateFood() {
    const maxGrid = snakeGame.canvas.width / snakeGame.gridSize;
    return {
        x: Math.floor(Math.random() * maxGrid),
        y: Math.floor(Math.random() * maxGrid)
    };
}

function updateSnakeGame() {
    if (!snakeGame.gameRunning || snakeGame.gameOver) return;
    
    // Update direction
    snakeGame.dx = snakeGame.nextDx;
    snakeGame.dy = snakeGame.nextDy;
    
    // Calculate new head position
    const head = snakeGame.snake[0];
    const maxGrid = snakeGame.canvas.width / snakeGame.gridSize;
    let newX = (head.x + snakeGame.dx + maxGrid) % maxGrid;
    let newY = (head.y + snakeGame.dy + maxGrid) % maxGrid;
    
    // Check collision with self
    for (let segment of snakeGame.snake) {
        if (segment.x === newX && segment.y === newY) {
            endSnakeGame();
            return;
        }
    }
    
    // Move snake
    snakeGame.snake.unshift({x: newX, y: newY});
    
    // Check food collision
    if (newX === snakeGame.food.x && newY === snakeGame.food.y) {
        snakeGame.score += 10;
        document.getElementById('snakeScore').textContent = snakeGame.score;
        snakeGame.food = generateFood();
    } else {
        snakeGame.snake.pop();
    }
    
    drawSnakeGame();
}

function drawSnakeGame() {
    const ctx = snakeGame.ctx;
    const gridSize = snakeGame.gridSize;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#00ff41';
    snakeGame.snake.forEach((segment, index) => {
        if (index === 0) ctx.fillStyle = '#00ff41'; // Head
        else ctx.fillStyle = '#00cc30'; // Body
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
    
    // Draw food
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(snakeGame.food.x * gridSize + 1, snakeGame.food.y * gridSize + 1, gridSize - 2, gridSize - 2);
}

function endSnakeGame() {
    snakeGame.gameRunning = false;
    snakeGame.gameOver = true;
    clearInterval(snakeGame.updateInterval);
    
    // Show game over message
    setTimeout(() => {
        alert(`Game Over!\nFinal Score: ${snakeGame.score}\n\nEnter 0000 to play again`);
    }, 100);
}

function handleSnakeKeyPress(e) {
    if (!snakeGame.gameRunning || snakeGame.gameOver) return;
    
    const key = e.key;
    
    // Prevent default scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
    }
    
    // Update next direction (prevents 180-degree turns)
    switch(key) {
        case 'ArrowUp':
            if (snakeGame.dy === 0) { snakeGame.nextDx = 0; snakeGame.nextDy = -1; }
            break;
        case 'ArrowDown':
            if (snakeGame.dy === 0) { snakeGame.nextDx = 0; snakeGame.nextDy = 1; }
            break;
        case 'ArrowLeft':
            if (snakeGame.dx === 0) { snakeGame.nextDx = -1; snakeGame.nextDy = 0; }
            break;
        case 'ArrowRight':
            if (snakeGame.dx === 0) { snakeGame.nextDx = 1; snakeGame.nextDy = 0; }
            break;
    }
}

function backToCalculator() {
    snakeGame.gameRunning = false;
    clearInterval(snakeGame.updateInterval);
    
    const calculator = document.querySelector('.calculator');
    const snakeGameDiv = document.getElementById('snakeGame');
    
    calculator.style.display = 'block';
    snakeGameDiv.style.display = 'none';
}
