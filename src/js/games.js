// Efsanevi Mini Oyunlar - Oyun Motorları
// Tüm oyun sınıfları ve mantıkları burada

class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameLoop = null;
        this.isRunning = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.paused = false;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = Math.min(rect.width, 800);
        this.canvas.height = Math.min(rect.height, 600);
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    }

    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }

    pause() {
        this.paused = !this.paused;
    }

    update() {
        if (!this.isRunning) return;

        if (!this.paused) {
            this.gameUpdate();
            this.render();
        }

        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    gameUpdate() {
        // Alt sınıflar tarafından override edilecek
    }

    render() {
        // Alt sınıflar tarafından override edilecek
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.paused = false;
    }
}

// XOX Oyunu
class TicTacToe extends GameEngine {
    constructor(canvasId) {
        super(canvasId);
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.cellSize = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(e) {
        if (this.gameOver || this.paused) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor((x - this.offsetX) / this.cellSize);
        const row = Math.floor((y - this.offsetY) / this.cellSize);

        if (col >= 0 && col < 3 && row >= 0 && row < 3) {
            const index = row * 3 + col;
            if (this.board[index] === '') {
                this.board[index] = this.currentPlayer;
                this.score += 10;

                if (this.checkWinner()) {
                    this.gameOver = true;
                    this.score += 50;
                    setTimeout(() => alert(`${this.currentPlayer} Kazandı!`), 100);
                } else if (this.board.every(cell => cell !== '')) {
                    this.gameOver = true;
                    setTimeout(() => alert('Berabere!'), 100);
                } else {
                    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                }
            }
        }
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            return pattern.every(index => this.board[index] === this.currentPlayer);
        });
    }

    gameUpdate() {
        // XOX için özel güncelleme yok
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Tahta boyutlarını hesapla
        const boardSize = Math.min(this.canvas.width, this.canvas.height) * 0.8;
        this.cellSize = boardSize / 3;
        this.offsetX = (this.canvas.width - boardSize) / 2;
        this.offsetY = (this.canvas.height - boardSize) / 2;

        // Izgara çiz
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;

        for (let i = 1; i < 3; i++) {
            // Dikey çizgiler
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX + i * this.cellSize, this.offsetY);
            this.ctx.lineTo(this.offsetX + i * this.cellSize, this.offsetY + boardSize);
            this.ctx.stroke();

            // Yatay çizgiler
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX, this.offsetY + i * this.cellSize);
            this.ctx.lineTo(this.offsetX + boardSize, this.offsetY + i * this.cellSize);
            this.ctx.stroke();
        }

        // X ve O'ları çiz
        this.ctx.font = `${this.cellSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const x = this.offsetX + col * this.cellSize + this.cellSize / 2;
            const y = this.offsetY + row * this.cellSize + this.cellSize / 2;

            if (this.board[i] === 'X') {
                this.ctx.fillStyle = '#ff6b6b';
                this.ctx.fillText('X', x, y);
            } else if (this.board[i] === 'O') {
                this.ctx.fillStyle = '#4ecdc4';
                this.ctx.fillText('O', x, y);
            }
        }

        // Oyun durumu
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Oyun Bitti!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    reset() {
        super.reset();
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
    }
}

// Yılan Oyunu
class Snake extends GameEngine {
    constructor(canvasId) {
        super(canvasId);
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.food = { x: 15, y: 15 };
        this.gridSize = 20;
        this.gameOver = false;

        this.keys = {};
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleInput(e.key);
        });
    }

    handleInput(key) {
        if (this.gameOver) return;

        switch (key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.direction.y === 0) this.direction = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.direction.y === 0) this.direction = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.direction.x === 0) this.direction = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.direction.x === 0) this.direction = { x: 1, y: 0 };
                break;
        }
    }

    gameUpdate() {
        if (this.gameOver) return;

        // Yılanı hareket ettir
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Duvar kontrolü
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver = true;
            this.lives--;
            return;
        }

        // Kendine çarpma kontrolü
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            this.lives--;
            return;
        }

        this.snake.unshift(head);

        // Yemek yeme kontrolü
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
        } else {
            this.snake.pop();
        }

        // Seviye kontrolü
        if (this.score > 0 && this.score % 50 === 0) {
            this.level++;
        }
    }

    generateFood() {
        do {
            this.food.x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
            this.food.y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Yılanı çiz
        this.ctx.fillStyle = '#4ecdc4';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#45b7d1'; // Baş farklı renk
            } else {
                this.ctx.fillStyle = '#4ecdc4';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Yemek çiz
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );

        // Oyun bitiş
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Oyun Bitti!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(`Skor: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    reset() {
        super.reset();
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.generateFood();
        this.gameOver = false;
    }
}

// Hafıza Oyunu
class Memory extends GameEngine {
    constructor(canvasId) {
        super(canvasId);
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 8;
        this.gameOver = false;
        this.cardSize = 60;
        this.cols = 4;
        this.rows = 4;

        this.initializeCards();
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    initializeCards() {
        const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        const cardValues = [...symbols, ...symbols]; // Her sembol için 2 kart

        // Kartları karıştır
        for (let i = cardValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
        }

        this.cards = cardValues.map((value, index) => ({
            value,
            flipped: false,
            matched: false,
            x: (index % this.cols) * (this.cardSize + 10) + 20,
            y: Math.floor(index / this.cols) * (this.cardSize + 10) + 20
        }));
    }

    handleClick(e) {
        if (this.gameOver || this.flippedCards.length >= 2) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const card = this.cards.find(card =>
            x >= card.x && x <= card.x + this.cardSize &&
            y >= card.y && y <= card.y + this.cardSize &&
            !card.flipped && !card.matched
        );

        if (card) {
            card.flipped = true;
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkMatch(), 1000);
            }
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.value === card2.value) {
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            this.score += 20;

            if (this.matchedPairs === this.totalPairs) {
                this.gameOver = true;
                this.score += 100;
                setTimeout(() => alert('Tebrikler! Tüm çiftleri buldunuz!'), 500);
            }
        } else {
            card1.flipped = false;
            card2.flipped = false;
        }

        this.flippedCards = [];
    }

    gameUpdate() {
        // Hafıza oyunu için özel güncelleme yok
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.cards.forEach(card => {
            // Kart arka yüzü
            this.ctx.fillStyle = card.flipped || card.matched ? '#4ecdc4' : '#667eea';
            this.ctx.fillRect(card.x, card.y, this.cardSize, this.cardSize);

            // Kart kenarları
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(card.x, card.y, this.cardSize, this.cardSize);

            // Sembol
            if (card.flipped || card.matched) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    card.value,
                    card.x + this.cardSize / 2,
                    card.y + this.cardSize / 2
                );
            }
        });

        // Oyun bitiş
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tebrikler!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(`Skor: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    reset() {
        super.reset();
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.gameOver = false;
        this.initializeCards();
    }
}

// Pong Oyunu
class Pong extends GameEngine {
    constructor(canvasId) {
        super(canvasId);
        this.paddle1 = { x: 10, y: this.canvas.height / 2 - 50, width: 10, height: 100 };
        this.paddle2 = { x: this.canvas.width - 20, y: this.canvas.height / 2 - 50, width: 10, height: 100 };
        this.ball = { x: this.canvas.width / 2, y: this.canvas.height / 2, radius: 8, vx: 5, vy: 3 };
        this.gameOver = false;

        this.keys = {};
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => delete this.keys[e.key]);
    }

    gameUpdate() {
        if (this.gameOver) return;

        // Raket hareketi
        if (this.keys['w'] && this.paddle1.y > 0) this.paddle1.y -= 5;
        if (this.keys['s'] && this.paddle1.y < this.canvas.height - this.paddle1.height) this.paddle1.y += 5;
        if (this.keys['ArrowUp'] && this.paddle2.y > 0) this.paddle2.y -= 5;
        if (this.keys['ArrowDown'] && this.paddle2.y < this.canvas.height - this.paddle2.height) this.paddle2.y += 5;

        // Top hareketi
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Duvar çarpışması
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.vy *= -1;
        }

        // Raket çarpışması
        if (this.ball.x <= this.paddle1.x + this.paddle1.width &&
            this.ball.y >= this.paddle1.y &&
            this.ball.y <= this.paddle1.y + this.paddle1.height) {
            this.ball.vx *= -1;
            this.score += 10;
        }

        if (this.ball.x >= this.paddle2.x &&
            this.ball.y >= this.paddle2.y &&
            this.ball.y <= this.paddle2.y + this.paddle2.height) {
            this.ball.vx *= -1;
            this.score += 10;
        }

        // Gol kontrolü
        if (this.ball.x < 0) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver = true;
            } else {
                this.resetBall();
            }
        }

        if (this.ball.x > this.canvas.width) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver = true;
            } else {
                this.resetBall();
            }
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.vx = Math.random() > 0.5 ? 5 : -5;
        this.ball.vy = (Math.random() - 0.5) * 6;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Orta çizgi
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Raketler
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);

        // Top
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fill();

        // Oyun bitiş
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Oyun Bitti!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(`Final Skor: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    reset() {
        super.reset();
        this.paddle1.y = this.canvas.height / 2 - 50;
        this.paddle2.y = this.canvas.height / 2 - 50;
        this.resetBall();
        this.gameOver = false;
    }
}

// Uzay Savunma Oyunu
class SpaceInvaders extends GameEngine {
    constructor(canvasId) {
        super(canvasId);
        this.player = { x: this.canvas.width / 2 - 25, y: this.canvas.height - 50, width: 50, height: 20 };
        this.bullets = [];
        this.enemies = [];
        this.gameOver = false;

        this.initializeEnemies();
        this.keys = {};
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => delete this.keys[e.key]);
    }

    initializeEnemies() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                this.enemies.push({
                    x: col * 60 + 50,
                    y: row * 40 + 50,
                    width: 30,
                    height: 20,
                    alive: true
                });
            }
        }
    }

    gameUpdate() {
        if (this.gameOver) return;

        // Oyuncu hareketi
        if (this.keys['ArrowLeft'] && this.player.x > 0) this.player.x -= 5;
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) this.player.x += 5;

        // Ateş
        if (this.keys[' '] && this.bullets.length < 3) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y,
                width: 3,
                height: 10
            });
            delete this.keys[' '];
        }

        // Mermi hareketi
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= 7;
            return bullet.y > 0;
        });

        // Çarpışma kontrolü
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.alive &&
                    bullet.x >= enemy.x && bullet.x <= enemy.x + enemy.width &&
                    bullet.y >= enemy.y && bullet.y <= enemy.y + enemy.height) {
                    enemy.alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    this.score += 20;
                }
            });
        });

        // Kazanma kontrolü
        if (this.enemies.every(enemy => !enemy.alive)) {
            this.gameOver = true;
            this.score += 200;
            setTimeout(() => alert('Tebrikler! Tüm düşmanları yok ettiniz!'), 500);
        }

        // Kaybetme kontrolü
        if (this.enemies.some(enemy => enemy.alive && enemy.y + enemy.height >= this.player.y)) {
            this.gameOver = true;
            this.lives = 0;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Oyuncu
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Düşmanlar
        this.ctx.fillStyle = '#ff6b6b';
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });

        // Mermiler
        this.ctx.fillStyle = '#f9ca24';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        });

        // Oyun bitiş
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.enemies.every(e => !e.alive) ? 'Kazandınız!' : 'Oyun Bitti!',
                this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(`Skor: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    reset() {
        super.reset();
        this.player.x = this.canvas.width / 2 - 25;
        this.bullets = [];
        this.initializeEnemies();
        this.gameOver = false;
    }
}

// Oyun Yönetici
class GameManager {
    constructor() {
        this.currentGame = null;
        this.games = {
            xox: TicTacToe,
            snake: Snake,
            memory: Memory,
            pong: Pong,
            space: SpaceInvaders
        };
    }

    startGame(gameType) {
        if (this.currentGame) {
            this.currentGame.stop();
        }

        const GameClass = this.games[gameType];
        if (GameClass) {
            this.currentGame = new GameClass('game-canvas');
            this.currentGame.start();
            this.updateUI();
        }
    }

    pauseGame() {
        if (this.currentGame) {
            this.currentGame.pause();
        }
    }

    restartGame() {
        if (this.currentGame) {
            this.currentGame.reset();
            this.currentGame.start();
            this.updateUI();
        }
    }

    quitGame() {
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }
        showMenu();
    }

    updateUI() {
        if (this.currentGame) {
            document.getElementById('score').textContent = `Skor: ${this.currentGame.score}`;
            document.getElementById('level').textContent = `Seviye: ${this.currentGame.level}`;
            document.getElementById('lives').textContent = `Can: ${this.currentGame.lives}`;
        }
    }
}

// Global oyun yöneticisi
const gameManager = new GameManager();