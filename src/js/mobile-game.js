// Word Fight - Mobil Oyun Motoru
class MobileWordGame {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            currentWord: '',
            availableLetters: [],
            foundWords: [],
            score: 0,
            timeLeft: 60,
            combo: 0,
            maxCombo: 0,
            category: 'genel',
            hint: '',
            powerups: {
                timeFreeze: 3,
                extraLetter: 2,
                superHint: 1,
                doublePoints: 1
            },
            round: 1,
            maxRounds: 5,
            difficulty: 'medium'
        };
        
        this.userData = {
            username: 'Oyuncu' + Math.floor(Math.random() * 10000),
            level: 1,
            xp: 0,
            totalScore: 0,
            achievements: [],
            stats: {
                gamesPlayed: 0,
                wordsFound: 0,
                winRate: 0,
                victories: 0,
                longestWord: 0,
                bestCombo: 0,
                totalPlayTime: 0
            },
            settings: {
                soundEnabled: true,
                vibrationEnabled: true,
                notificationsEnabled: true,
                autoPlayEnabled: false,
                aiDifficulty: 'medium'
            }
        };
        
        this.aiMode = null;
        this.roomData = null;
        this.timer = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Mobil optimizasyon
        this.isMobile = this.detectMobile();
        this.isTouch = 'ontouchstart' in window;
        
        // Kelime veritabanı
        this.wordDatabase = this.initializeWordDatabase();
        
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    setupMobileOptimizations() {
        // Viewport meta tag'ini ayarla
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        }
        
        // Safe area support
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
        document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
        document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevent scroll bounce
        document.body.addEventListener('touchmove', function(e) {
            if (e.target.closest('.game-arena')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    setupTouchEvents() {
        if (!this.isTouch) return;
        
        // Swipe gestures for screen navigation
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, false);
        
        // Letter selection with touch
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('letter')) {
                e.preventDefault();
                this.selectLetter(e.target);
            }
        });
        
        // Vibration feedback
        if ('vibrate' in navigator) {
            this.vibration = navigator.vibrate.bind(navigator);
        }
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 100;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - go to next screen or action
                this.handleSwipeLeft();
            } else {
                // Swipe right - go back
                this.handleSwipeRight();
            }
        }
    }
    
    handleSwipeLeft() {
        if (this.currentScreen === 'mainMenu') {
            this.quickPlay();
        } else if (this.currentScreen === 'gameScreen' && this.gameState.isPlaying) {
            this.submitWord();
        }
    }
    
    handleSwipeRight() {
        if (this.currentScreen !== 'mainMenu') {
            this.goBack();
        }
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('quickPlayBtn').addEventListener('click', () => this.quickPlay());
        document.getElementById('aiModeBtn').addEventListener('click', () => this.showAIMode());
        document.getElementById('createRoomBtn').addEventListener('click', () => this.showCreateRoom());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.showJoinRoom());
        document.getElementById('tournamentBtn').addEventListener('click', () => this.showTournament());
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        
        // Game screen
        document.getElementById('backFromGameBtn').addEventListener('click', () => this.leaveGame());
        document.getElementById('gameMenuBtn').addEventListener('click', () => this.showGameMenu());
        document.getElementById('submitWordBtn').addEventListener('click', () => this.submitWord());
        document.getElementById('wordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitWord();
            }
        });
        
        // Action buttons
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffleLetters());
        document.getElementById('hintBtn').addEventListener('click', () => this.useHint());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipWord());
        
        // FAB (Floating Action Button)
        const mainFab = document.getElementById('mainFab');
        const fabContainer = document.querySelector('.fab-container');
        
        mainFab.addEventListener('click', () => {
            fabContainer.classList.toggle('active');
        });
        
        document.getElementById('fabQuickPlay').addEventListener('click', () => {
            fabContainer.classList.remove('active');
            this.quickPlay();
        });
        
        document.getElementById('fabAI').addEventListener('click', () => {
            fabContainer.classList.remove('active');
            this.showAIMode();
        });
        
        document.getElementById('fabRoom').addEventListener('click', () => {
            fabContainer.classList.remove('active');
            this.showCreateRoom();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.currentScreen !== 'mainMenu') {
                    this.goBack();
                }
            }
        });
        
        // Prevent accidental back navigation
        window.addEventListener('popstate', (e) => {
            if (this.gameState.isPlaying) {
                e.preventDefault();
                this.showConfirmExit();
            }
        });
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
    }
    
    startLoadingTips() {
        const tips = [
            'En uzun kelimeler en çok puanı verir! 💡',
            'Hızlı cevaplar zaman bonusu kazandırır! ⚡',
            'Kombo yaparak ekstra puanlar kazan! 🔥',
            'AI rakiplerle zekanı test et! 🤖',
            'Güçlendirmeleri stratejik kullan! 🎯',
            'Her kategoride uzmanlaş! 🏆',
            'Günlük challenge\'ları tamamla! 🎯',
            'Arkadaşlarını davet et ve yarış! 👥'
        ];
        
        let tipIndex = 0;
        const tipElement = document.getElementById('loadingTip');
        
        setInterval(() => {
            if (tipElement) {
                tipElement.style.opacity = '0';
                setTimeout(() => {
                    tipElement.textContent = tips[tipIndex];
                    tipElement.style.opacity = '1';
                    tipIndex = (tipIndex + 1) % tips.length;
                }, 300);
            }
        }, 3000);
    }
    
    showScreen(screenId) {
        // Tüm ekranları gizle
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // İstenen ekranı göster
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // Ekran özel işlemler
            this.handleScreenChange(screenId);
        }
    }
    
    handleScreenChange(screenId) {
        switch (screenId) {
            case 'mainMenu':
                this.updateOnlineCount();
                this.updateDailyChallenge();
                break;
            case 'gameScreen':
                this.setupGameScreen();
                break;
            case 'aiModeScreen':
                this.setupAIModeScreen();
                break;
            case 'leaderboardScreen':
                this.loadLeaderboard('daily');
                break;
            case 'profileScreen':
                this.updateProfile();
                break;
        }
    }
    
    quickPlay() {
        this.showLoadingScreen();
        
        setTimeout(() => {
            this.startQuickGame();
            this.hideLoadingScreen();
            this.showScreen('gameScreen');
            this.showToast('⚡ Hızlı oyun başladı!', 'success');
        }, 1500);
    }
    
    startQuickGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.score = 0;
        this.gameState.combo = 0;
        this.gameState.round = 1;
        this.gameState.foundWords = [];
        this.gameState.timeLeft = 60;
        
        this.generateNewWord();
        this.startTimer();
        this.updateGameDisplay();
        
        // Haptic feedback
        this.vibrate(50);
    }
    
    generateNewWord() {
        const categories = Object.keys(this.wordDatabase);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const words = this.wordDatabase[category];
        
        if (words.length === 0) {
            this.generateNewWord();
            return;
        }
        
        const randomWord = words[Math.floor(Math.random() * words.length)];
        this.gameState.currentWord = randomWord.word;
        this.gameState.availableLetters = [...randomWord.letters];
        this.gameState.category = category;
        this.gameState.hint = randomWord.hint;
        
        this.shuffleLetters();
        this.updateLetterDisplay();
        this.updateCategoryDisplay();
    }
    
    shuffleLetters() {
        const letters = [...this.gameState.availableLetters];
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        this.gameState.availableLetters = letters;
        this.updateLetterDisplay();
        
        // Animation
        this.animateLetterShuffle();
    }
    
    updateLetterDisplay() {
        const letterGrid = document.getElementById('letterGrid');
        if (!letterGrid) return;
        
        letterGrid.innerHTML = '';
        
        this.gameState.availableLetters.forEach((letter, index) => {
            const letterElement = document.createElement('div');
            letterElement.className = 'letter';
            letterElement.textContent = letter;
            letterElement.dataset.index = index;
            
            letterElement.addEventListener('click', () => this.selectLetter(letterElement));
            
            // Animation
            setTimeout(() => {
                letterElement.style.animation = 'letterAppear 0.3s ease-out';
            }, index * 50);
            
            letterGrid.appendChild(letterElement);
        });
    }
    
    selectLetter(letterElement) {
        letterElement.classList.toggle('selected');
        
        // Haptic feedback
        this.vibrate(10);
        
        // Sound effect
        this.playSound('letterClick');
    }
    
    updateCategoryDisplay() {
        const categoryElement = document.querySelector('.category-name');
        if (categoryElement) {
            const categoryNames = {
                'genel': 'Genel Kültür',
                'bilim': 'Bilim',
                'spor': 'Spor',
                'muzik': 'Müzik',
                'sinema': 'Sinema',
                'teknoloji': 'Teknoloji'
            };
            
            categoryElement.textContent = 'Kategori: ' + (categoryNames[this.gameState.category] || this.gameState.category);
        }
    }
    
    submitWord() {
        const input = document.getElementById('wordInput');
        const word = input.value.toUpperCase().trim();
        
        if (!word) return;
        
        if (this.validateWord(word)) {
            this.addFoundWord(word);
            this.calculateScore(word);
            input.value = '';
            
            // Success feedback
            this.vibrate([50, 50, 50]);
            this.playSound('wordFound');
            this.showWordFoundAnimation(word);
            
            // Generate new word
            setTimeout(() => {
                this.generateNewWord();
            }, 1000);
        } else {
            // Error feedback
            this.vibrate(100);
            this.playSound('error');
            this.showToast('❌ Geçersiz kelime!', 'error');
            input.value = '';
        }
    }
    
    validateWord(word) {
        // Check if word can be formed with available letters
        const availableLetters = [...this.gameState.availableLetters];
        const wordLetters = word.split('');
        
        for (const letter of wordLetters) {
            const index = availableLetters.indexOf(letter);
            if (index === -1) {
                return false;
            }
            availableLetters.splice(index, 1);
        }
        
        // Check if word was already found
        return !this.gameState.foundWords.includes(word);
    }
    
    addFoundWord(word) {
        this.gameState.foundWords.push(word);
        this.updateFoundWordsDisplay();
        
        // Update combo
        this.gameState.combo++;
        if (this.gameState.combo > this.gameState.maxCombo) {
            this.gameState.maxCombo = this.gameState.combo;
        }
        
        // Update stats
        if (word.length > this.userData.stats.longestWord) {
            this.userData.stats.longestWord = word.length;
        }
    }
    
    calculateScore(word) {
        let score = word.length * 10;
        
        // Length bonuses
        if (word.length > 6) score += 20;
        if (word.length > 8) score += 50;
        
        // Combo bonus
        if (this.gameState.combo > 2) {
            score += this.gameState.combo * 5;
        }
        
        // Speed bonus (if word found quickly)
        if (this.gameState.timeLeft > 45) {
            score += 15;
        }
        
        // Double points powerup
        if (this.gameState.powerups.doublePoints > 0) {
            score *= 2;
            this.gameState.powerups.doublePoints--;
        }
        
        this.gameState.score += score;
        this.updateScoreDisplay();
        
        // Add XP
        this.addXP(score / 10);
    }
    
    showWordFoundAnimation(word) {
        const score = this.calculateWordScore(word);
        
        const animation = document.createElement('div');
        animation.className = 'word-found-animation';
        animation.innerHTML = '<div class="word-text">' + word + '</div><div class="word-score">+' + score + '</div>';
        
        animation.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px 30px; border-radius: 16px; font-weight: 700; font-size: 1.2rem; z-index: 2000; animation: wordScore 1s ease-out forwards; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);';
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 1000);
    }
    
    calculateWordScore(word) {
        let score = word.length * 10;
        if (word.length > 6) score += 20;
        if (word.length > 8) score += 50;
        if (this.gameState.combo > 2) score += this.gameState.combo * 5;
        if (this.gameState.timeLeft > 45) score += 15;
        return score;
    }
    
    useHint() {
        if (this.gameState.powerups.superHint > 0) {
            this.gameState.powerups.superHint--;
            this.updateHintDisplay();
            this.showToast('💡 İpucu: ' + this.gameState.hint, 'info');
            this.vibrate(50);
        } else {
            this.showToast('❌ İpucu hakkınız kalmadı!', 'warning');
        }
    }
    
    updateHintDisplay() {
        const hintElement = document.querySelector('.word-hint .hint-text');
        if (hintElement && this.gameState.powerups.superHint === 0) {
            hintElement.textContent = 'İpucu hakkınız kalmadı';
        }
    }
    
    skipWord() {
        if (this.gameState.powerups.extraLetter > 0) {
            this.gameState.powerups.extraLetter--;
            this.generateNewWord();
            this.showToast('⏭️ Kelime atlandı!', 'info');
            this.vibrate(50);
        } else {
            this.showToast('❌ Atlama hakkınız kalmadı!', 'warning');
        }
    }
    
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.gameState.timeLeft--;
            this.updateTimerDisplay();
            
            // Warning effects
            if (this.gameState.timeLeft === 10) {
                this.playSound('warning');
                this.vibrate([100, 100, 100]);
            }
            
            if (this.gameState.timeLeft <= 0) {
                this.endRound();
            }
        }, 1000);
    }
    
    endRound() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.gameState.isPlaying = false;
        
        // Show round results
        this.showRoundResults();
        
        // Check if game is over
        if (this.gameState.round >= this.gameState.maxRounds) {
            this.endGame();
        } else {
            // Prepare for next round
            setTimeout(() => {
                this.nextRound();
            }, 3000);
        }
    }
    
    showRoundResults() {
        const roundScore = this.gameState.score;
        const wordsFound = this.gameState.foundWords.length;
        const combo = this.gameState.combo;
        
        this.showToast('🎯 Tur ' + this.gameState.round + ' bitti! Skor: ' + this.gameState.score, 'success');
        
        // Update stats
        this.userData.stats.wordsFound += wordsFound;
        this.userData.stats.bestCombo = Math.max(this.userData.stats.bestCombo, combo);
    }
    
    nextRound() {
        this.gameState.round++;
        this.gameState.timeLeft = 60;
        this.gameState.foundWords = [];
        this.gameState.combo = 0;
        
        this.generateNewWord();
        this.startTimer();
        this.updateGameDisplay();
        
        this.showToast('🚀 Tur ' + this.gameState.round + ' başladı!', 'info');
        this.vibrate(50);
    }
    
    endGame() {
        this.gameState.isPlaying = false;
        
        // Update user stats
        this.userData.stats.gamesPlayed++;
        this.userData.totalScore += this.gameState.score;
        
        // Show game results
        this.showGameResults();
        
        // Save data
        this.saveUserData();
        
        // Check achievements
        this.checkAchievements();
    }
    
    showGameResults() {
        const accuracy = this.gameState.foundWords.length > 0 ? 
            Math.round((this.gameState.foundWords.length / 10) * 100) : 0;
        
        const resultsHTML = '<div class="game-results-modal"><h2>🎮 Oyun Bitti!</h2><div class="results-stats"><div class="stat-item"><span class="stat-label">Toplam Skor</span><span class="stat-value">' + this.gameState.score + '</span></div><div class="stat-item"><span class="stat-label">Bulunan Kelime</span><span class="stat-value">' + this.gameState.foundWords.length + '</span></div><div class="stat-item"><span class="stat-label">En İyi Kombo</span><span class="stat-value">' + this.gameState.maxCombo + '</span></div><div class="stat-item"><span class="stat-label">Başarı Oranı</span><span class="stat-value">' + accuracy + '%</span></div></div><div class="found-words-summary"><h4>Bulunan Kelimeler:</h4><div class="words-summary">' + this.gameState.foundWords.map(word => '<span class="word-tag">' + word + '</span>').join('') + '</div></div><div class="results-actions"><button class="btn btn-primary" onclick="game.playAgain()">Tekrar Oyna</button><button class="btn btn-secondary" onclick="game.showScreen(\'mainMenu\')">Ana Menü</button></div></div>';
        
        this.showModal(resultsHTML);
    }
    
    playAgain() {
        this.closeModal();
        this.quickPlay();
    }
    
    updateGameDisplay() {
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.updateFoundWordsDisplay();
        this.updatePowerupDisplay();
        this.updateRoundDisplay();
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('playerScore');
        if (scoreElement) {
            const currentScore = parseInt(scoreElement.textContent) || 0;
            if (this.gameState.score > currentScore) {
                scoreElement.style.animation = 'scoreIncrease 0.5s ease';
                setTimeout(() => {
                    scoreElement.style.animation = '';
                }, 500);
            }
            scoreElement.textContent = this.gameState.score;
        }
    }
    
    updateTimerDisplay() {
        const timerElement = document.getElementById('timeLeft');
        if (timerElement) {
            timerElement.textContent = this.gameState.timeLeft;
            
            // Warning effects
            if (this.gameState.timeLeft <= 10) {
                timerElement.style.color = 'var(--error-color)';
                timerElement.parentElement.classList.add('warning');
            } else {
                timerElement.style.color = 'var(--text-primary)';
                timerElement.parentElement.classList.remove('warning');
            }
        }
    }
    
    updateFoundWordsDisplay() {
        const countElement = document.getElementById('foundWordsCount');
        const gridElement = document.getElementById('foundWordsGrid');
        
        if (countElement) {
            countElement.textContent = this.gameState.foundWords.length;
        }
        
        if (gridElement) {
            gridElement.innerHTML = '';
            this.gameState.foundWords.forEach((word, index) => {
                const wordElement = document.createElement('div');
                wordElement.className = 'word-item';
                wordElement.textContent = word;
                wordElement.style.animation = 'wordFound 0.3s ease-out ' + (index * 0.1) + 's both';
                gridElement.appendChild(wordElement);
            });
        }
    }
    
    updatePowerupDisplay() {
        const powerupElement = document.getElementById('powerupCount');
        if (powerupElement) {
            const totalPowerups = Object.values(this.gameState.powerups).reduce((sum, count) => sum + count, 0);
            powerupElement.textContent = totalPowerups;
        }
    }
    
    updateRoundDisplay() {
        const roundElement = document.querySelector('.round-number');
        if (roundElement) {
            roundElement.textContent = 'Tur ' + this.gameState.round + '/' + this.gameState.maxRounds;
        }
    }
    
    // AI Mode
    showAIMode() {
        this.showScreen('aiModeScreen');
    }
    
    setupAIModeScreen() {
        // Difficulty selection
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.userData.settings.aiDifficulty = card.dataset.level;
                this.vibrate(10);
            });
        });
        
        // Personality selection
        document.querySelectorAll('.personality-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.personality-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.vibrate(10);
            });
        });
        
        // Start AI game
        document.getElementById('startAIGameBtn').addEventListener('click', () => {
            this.startAIGame();
        });
        
        // AI settings
        document.getElementById('aiLearning').addEventListener('change', (e) => {
            this.userData.settings.aiLearning = e.target.checked;
        });
        
        document.getElementById('aiChat').addEventListener('change', (e) => {
            this.userData.settings.aiChat = e.target.checked;
        });
        
        document.getElementById('aiHints').addEventListener('change', (e) => {
            this.userData.settings.aiHints = e.target.checked;
        });
    }
    
    startAIGame() {
        const difficulty = document.querySelector('.difficulty-card.selected')?.dataset.level || 'medium';
        const personality = document.querySelector('.personality-option.selected')?.dataset.personality || 'balanced';
        
        this.showLoadingScreen();
        
        setTimeout(() => {
            // Initialize AI game
            this.aiMode = new MobileAIMode(this, difficulty, personality);
            this.aiMode.startGame();
            
            this.hideLoadingScreen();
            this.showScreen('gameScreen');
            this.showToast('🤖 AI oyunu başladı! (' + difficulty + ')', 'success');
        }, 1500);
    }
    
    // Utility functions
    vibrate(pattern) {
        if (this.userData.settings.vibrationEnabled && this.vibration) {
            this.vibration(pattern);
        }
    }
    
    playSound(soundName) {
        if (!this.userData.settings.soundEnabled) return;
        
        // Sound implementation would go here
        console.log('🔊 Playing sound: ' + soundName);
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = '<span class="toast-icon">' + this.getToastIcon(type) + '</span><span class="toast-message">' + message + '</span>';
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
    
    getToastIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
    
    showModal(content) {
        const container = document.getElementById('modalContainer');
        if (!container) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = content;
        
        container.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    closeModal() {
        const container = document.getElementById('modalContainer');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    showConfirmExit() {
        const confirmHTML = '<div class="confirm-exit-modal"><h3>Oyundan Çık</h3><p>Oyun devam ediyor. Çıkmak istediğinizden emin misiniz?</p><div class="confirm-actions"><button class="btn btn-secondary" onclick="game.closeModal()">İptal</button><button class="btn btn-error" onclick="game.leaveGame()">Çık</button></div></div>';
        
        this.showModal(confirmHTML);
    }
    
    leaveGame() {
        if (this.gameState.isPlaying) {
            this.endGame();
        }
        
        this.closeModal();
        this.showScreen('mainMenu');
        this.showToast('👋 Oyundan çıkıldı', 'info');
    }
    
    goBack() {
        if (this.currentScreen === 'gameScreen' && this.gameState.isPlaying) {
            this.showConfirmExit();
        } else {
            this.showScreen('mainMenu');
        }
    }
    
    // Data management
    saveUserData() {
        localStorage.setItem('wordFightUserData', JSON.stringify(this.userData));
    }
    
    loadUserData() {
        try {
            const saved = localStorage.getItem('wordFightUserData');
            if (saved) {
                this.userData = { ...this.userData, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }
    
    addXP(amount) {
        this.userData.xp += Math.floor(amount);
        
        // Level up check
        const xpForNextLevel = this.userData.level * 100;
        if (this.userData.xp >= xpForNextLevel) {
            this.userData.level++;
            this.userData.xp -= xpForNextLevel;
            this.showToast('🎉 Seviye ' + this.userData.level + ' oldu!', 'success');
            this.vibrate([100, 50, 100]);
        }
    }
    
    checkAchievements() {
        const achievements = [
            { id: 'firstWord', name: 'İlk Kelime', condition: this.userData.stats.wordsFound >= 1 },
            { id: 'wordMaster', name: 'Kelime Ustası', condition: this.userData.stats.wordsFound >= 100 },
            { id: 'comboKing', name: 'Kombo Kralı', condition: this.userData.stats.bestCombo >= 10 },
            { id: 'speedDemon', name: 'Hız Şeytanı', condition: this.gameState.timeLeft > 50 },
            { id: 'longWord', name: 'Uzun Kelime', condition: this.userData.stats.longestWord >= 8 }
        ];
        
        achievements.forEach(achievement => {
            if (achievement.condition && !this.userData.achievements.includes(achievement.id)) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    unlockAchievement(achievement) {
        this.userData.achievements.push(achievement.id);
        this.showToast('🏆 Başarım kilidi: ' + achievement.name + '!', 'success');
        this.vibrate([100, 50, 100, 50, 100]);
    }
    
    updateOnlineCount() {
        const count = 10000 + Math.floor(Math.random() * 5000);
        const element = document.getElementById('onlineCount');
        if (element) {
            element.textContent = count.toLocaleString() + ' oyuncu çevrimiçi';
        }
    }
    
    updateDailyChallenge() {
        // Update daily challenge progress
        const progress = this.userData.stats.wordsFound % 50;
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = ((progress / 50) * 100) + '%';
        }
        
        if (progressText) {
            progressText.textContent = progress + '/50';
        }
    }
    
    // Word database
    initializeWordDatabase() {
        return {
            genel: [
                { word: 'ELMA', hint: 'Kırmızı bir meyve', letters: ['E', 'L', 'M', 'A'] },
                { word: 'KİTAP', hint: 'Okuma aracı', letters: ['K', 'İ', 'T', 'A', 'P'] },
                { word: 'ARABA', hint: 'Ulaşım aracı', letters: ['A', 'R', 'A', 'B', 'A'] },
                { word: 'GÜNEŞ', hint: 'Gökteki yıldız', letters: ['G', 'Ü', 'N', 'E', 'Ş'] },
                { word: 'TELEFON', hint: 'İletişim cihazı', letters: ['T', 'E', 'L', 'E', 'F', 'O', 'N'] },
                { word: 'BİLGİSAYAR', hint: 'Elektronik cihaz', letters: ['B', 'İ', 'L', 'G', 'İ', 'S', 'A', 'Y', 'A', 'R'] },
                { word: 'OKUL', hint: 'Eğitim yeri', letters: ['O', 'K', 'U', 'L'] },
                { word: 'YAZ', hint: 'Mevsim', letters: ['Y', 'A', 'Z'] },
                { word: 'KEDİ', hint: 'Evcil hayvan', letters: ['K', 'E', 'D', 'İ'] },
                { word: 'SU', hint: 'İçecek', letters: ['S', 'U'] }
            ],
            bilim: [
                { word: 'ATOM', hint: 'Maddenin en küçük birimi', letters: ['A', 'T', 'O', 'M'] },
                { word: 'ENERJİ', hint: 'Güç kapasitesi', letters: ['E', 'N', 'E', 'R', 'J', 'İ'] },
                { word: 'GALAKSİ', hint: 'Yıldız sistemi', letters: ['G', 'A', 'L', 'A', 'K', 'S', 'İ'] },
                { word: 'DNA', hint: 'Genetik kod', letters: ['D', 'N', 'A'] },
                { word: 'FİZİK', hint: 'Bilim dalı', letters: ['F', 'İ', 'Z', 'İ', 'K'] },
                { word: 'KİMYA', hint: 'Elementler bilimi', letters: ['K', 'İ', 'M', 'Y', 'A'] },
                { word: 'BİYOLOJİ', hint: 'Yaşam bilimi', letters: ['B', 'İ', 'Y', 'O', 'L', 'O', 'J', 'İ'] },
                { word: 'MATEMATİK', hint: 'Sayılar bilimi', letters: ['M', 'A', 'T', 'E', 'M', 'A', 'T', 'İ', 'K'] }
            ],
            spor: [
                { word: 'FUTBOL', hint: 'En popüler spor', letters: ['F', 'U', 'T', 'B', 'O', 'L'] },
                { word: 'BASKETBOL', hint: 'Pot sporu', letters: ['B', 'A', 'S', 'K', 'E', 'T', 'B', 'O', 'L'] },
                { word: 'YÜZME', hint: 'Spor dalı', letters: ['Y', 'Ü', 'Z', 'M', 'E'] },
                { word: 'KOŞU', hint: 'Atletizm', letters: ['K', 'O', 'Ş', 'U'] },
                { word: 'TENİS', hint: 'Raket sporu', letters: ['T', 'E', 'N', 'İ', 'S'] },
                { word: 'Voleybol', hint: 'File sporu', letters: ['V', 'O', 'L', 'E', 'Y', 'B', 'O', 'L'] }
            ],
            muzik: [
                { word: 'PIYANO', hint: 'Tuşlu enstrüman', letters: ['P', 'İ', 'Y', 'A', 'N', 'O'] },
                { word: 'GİTAR', hint: 'Telli enstrüman', letters: ['G', 'İ', 'T', 'A', 'R'] },
                { word: 'DAVUL', hint: 'Vurmalı enstrüman', letters: ['D', 'A', 'V', 'U', 'L'] },
                { word: 'KEMAN', hint: 'Yaylı enstrüman', letters: ['K', 'E', 'M', 'A', 'N'] },
                { word: 'FLÜT', hint: 'Nefesli enstrüman', letters: ['F', 'L', 'Ü', 'T'] },
                { word: 'SAKSOFON', hint: 'Ahşap nefesli', letters: ['S', 'A', 'K', 'S', 'O', 'F', 'O', 'N'] }
            ],
            sinema: [
                { word: 'FİLM', hint: 'Gösteri sanatı', letters: ['F', 'İ', 'L', 'M'] },
                { word: 'YÖNETMEN', hint: 'Film yöneten kişi', letters: ['Y', 'Ö', 'N', 'E', 'T', 'M', 'E', 'N'] },
                { word: 'OYUNCU', hint: 'Rol yapan kişi', letters: ['O', 'Y', 'U', 'N', 'C', 'U'] },
                { word: 'SENARYO', hint: 'Film metni', letters: ['S', 'E', 'N', 'A', 'R', 'Y', 'O'] },
                { word: 'KAMERA', hint: 'Çekim aracı', letters: ['K', 'A', 'M', 'E', 'R', 'A'] }
            ],
            teknoloji: [
                { word: 'YAZILIM', hint: 'Bilgisayar programları', letters: ['Y', 'A', 'Z', 'İ', 'L', 'İ', 'M'] },
                { word: 'DONANIM', hint: 'Fiziksel parçalar', letters: ['D', 'O', 'N', 'A', 'N', 'I', 'M'] },
                { word: 'İNTERNET', hint: 'Global ağ', letters: ['İ', 'N', 'T', 'E', 'R', 'N', 'E', 'T'] },
                { word: 'UYDU', hint: 'Uzda cihaz', letters: ['U', 'Y', 'D', 'U'] },
                { word: 'ROBOT', hint: 'Yapay zekâ', letters: ['R', 'O', 'B', 'O', 'T'] }
            ]
        };
    }
    
    // Animation helpers
    animateLetterShuffle() {
        const letters = document.querySelectorAll('.letter');
        letters.forEach((letter, index) => {
            letter.style.animation = 'none';
            setTimeout(() => {
                letter.style.animation = 'letterShuffle 0.5s ease-out ' + (index * 0.05) + 's';
            }, 10);
        });
    }
    
    // Placeholder methods for other screens
    showCreateRoom() {
        this.showToast('🏠 Oda oluşturma yakında!', 'info');
    }
    
    showJoinRoom() {
        this.showToast('🔗 Odaya katılma yakında!', 'info');
    }
    
    showTournament() {
        this.showToast('🏆 Turnuva modu yakında!', 'info');
    }
    
    showLeaderboard() {
        this.showScreen('leaderboardScreen');
    }
    
    loadLeaderboard(period) {
        // Placeholder for leaderboard loading
        console.log('Loading leaderboard for period: ' + period);
    }
    
    showProfile() {
        this.showScreen('profileScreen');
    }
    
    updateProfile() {
        // Update profile display
        console.log('Updating profile display');
    }
    
    showSettings() {
        this.showToast('⚙️ Ayarlar yakında!', 'info');
    }
    
    showGameMenu() {
        this.showConfirmExit();
    }
    
    setupGameScreen() {
        // Setup game screen specific elements
        console.log('Setting up game screen');
    }
    
    init() {
        console.log('📱 Word Fight Mobil başlatılıyor...');
        
        // Loading ekranını göster
        this.showLoadingScreen();
        
        // Sistemleri başlat
        this.loadUserData();
        this.setupEventListeners();
        this.setupTouchEvents();
        this.setupMobileOptimizations();
        
        // Loading ipuçlarını başlat
        this.startLoadingTips();
        
        // Loading'i bitir
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showScreen('mainMenu');
            this.updateOnlineCount();
        }, 2000);
        
        console.log('✅ Word Fight Mobil hazır!');
    }
}

// Initialize the game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new MobileWordGame();
    window.game = game;
});

// Global access
window.MobileWordGame = MobileWordGame;
