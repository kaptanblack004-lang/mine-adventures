// Mini Oyun Yönetimi
class MiniGameManager {
    constructor() {
        this.currentGame = null;
        this.gameScore = 0;
        this.gameTime = 0;
        this.difficulty = 'normal';
    }

    // Mini oyun başlat
    startGame(gameType, difficulty = 'normal') {
        this.currentGame = gameType;
        this.difficulty = difficulty;
        this.gameScore = 0;
        this.gameTime = 0;

        switch(gameType) {
            case 'memory':
                this.startMemoryGame();
                break;
            case 'reflex':
                this.startReflexGame();
                break;
            case 'puzzle':
                this.startPuzzleGame();
                break;
            case 'quiz':
                this.startQuizGame();
                break;
            case 'rhythm':
                this.startRhythmGame();
                break;
            case 'collection':
                this.startCollectionGame();
                break;
            default:
                console.error('Bilinmeyen oyun türü:', gameType);
        }
    }

    // Hafıza Oyunu
    startMemoryGame() {
        const gameArea = document.getElementById('mini-game-area');
        if (!gameArea) return;

        const cards = this.generateMemoryCards();
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;

        gameArea.innerHTML = `
            <div class="memory-game">
                <div class="game-header">
                    <h3>Hafıza Oyunu</h3>
                    <div class="game-stats">
                        <span>Hareket: <span id="moves">0</span></span>
                        <span>Eşleşme: <span id="matches">0</span></span>
                    </div>
                </div>
                <div class="memory-grid" id="memory-grid">
                    ${cards.map((card, index) => `
                        <div class="memory-card" data-index="${index}" data-symbol="${card}">
                            <div class="card-front">?</div>
                            <div class="card-back">${card}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="game-controls">
                    <button onclick="miniGameManager.endMemoryGame()">Bitir</button>
                </div>
            </div>
        `;

        // Kart olay dinleyicileri
        const memoryCards = gameArea.querySelectorAll('.memory-card');
        memoryCards.forEach(card => {
            card.addEventListener('click', () => this.flipCard(card, flippedCards, matchedPairs, moves));
        });

        this.startTimer();
    }

    generateMemoryCards() {
        const symbols = ['💎', '🗡️', '🛡️', '🧪', '📜', '🔮', '⚡', '🌟'];
        const cards = [...symbols, ...symbols];
        return this.shuffleArray(cards);
    }

    flipCard(card, flippedCards, matchedPairs, moves) {
        if (card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            document.getElementById('moves').textContent = moves;

            const [card1, card2] = flippedCards;
            const symbol1 = card1.dataset.symbol;
            const symbol2 = card2.dataset.symbol;

            if (symbol1 === symbol2) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs++;
                document.getElementById('matches').textContent = matchedPairs;
                this.gameScore += 10;

                if (matchedPairs === 8) {
                    this.endMemoryGame(true);
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                }, 1000);
            }

            flippedCards = [];
        }
    }

    // Refleks Oyunu
    startReflexGame() {
        const gameArea = document.getElementById('mini-game-area');
        if (!gameArea) return;

        let score = 0;
        let timeLeft = 30;
        let activeTarget = null;

        gameArea.innerHTML = `
            <div class="reflex-game">
                <div class="game-header">
                    <h3>Refleks Oyunu</h3>
                    <div class="game-stats">
                        <span>Skor: <span id="reflex-score">0</span></span>
                        <span>Süre: <span id="time-left">30</span></span>
                    </div>
                </div>
                <div class="reflex-area" id="reflex-area">
                    <div class="target" id="target">🎯</div>
                </div>
                <div class="game-instructions">
                    Hedefe hızlıca tıkla!
                </div>
            </div>
        `;

        const reflexArea = document.getElementById('reflex-area');
        const target = document.getElementById('target');

        target.addEventListener('click', () => {
            score += 10;
            document.getElementById('reflex-score').textContent = score;
            this.moveTarget(target, reflexArea);
        });

        this.moveTarget(target, reflexArea);

        // Zamanlayıcı
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('time-left').textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.endReflexGame(score);
            }
        }, 1000);
    }

    moveTarget(target, area) {
        const maxX = area.offsetWidth - target.offsetWidth;
        const maxY = area.offsetHeight - target.offsetHeight;
        
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;
        
        target.style.left = randomX + 'px';
        target.style.top = randomY + 'px';
    }

    // Bulmaca Oyunu
    startPuzzleGame() {
        const gameArea = document.getElementById('mini-game-area');
        if (!gameArea) return;

        const puzzlePieces = this.generatePuzzlePieces();
        let moves = 0;

        gameArea.innerHTML = `
            <div class="puzzle-game">
                <div class="game-header">
                    <h3>Bulmaca Oyunu</h3>
                    <div class="game-stats">
                        <span>Hareket: <span id="puzzle-moves">0</span></span>
                    </div>
                </div>
                <div class="puzzle-grid" id="puzzle-grid">
                    ${puzzlePieces.map((piece, index) => `
                        <div class="puzzle-piece" data-index="${index}" data-correct="${piece}">
                            ${piece}
                        </div>
                    `).join('')}
                </div>
                <div class="game-controls">
                    <button onclick="miniGameManager.shufflePuzzle()">Karıştır</button>
                    <button onclick="miniGameManager.endPuzzleGame()">Bitir</button>
                </div>
            </div>
        `;

        this.shufflePuzzle();

        // Parça olay dinleyicileri
        const puzzlePiecesElements = gameArea.querySelectorAll('.puzzle-piece');
        puzzlePiecesElements.forEach(piece => {
            piece.addEventListener('click', () => this.movePuzzlePiece(piece));
        });
    }

    generatePuzzlePieces() {
        // 3x3 bulmaca için 8 parça (1 boş)
        return [1, 2, 3, 4, 5, 6, 7, 8, ''];
    }

    shufflePuzzle() {
        const puzzleGrid = document.getElementById('puzzle-grid');
        const pieces = Array.from(puzzleGrid.children);
        
        // Karıştır
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        
        // Grid'i yeniden oluştur
        puzzleGrid.innerHTML = '';
        pieces.forEach(piece => puzzleGrid.appendChild(piece));
    }

    movePuzzlePiece(piece) {
        const emptyPiece = document.querySelector('.puzzle-piece[data-correct=""]');
        if (!emptyPiece) return;

        const pieceRect = piece.getBoundingClientRect();
        const emptyRect = emptyPiece.getBoundingClientRect();

        // Yanındaki boşluğa taşı
        if (Math.abs(pieceRect.left - emptyRect.left) <= pieceRect.width && 
            Math.abs(pieceRect.top - emptyRect.top) <= pieceRect.height) {
            
            // Yer değiştir
            const tempContent = piece.textContent;
            const tempCorrect = piece.dataset.correct;
            
            piece.textContent = emptyPiece.textContent;
            piece.dataset.correct = emptyPiece.dataset.correct;
            
            emptyPiece.textContent = tempContent;
            emptyPiece.dataset.correct = tempCorrect;

            // Hareket sayısını güncelle
            const movesElement = document.getElementById('puzzle-moves');
            if (movesElement) {
                movesElement.textContent = parseInt(movesElement.textContent) + 1;
            }

            // Kontrol et
            this.checkPuzzleComplete();
        }
    }

    checkPuzzleComplete() {
        const puzzlePiecesElements = document.querySelectorAll('.puzzle-piece');
        let isComplete = true;

        puzzlePiecesElements.forEach(piece => {
            if (piece.textContent !== piece.dataset.correct) {
                isComplete = false;
            }
        });

        if (isComplete) {
            this.endPuzzleGame(true);
        }
    }

    // Quiz Oyunu
    startQuizGame() {
        const gameArea = document.getElementById('mini-game-area');
        if (!gameArea) return;

        const questions = this.generateQuizQuestions();
        let currentQuestion = 0;
        let score = 0;

        const showQuestion = () => {
            const question = questions[currentQuestion];
            
            gameArea.innerHTML = `
                <div class="quiz-game">
                    <div class="game-header">
                        <h3>Bilgi Yarışması</h3>
                        <div class="game-stats">
                            <span>Soru: <span id="question-number">${currentQuestion + 1}</span>/${questions.length}</span>
                            <span>Skor: <span id="quiz-score">${score}</span></span>
                        </div>
                    </div>
                    <div class="question-area">
                        <h4>${question.question}</h4>
                        <div class="answer-options">
                            ${question.options.map((option, index) => `
                                <button class="answer-btn" onclick="miniGameManager.checkAnswer(${index}, ${question.correct})">
                                    ${option}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        };

        this.checkAnswer = (selectedIndex, correctIndex) => {
            if (selectedIndex === correctIndex) {
                score += 10;
                document.getElementById('quiz-score').textContent = score;
                this.showFeedback(true);
            } else {
                this.showFeedback(false);
            }

            currentQuestion++;
            if (currentQuestion < questions.length) {
                setTimeout(showQuestion, 2000);
            } else {
                this.endQuizGame(score);
            }
        };

        showQuestion();
    }

    generateQuizQuestions() {
        return [
            {
                question: "Kristal Kale'nin koruyucusu kimdir?",
                options: ["Prenses Mine", "Bilge Büyücü", "Ejderha Ignis", "Orman Ruhları"],
                correct: 1
            },
            {
                question: "Kayıp kristalllerden kaç tane vardır?",
                options: ["3", "5", "7", "9"],
                correct: 2
            },
            {
                question: "Ejderha Ignis neyi korur?",
                options: ["Altın", "Kristal", "Kılıç", "Kitap"],
                correct: 1
            },
            {
                question: "Gizemli Orman'da ne bulunur?",
                options: ["Hazine", "Kayıp Kristal", "Ejderha", "Büyücü"],
                correct: 1
            },
            {
                question: "Mine'in son amacı nedir?",
                options: ["Kraliçe olmak", "Kristalleri kurtarmak", "Ejderha yenmek", "Büyü öğrenmek"],
                correct: 1
            }
        ];
    }

    showFeedback(isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = isCorrect ? '✅ Doğru!' : '❌ Yanlış!';
        
        document.getElementById('mini-game-area').appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 2000);
    }

    // Ritim Oyunu
    startRhythmGame() {
        const gameArea = document.getElementById('mini-game-area');
        if (!gameArea) return;

        let score = 0;
        let combo = 0;
        let beatIndex = 0;

        const beats = ['🥁', '🎵', '🎶', '🎼'];
        const sequence = this.generateRhythmSequence();

        gameArea.innerHTML = `
            <div class="rhythm-game">
                <div class="game-header">
                    <h3>Ritim Oyunu</h3>
                    <div class="game-stats">
                        <span>Skor: <span id="rhythm-score">0</span></span>
                        <span>Kombo: <span id="combo">0</span></span>
                    </div>
                </div>
                <div class="rhythm-area">
                    <div class="beat-track" id="beat-track">
                        ${sequence.map((beat, index) => `
                            <div class="beat-slot" data-index="${index}">
                                <div class="beat-indicator">${beat}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="rhythm-controls">
                        <button class="rhythm-btn" onclick="miniGameManager.hitBeat()">🥁 Vur</button>
                    </div>
                </div>
            </div>
        `;

        // Ritim başlat
        this.startRhythmSequence(sequence);
    }

    generateRhythmSequence() {
        const patterns = ['🥁', '🎵', '🎶', '🎼'];
        const sequence = [];
        for (let i = 0; i < 16; i++) {
            sequence.push(patterns[Math.floor(Math.random() * patterns.length)]);
        }
        return sequence;
    }

    startRhythmSequence(sequence) {
        let currentIndex = 0;
        
        const playBeat = () => {
            const beatSlots = document.querySelectorAll('.beat-slot');
            beatSlots.forEach(slot => slot.classList.remove('active'));
            
            if (currentIndex < sequence.length) {
                beatSlots[currentIndex].classList.add('active');
                currentIndex++;
                
                setTimeout(playBeat, 500);
            } else {
                this.endRhythmGame();
            }
        };
        
        playBeat();
    }

    hitBeat() {
        const activeBeat = document.querySelector('.beat-slot.active');
        if (activeBeat) {
            const score = 10;
            const currentScore = parseInt(document.getElementById('rhythm-score').textContent);
            document.getElementById('rhythm-score').textContent = currentScore + score;
            
            // Kombo artır
            const currentCombo = parseInt(document.getElementById('combo').textContent);
            document.getElementById('combo').textContent = currentCombo + 1;
            
            activeBeat.classList.add('hit');
        }
    }

    // Toplama Oyunu
    startCollectionGame() {
        const gameArea = document.getElementById('mini-game-area');
        if (!gameArea) return;

        let score = 0;
        let timeLeft = 30;
        let collected = [];

        gameArea.innerHTML = `
            <div class="collection-game">
                <div class="game-header">
                    <h3>Kristal Toplama</h3>
                    <div class="game-stats">
                        <span>Skor: <span id="collection-score">0</span></span>
                        <span>Süre: <span id="collection-time">30</span></span>
                    </div>
                </div>
                <div class="collection-area" id="collection-area">
                    <!-- Kristaller burada belirecek -->
                </div>
                <div class="collection-instructions">
                    Kristalleri toplamak için tıkla!
                </div>
            </div>
        `;

        this.spawnCrystals();
        
        // Zamanlayıcı
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('collection-time').textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.endCollectionGame(score);
            }
        }, 1000);
    }

    spawnCrystals() {
        const collectionArea = document.getElementById('collection-area');
        const crystals = ['💎', '💍', '🔮', '⭐', '🌟'];
        
        const spawnCrystal = () => {
            const crystal = crystals[Math.floor(Math.random() * crystals.length)];
            const crystalElement = document.createElement('div');
            crystalElement.className = 'collectible-crystal';
            crystalElement.textContent = crystal;
            
            // Rastgele pozisyon
            const maxX = collectionArea.offsetWidth - 50;
            const maxY = collectionArea.offsetHeight - 50;
            crystalElement.style.left = Math.random() * maxX + 'px';
            crystalElement.style.top = Math.random() * maxY + 'px';
            
            crystalElement.addEventListener('click', () => {
                const scoreElement = document.getElementById('collection-score');
                const currentScore = parseInt(scoreElement.textContent);
                scoreElement.textContent = currentScore + 5;
                
                crystalElement.remove();
                
                // Yeni kristal oluştur
                setTimeout(spawnCrystal, 500);
            });
            
            collectionArea.appendChild(crystalElement);
            
            // 3 saniye sonra kaybol
            setTimeout(() => {
                if (crystalElement.parentNode) {
                    crystalElement.remove();
                    setTimeout(spawnCrystal, 1000);
                }
            }, 3000);
        };
        
        // Başlangıçta 5 kristal oluştur
        for (let i = 0; i < 5; i++) {
            setTimeout(spawnCrystal, i * 200);
        }
    }

    // Oyun bitiş fonksiyonları
    endMemoryGame(success = false) {
        const message = success ? 'Tebrikler! Hafıza oyununu tamamladın!' : 'Oyun bitti!';
        this.endMiniGame(message, this.gameScore);
    }

    endReflexGame(score) {
        const message = `Refleks oyunu bitti! Skor: ${score}`;
        this.endMiniGame(message, score);
    }

    endPuzzleGame(success = false) {
        const message = success ? 'Tebrikler! Bulmacayı tamamladın!' : 'Oyun bitti!';
        this.endMiniGame(message, this.gameScore);
    }

    endQuizGame(score) {
        const message = `Bilgi yarışması bitti! Skor: ${score}`;
        this.endMiniGame(message, score);
    }

    endRhythmGame() {
        const score = parseInt(document.getElementById('rhythm-score').textContent);
        const message = `Ritim oyunu bitti! Skor: ${score}`;
        this.endMiniGame(message, score);
    }

    endCollectionGame(score) {
        const message = `Kristal toplama bitti! Skor: ${score}`;
        this.endMiniGame(message, score);
    }

    endMiniGame(message, score) {
        const gameArea = document.getElementById('mini-game-area');
        if (!gameArea) return;

        gameArea.innerHTML = `
            <div class="game-result">
                <h3>Oyun Bitti!</h3>
                <p>${message}</p>
                <div class="final-score">Final Skoru: ${score}</div>
                <button onclick="closeMiniGame()">Geri Dön</button>
            </div>
        `;

        // Skoru ana oyuna ekle
        if (gameEngine) {
            gameEngine.playerData.score += score;
            gameEngine.updateUI();
        }
    }

    // Yardımcı fonksiyonlar
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    startTimer() {
        this.gameTime = 0;
        this.timerInterval = setInterval(() => {
            this.gameTime++;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

// Global mini oyun yöneticisi
const miniGameManager = new MiniGameManager();
