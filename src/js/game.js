// Kelime Savaşı - Oyun Motoru
class WordBattleGame {
    constructor() {
        this.currentScreen = 'mainMenu';
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
                victories: 0
            }
        };
        
        this.roomData = null;
        this.gameState = {
            isPlaying: false,
            currentWord: '',
            availableLetters: [],
            foundWords: [],
            score: 0,
            timeLeft: 60,
            category: 'Genel Kültür',
            hint: '',
            powerups: {
                timeFreeze: 3,
                extraLetter: 2,
                superHint: 1
            }
        };
        
        this.timer = null;
        this.socket = null;
        
        // Kelime veritabanı
        this.wordDatabase = this.initializeWordDatabase();
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.showScreen('mainMenu');
        this.updateOnlineCount();
        
        console.log('Kelime Savaşı başlatıldı!');
    }
    
    initializeWordDatabase() {
        return {
            genel: [
                { word: 'ELMA', hint: 'Kırmızı bir meyve', letters: ['E', 'L', 'M', 'A'], difficulty: 1 },
                { word: 'BİLGİSAYAR', hint: 'Elektronik cihaz', letters: ['B', 'İ', 'L', 'G', 'İ', 'S', 'A', 'Y', 'A', 'R'], difficulty: 3 },
                { word: 'KİTAP', hint: 'Okuma materyali', letters: ['K', 'İ', 'T', 'A', 'P'], difficulty: 1 },
                { word: 'ARABA', hint: 'Ulaşım aracı', letters: ['A', 'R', 'A', 'B', 'A'], difficulty: 1 },
                { word: 'GÜNEŞ', hint: 'Gökteki yıldız', letters: ['G', 'Ü', 'N', 'E', 'Ş'], difficulty: 1 },
                { word: 'TELEFON', hint: 'İletişim cihazı', letters: ['T', 'E', 'L', 'E', 'F', 'O', 'N'], difficulty: 2 },
                { word: 'OKUL', hint: 'Eğitim yeri', letters: ['O', 'K', 'U', 'L'], difficulty: 1 },
                { word: 'SU', hint: 'İçecek', letters: ['S', 'U'], difficulty: 1 },
                { word: 'YAZ', hint: 'Mevsim', letters: ['Y', 'A', 'Z'], difficulty: 1 },
                { word: 'KEDİ', hint: 'Evcil hayvan', letters: ['K', 'E', 'D', 'İ'], difficulty: 1 }
            ],
            bilim: [
                { word: 'ATOM', hint: 'Maddenin en küçük birimi', letters: ['A', 'T', 'O', 'M'], difficulty: 2 },
                { word: 'ENERJİ', hint: 'Güç kapasitesi', letters: ['E', 'N', 'E', 'R', 'J', 'İ'], difficulty: 2 },
                { word: 'GALAKSİ', hint: 'Yıldız sistemi', letters: ['G', 'A', 'L', 'A', 'K', 'S', 'İ'], difficulty: 3 },
                { word: 'DNA', hint: 'Genetik kod', letters: ['D', 'N', 'A'], difficulty: 2 },
                { word: 'FİZİK', hint: 'Bilim dalı', letters: ['F', 'İ', 'Z', 'İ', 'K'], difficulty: 2 }
            ],
            spor: [
                { word: 'FUTBOL', hint: 'En popüler spor', letters: ['F', 'U', 'T', 'B', 'O', 'L'], difficulty: 1 },
                { word: 'BASKETBOL', hint: 'Pot sporu', letters: ['B', 'A', 'S', 'K', 'E', 'T', 'B', 'O', 'L'], difficulty: 2 },
                { word: 'YÜZME', hint: 'Spor dalı', letters: ['Y', 'Ü', 'Z', 'M', 'E'], difficulty: 1 },
                { word: 'KOŞU', hint: 'Atletizm', letters: ['K', 'O', 'Ş', 'U'], difficulty: 1 }
            ],
            muzik: [
                { word: 'PIYANO', hint: 'Tuşlu enstrüman', letters: ['P', 'İ', 'Y', 'A', 'N', 'O'], difficulty: 2 },
                { word: 'GİTAR', hint: 'Telli enstrüman', letters: ['G', 'İ', 'T', 'A', 'R'], difficulty: 1 },
                { word: 'DAVUL', hint: 'Vurmalı enstrüman', letters: ['D', 'A', 'V', 'U', 'L'], difficulty: 1 },
                { word: 'KEMAN', hint: 'Yaylı enstrüman', letters: ['K', 'E', 'M', 'A', 'N'], difficulty: 2 }
            ]
        };
    }
    
    setupEventListeners() {
        // Ana menü butonları
        document.getElementById('quickPlayBtn').addEventListener('click', () => this.quickPlay());
        document.getElementById('createRoomBtn').addEventListener('click', () => this.showScreen('createRoomScreen'));
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.showScreen('joinRoomScreen'));
        document.getElementById('profileBtn').addEventListener('click', () => this.showScreen('profileScreen'));
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showScreen('leaderboardScreen'));
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        
        // Geri butonları
        document.getElementById('backFromCreateBtn').addEventListener('click', () => this.showScreen('mainMenu'));
        document.getElementById('backFromJoinBtn').addEventListener('click', () => this.showScreen('mainMenu'));
        document.getElementById('backFromProfileBtn').addEventListener('click', () => this.showScreen('mainMenu'));
        document.getElementById('backFromLeaderboardBtn').addEventListener('click', () => this.showScreen('mainMenu'));
        
        // Oda oluşturma
        document.getElementById('createRoomConfirmBtn').addEventListener('click', () => this.createRoom());
        
        // Oyun odası
        document.getElementById('leaveRoomBtn').addEventListener('click', () => this.leaveRoom());
        document.getElementById('wordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitWord();
            }
        });
        
        // Oyun aksiyon butonları
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffleLetters());
        document.getElementById('hintBtn').addEventListener('click', () => this.useHint());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipWord());
        
        // Sohbet
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        document.getElementById('sendChatBtn').addEventListener('click', () => this.sendChatMessage());
        
        // Liderlik tablosu sekmeleri
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLeaderboardTab(e.target.dataset.period));
        });
        
        // Klavye kısayolları
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.currentScreen !== 'mainMenu') {
                    this.showScreen('mainMenu');
                }
            }
        });
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
                break;
            case 'joinRoomScreen':
                this.loadRoomList();
                break;
            case 'profileScreen':
                this.updateProfile();
                break;
            case 'leaderboardScreen':
                this.loadLeaderboard('daily');
                break;
        }
    }
    
    quickPlay() {
        this.showLoadingScreen();
        
        // Hızlı oyun için rastgele oda bul veya oluştur
        setTimeout(() => {
            this.createQuickRoom();
        }, 1500);
    }
    
    createQuickRoom() {
        const roomData = {
            id: this.generateRoomId(),
            name: 'Hızlı Oda',
            maxPlayers: 4,
            gameMode: 'classic',
            roundTime: 60,
            category: 'all',
            isPublic: true,
            host: this.userData.username
        };
        
        this.joinRoom(roomData);
        this.hideLoadingScreen();
        this.showScreen('gameRoom');
        this.startGame();
    }
    
    createRoom() {
        const roomName = document.getElementById('roomName').value.trim();
        const roomPassword = document.getElementById('roomPassword').value;
        const maxPlayers = parseInt(document.getElementById('maxPlayers').value);
        const gameMode = document.getElementById('gameMode').value;
        const roundTime = parseInt(document.getElementById('roundTime').value);
        const category = document.getElementById('category').value;
        
        if (!roomName) {
            this.showNotification('Oda adı giriniz!', 'error');
            return;
        }
        
        const roomData = {
            id: this.generateRoomId(),
            name: roomName,
            password: roomPassword,
            maxPlayers: maxPlayers,
            gameMode: gameMode,
            roundTime: roundTime,
            category: category,
            isPublic: !roomPassword,
            host: this.userData.username
        };
        
        this.joinRoom(roomData);
        this.showScreen('gameRoom');
        this.showNotification('Oda başarıyla oluşturuldu!', 'success');
    }
    
    joinRoom(roomData) {
        this.roomData = roomData;
        this.updateRoomDisplay();
        
        // Odaya katılma simülasyonu
        setTimeout(() => {
            this.addPlayerToRoom(this.userData.username);
        }, 1000);
    }
    
    leaveRoom() {
        if (this.gameState.isPlaying) {
            if (!confirm('Oyun devam ediyor. Odadan çıkmak istediğinizden emin misiniz?')) {
                return;
            }
            this.endGame();
        }
        
        this.roomData = null;
        this.showScreen('mainMenu');
        this.showNotification('Odadan ayrıldınız', 'info');
    }
    
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.score = 0;
        this.gameState.foundWords = [];
        this.gameState.timeLeft = this.roomData.roundTime || 60;
        
        this.generateNewWord();
        this.startTimer();
        this.updateGameDisplay();
        
        this.showNotification('Oyun başladı!', 'success');
    }
    
    generateNewWord() {
        const category = this.roomData.category === 'all' ? 'genel' : this.roomData.category;
        const words = this.wordDatabase[category] || this.wordDatabase.genel;
        
        if (words.length === 0) {
            this.generateNewWord();
            return;
        }
        
        const randomWord = words[Math.floor(Math.random() * words.length)];
        this.gameState.currentWord = randomWord.word;
        this.gameState.availableLetters = [...randomWord.letters];
        this.gameState.hint = randomWord.hint;
        
        this.shuffleLetters();
        this.updateLetterDisplay();
    }
    
    shuffleLetters() {
        const letters = [...this.gameState.availableLetters];
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        this.gameState.availableLetters = letters;
        this.updateLetterDisplay();
    }
    
    updateLetterDisplay() {
        const letterGrid = document.getElementById('letterGrid');
        letterGrid.innerHTML = '';
        
        this.gameState.availableLetters.forEach((letter, index) => {
            const letterElement = document.createElement('div');
            letterElement.className = 'letter';
            letterElement.textContent = letter;
            letterElement.dataset.index = index;
            
            letterElement.addEventListener('click', () => this.selectLetter(index));
            
            letterGrid.appendChild(letterElement);
        });
    }
    
    selectLetter(index) {
        const letters = document.querySelectorAll('.letter');
        letters[index].classList.toggle('selected');
    }
    
    submitWord() {
        const input = document.getElementById('wordInput');
        const word = input.value.toUpperCase().trim();
        
        if (!word) return;
        
        if (this.validateWord(word)) {
            this.addFoundWord(word);
            this.calculateScore(word);
            input.value = '';
            
            // Yeni kelime生成
            setTimeout(() => {
                this.generateNewWord();
            }, 1000);
        } else {
            this.showNotification('Geçersiz kelime!', 'error');
            input.value = '';
        }
    }
    
    validateWord(word) {
        // Kelime harflerin kullanılıp kullanılmadığını kontrol et
        const availableLetters = [...this.gameState.availableLetters];
        const wordLetters = word.split('');
        
        for (const letter of wordLetters) {
            const index = availableLetters.indexOf(letter);
            if (index === -1) {
                return false;
            }
            availableLetters.splice(index, 1);
        }
        
        // Aynı kelime daha önce bulunmuş mu
        return !this.gameState.foundWords.includes(word);
    }
    
    addFoundWord(word) {
        this.gameState.foundWords.push(word);
        this.updateFoundWordsDisplay();
        
        // Animasyon efekti
        this.animateWordFound(word);
    }
    
    calculateScore(word) {
        let score = word.length * 10;
        
        // Bonus puanlar
        if (word.length > 6) score += 20;
        if (word.length > 8) score += 50;
        
        this.gameState.score += score;
        this.updateScoreDisplay();
        
        // XP ekle
        this.addXP(score / 10);
    }
    
    useHint() {
        if (this.gameState.powerups.superHint > 0) {
            this.gameState.powerups.superHint--;
            document.getElementById('wordHint').textContent = `İpucu: ${this.gameState.hint}`;
            this.updatePowerupsDisplay();
            this.showNotification('İpucu kullanıldı!', 'info');
        } else {
            this.showNotification('İpucu hakkınız kalmadı!', 'warning');
        }
    }
    
    skipWord() {
        if (this.gameState.powerups.extraLetter > 0) {
            this.gameState.powerups.extraLetter--;
            this.generateNewWord();
            this.updatePowerupsDisplay();
            this.showNotification('Kelime atlandı!', 'info');
        } else {
            this.showNotification('Atlatma hakkınız kalmadı!', 'warning');
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.gameState.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.gameState.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    endGame() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.gameState.isPlaying = false;
        
        // İstatistikleri güncelle
        this.userData.stats.gamesPlayed++;
        this.userData.stats.wordsFound += this.gameState.foundWords.length;
        
        // Sonucu göster
        this.showGameResult();
        
        // Verileri kaydet
        this.saveUserData();
    }
    
    showGameResult() {
        const accuracy = this.gameState.foundWords.length > 0 ? 
            Math.round((this.gameState.foundWords.length / 10) * 100) : 0;
        
        const resultHTML = `
            <div class="game-result">
                <h3>🎮 Oyun Bitti!</h3>
                <div class="result-stats">
                    <div class="stat">
                        <span class="label">Skor</span>
                        <span class="value">${this.gameState.score}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Bulunan Kelime</span>
                        <span class="value">${this.gameState.foundWords.length}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Başarı Oranı</span>
                        <span class="value">${accuracy}%</span>
                    </div>
                </div>
                <div class="found-words-summary">
                    <h4>Bulunan Kelimeler:</h4>
                    <p>${this.gameState.foundWords.join(', ')}</p>
                </div>
                <div class="result-actions">
                    <button class="btn primary" onclick="game.startGame()">Tekrar Oyna</button>
                    <button class="btn secondary" onclick="game.showScreen('mainMenu')">Ana Menü</button>
                </div>
            </div>
        `;
        
        // Modal göster
        this.showModal(resultHTML);
    }
    
    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addChatMessage(this.userData.username, message);
        input.value = '';
        
        // Simüle edilmiş yanıt
        if (Math.random() > 0.7) {
            setTimeout(() => {
                const responses = [
                    'Harika kelime!',
                    'Devam et!',
                    'Başarılı!',
                    'İyi gidiyorsun!',
                    'Aferin!'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addChatMessage('Bot', randomResponse);
            }, 1000 + Math.random() * 2000);
        }
    }
    
    addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <div class="sender">${sender}:</div>
            <div class="message">${message}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    loadRoomList() {
        const roomsList = document.getElementById('roomsList');
        
        // Simüle edilmiş oda listesi
        const rooms = [
            {
                id: 'ABC123',
                name: 'Hızlı Oyun',
                host: 'Oyuncu1',
                currentPlayers: 2,
                maxPlayers: 4,
                status: 'waiting',
                category: 'Genel Kültür'
            },
            {
                id: 'DEF456',
                name: 'Bilim Severler',
                host: 'BilimInsani',
                currentPlayers: 3,
                maxPlayers: 6,
                status: 'playing',
                category: 'Bilim'
            },
            {
                id: 'GHI789',
                name: 'Spor Takımı',
                host: 'Sporcu',
                currentPlayers: 1,
                maxPlayers: 4,
                status: 'waiting',
                category: 'Spor',
                hasPassword: true
            }
        ];
        
        roomsList.innerHTML = '';
        
        rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            roomElement.innerHTML = `
                <div class="room-header">
                    <div class="room-name">${room.name}</div>
                    <div class="room-status">
                        <span class="status-dot ${room.status}"></span>
                        <span>${room.status === 'waiting' ? 'Bekliyor' : 'Oyunda'}</span>
                    </div>
                </div>
                <div class="room-details">
                    <span>👤 ${room.currentPlayers}/${room.maxPlayers}</span>
                    <span>🏷️ ${room.category}</span>
                    <span>${room.hasPassword ? '🔒' : '🌐'}</span>
                </div>
            `;
            
            roomElement.addEventListener('click', () => {
                if (room.hasPassword) {
                    const password = prompt('Oda şifresini girin:');
                    if (password) {
                        this.joinRoomById(room.id, password);
                    }
                } else {
                    this.joinRoomById(room.id);
                }
            });
            
            roomsList.appendChild(roomElement);
        });
    }
    
    joinRoomById(roomId, password = null) {
        // Simüle edilmiş katılım
        this.showLoadingScreen();
        
        setTimeout(() => {
            const roomData = {
                id: roomId,
                name: 'Katılınan Oda',
                maxPlayers: 4,
                gameMode: 'classic',
                roundTime: 60,
                category: 'genel',
                isPublic: !password,
                host: 'DiğerOyuncu'
            };
            
            this.joinRoom(roomData);
            this.hideLoadingScreen();
            this.showScreen('gameRoom');
            this.showNotification('Odaya katıldınız!', 'success');
        }, 1500);
    }
    
    switchLeaderboardTab(period) {
        // Aktif sekmeyi güncelle
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        this.loadLeaderboard(period);
    }
    
    loadLeaderboard(period) {
        const leaderboardList = document.getElementById('leaderboardList');
        
        // Simüle edilmiş liderlik tablosu
        const leaderboard = [
            { rank: 1, name: 'KelimeUstası', score: 9520, games: 234, accuracy: 92 },
            { rank: 2, name: 'BilgeAdam', score: 8750, games: 189, accuracy: 89 },
            { rank: 3, name: 'HızlıGöz', score: 7500, games: 156, accuracy: 85 },
            { rank: 4, name: 'KelimelerKralı', score: 6230, games: 143, accuracy: 82 },
            { rank: 5, name: 'ZekaKutusu', score: 5890, games: 128, accuracy: 79 },
            { rank: 6, name: 'BulmacaSever', score: 5200, games: 112, accuracy: 76 },
            { rank: 7, name: 'AkılOyunları', score: 4850, games: 98, accuracy: 74 },
            { rank: 8, name: 'Kelimeli', score: 4200, games: 87, accuracy: 71 }
        ];
        
        leaderboardList.innerHTML = '';
        
        leaderboard.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'leaderboard-item';
            playerElement.innerHTML = `
                <div class="rank-number">${player.rank}</div>
                <div class="leaderboard-player-info">
                    <div class="leaderboard-player-name">${player.name}</div>
                    <div class="leaderboard-player-stats">
                        ${player.games} oyun • ${player.accuracy}% başarı
                    </div>
                </div>
                <div class="leaderboard-score">${player.score.toLocaleString()}</div>
            `;
            
            leaderboardList.appendChild(playerElement);
        });
    }
    
    updateProfile() {
        // Profil bilgilerini güncelle
        document.getElementById('profileUsername').textContent = this.userData.username;
        document.getElementById('userLevel').textContent = this.userData.level;
        document.getElementById('userXP').textContent = this.userData.xp.toLocaleString();
        document.getElementById('totalScore').textContent = this.userData.totalScore.toLocaleString();
        
        // İstatistikleri güncelle
        const statsElements = document.querySelectorAll('.stat-number');
        if (statsElements.length >= 4) {
            statsElements[0].textContent = this.userData.stats.gamesPlayed;
            statsElements[1].textContent = this.userData.stats.wordsFound;
            statsElements[2].textContent = this.userData.stats.winRate + '%';
            statsElements[3].textContent = this.userData.stats.victories;
        }
        
        // Başarımları güncelle
        this.updateAchievements();
    }
    
    updateAchievements() {
        const achievements = [
            { id: 'firstWord', name: 'İlk Kelime', icon: '🎯', unlocked: this.userData.stats.wordsFound > 0 },
            { id: 'wordMaster', name: 'Kelime Ustası', icon: '👑', unlocked: this.userData.stats.wordsFound > 100 },
            { id: 'speedDemon', name: 'Hızlı Şeytan', icon: '⚡', unlocked: false },
            { id: 'perfectionist', name: 'Mükemmeliyetçi', icon: '💎', unlocked: this.userData.stats.winRate > 90 }
        ];
        
        const achievementsGrid = document.querySelector('.achievements-grid');
        if (achievementsGrid) {
            achievementsGrid.innerHTML = '';
            
            achievements.forEach(achievement => {
                const achievementElement = document.createElement('div');
                achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
                achievementElement.innerHTML = `
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-name">${achievement.name}</div>
                `;
                
                achievementsGrid.appendChild(achievementElement);
            });
        }
    }
    
    // UI Güncelleme Metotları
    updateRoomDisplay() {
        if (this.roomData) {
            document.getElementById('roomTitle').textContent = this.roomData.name;
            document.getElementById('roomCodeDisplay').textContent = this.roomData.id;
            document.getElementById('currentCategory').textContent = this.getCategoryName(this.roomData.category);
        }
    }
    
    updateGameDisplay() {
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.updateFoundWordsDisplay();
        this.updatePowerupsDisplay();
    }
    
    updateScoreDisplay() {
        const playerElements = document.querySelectorAll('.player-score');
        if (playerElements.length > 0) {
            playerElements[0].textContent = this.gameState.score;
        }
    }
    
    updateTimerDisplay() {
        const timerElement = document.getElementById('timeLeft');
        if (timerElement) {
            timerElement.textContent = this.gameState.timeLeft;
            
            // Zaman azaldıkça renk değiştir
            if (this.gameState.timeLeft <= 10) {
                timerElement.style.color = '#ef4444';
            } else if (this.gameState.timeLeft <= 30) {
                timerElement.style.color = '#f59e0b';
            } else {
                timerElement.style.color = '#ffffff';
            }
        }
    }
    
    updateFoundWordsDisplay() {
        const wordsList = document.querySelector('.words-list');
        if (wordsList) {
            wordsList.innerHTML = '';
            
            this.gameState.foundWords.forEach(word => {
                const wordElement = document.createElement('div');
                wordElement.className = 'word-item';
                wordElement.textContent = word;
                wordsList.appendChild(wordElement);
            });
        }
    }
    
    updatePowerupsDisplay() {
        const powerupCounts = document.querySelectorAll('.powerup-count');
        if (powerupCounts.length >= 3) {
            powerupCounts[0].textContent = this.gameState.powerups.timeFreeze;
            powerupCounts[1].textContent = this.gameState.powerups.extraLetter;
            powerupCounts[2].textContent = this.gameState.powerups.superHint;
        }
    }
    
    updateOnlineCount() {
        const count = 1000 + Math.floor(Math.random() * 500);
        document.getElementById('onlineCount').textContent = count.toLocaleString();
    }
    
    // Yardımcı Metotlar
    generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    getCategoryName(category) {
        const categories = {
            'all': 'Tüm Kategoriler',
            'genel': 'Genel Kültür',
            'bilim': 'Bilim',
            'spor': 'Spor',
            'muzik': 'Müzik',
            'tarih': 'Tarih',
            'technology': 'Teknoloji'
        };
        return categories[category] || 'Genel Kültür';
    }
    
    addXP(amount) {
        this.userData.xp += Math.floor(amount);
        
        // Seviye kontrolü
        const xpForNextLevel = this.userData.level * 100;
        if (this.userData.xp >= xpForNextLevel) {
            this.userData.level++;
            this.userData.xp -= xpForNextLevel;
            this.showNotification(`Seviye ${this.userData.level} oldu! 🎉`, 'success');
        }
    }
    
    animateWordFound(word) {
        // Animasyon efekti
        const notification = document.createElement('div');
        notification.className = 'word-found-animation';
        notification.textContent = `+${word.length * 10} ${word}`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            font-size: 1.5rem;
            font-weight: 700;
            z-index: 2000;
            animation: wordFoundAnim 1s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 1000);
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                ${content}
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
        `;
        
        document.body.appendChild(modal);
        
        // Modal dışına tıklayınca kapat
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    showLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'flex';
    }
    
    hideLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'none';
    }
    
    showSettings() {
        this.showNotification('Ayarlar sayfası yakında eklenecek!', 'info');
    }
    
    addPlayerToRoom(username) {
        const playerSlots = document.querySelectorAll('.player-slot');
        const emptySlot = Array.from(playerSlots).find(slot => 
            slot.querySelector('.player-name').textContent === 'Bekleniyor...'
        );
        
        if (emptySlot) {
            emptySlot.querySelector('.player-name').textContent = username;
            emptySlot.querySelector('.player-avatar').textContent = '👤';
            emptySlot.classList.add('active');
        }
    }
    
    // Veri Yönetimi
    saveUserData() {
        localStorage.setItem('wordBattleUserData', JSON.stringify(this.userData));
    }
    
    loadUserData() {
        const savedData = localStorage.getItem('wordBattleUserData');
        if (savedData) {
            this.userData = { ...this.userData, ...JSON.parse(savedData) };
        }
    }
}

// Oyunu başlat
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new WordBattleGame();
    
    // Global erişim
    window.game = game;
});

// CSS animasyonları ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes wordFoundAnim {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -100%) scale(1);
        }
    }
    
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .modal-content {
        background: var(--card-bg);
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid var(--border-color);
    }
    
    .game-result {
        text-align: center;
    }
    
    .game-result h3 {
        color: var(--primary-color);
        margin-bottom: 20px;
        font-size: 1.8rem;
    }
    
    .result-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .result-stats .stat {
        background: var(--light-bg);
        padding: 15px;
        border-radius: 8px;
    }
    
    .result-stats .label {
        display: block;
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 5px;
    }
    
    .result-stats .value {
        display: block;
        color: var(--primary-color);
        font-size: 1.5rem;
        font-weight: 700;
    }
    
    .found-words-summary {
        background: var(--light-bg);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: left;
    }
    
    .found-words-summary h4 {
        color: var(--primary-color);
        margin-bottom: 10px;
    }
    
    .result-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
    }
    
    .btn {
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
    }
    
    .btn.primary {
        background: var(--gradient-primary);
        color: white;
    }
    
    .btn.secondary {
        background: var(--card-bg);
        color: var(--text-primary);
        border: 2px solid var(--border-color);
    }
    
    .btn:hover {
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);
