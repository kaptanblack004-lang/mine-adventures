// Kelime Savaşı - AI Oyun Modu
class AIGameMode {
    constructor(game) {
        this.game = game;
        this.aiManager = null;
        this.isAIMode = false;
        this.currentAIDifficulty = 'medium';
        this.aiPersonalities = ['aggressive', 'defensive', 'balanced', 'creative'];
        this.aiSettings = {
            enabled: true,
            difficulty: 'medium',
            personality: 'balanced',
            responseSpeed: 'normal',
            learningEnabled: true,
            hintsEnabled: true
        };
        
        this.init();
    }
    
    init() {
        this.aiManager = new AIManager(this.game);
        this.setupAIEventListeners();
        this.loadAISettings();
        console.log('🤖 AI Oyun Modu başlatıldı');
    }
    
    setupAIEventListeners() {
        // AI Modu butonu
        document.getElementById('aiModeBtn').addEventListener('click', () => {
            this.showAIModeScreen();
        });
        
        // AI ayarları
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+A - AI modu hızlı başlat
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.quickStartAI();
            }
        });
    }
    
    showAIModeScreen() {
        const aiScreen = document.createElement('div');
        aiScreen.className = 'ai-mode-screen';
        aiScreen.innerHTML = `
            <div class="ai-mode-container">
                <button class="back-btn" id="backFromAIModeBtn">← Geri</button>
                
                <h2>🤖 AI Oyun Modu</h2>
                <p class="ai-mode-description">Yapay zekâ rakiplerle karşılaşın ve zekanızı test edin!</p>
                
                <div class="ai-options">
                    <div class="option-section">
                        <h3>🎯 Zorluk Seviyesi</h3>
                        <div class="difficulty-options">
                            <div class="difficulty-option" data-level="easy">
                                <div class="difficulty-icon">😊</div>
                                <div class="difficulty-info">
                                    <h4>Kolay</h4>
                                    <p>Yeni başlayanlar için ideal</p>
                                </div>
                            </div>
                            <div class="difficulty-option active" data-level="medium">
                                <div class="difficulty-icon">🎯</div>
                                <div class="difficulty-info">
                                    <h4>Orta</h4>
                                    <p>Dengeli ve rekabetçi</p>
                                </div>
                            </div>
                            <div class="difficulty-option" data-level="hard">
                                <div class="difficulty-icon">🔥</div>
                                <div class="difficulty-info">
                                    <h4>Zor</h4>
                                    <p>Deneyimli oyuncular için</p>
                                </div>
                            </div>
                            <div class="difficulty-option" data-level="expert">
                                <div class="difficulty-icon">👑</div>
                                <div class="difficulty-info">
                                    <h4>Usta</h4>
                                    <p>En zor AI rakipler</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="option-section">
                        <h3>🎭 AI Kişilikleri</h3>
                        <div class="personality-options">
                            <div class="personality-option active" data-personality="balanced">
                                <span class="personality-emoji">⚖️</span>
                                <span class="personality-name">Dengeli</span>
                                <span class="personality-desc">Her duruma uyum sağlar</span>
                            </div>
                            <div class="personality-option" data-personality="aggressive">
                                <span class="personality-emoji">🔥</span>
                                <span class="personality-name">Saldırgan</span>
                                <span class="personality-desc">Hızlı ve riskli</span>
                            </div>
                            <div class="personality-option" data-personality="defensive">
                                <span class="personality-emoji">🛡️</span>
                                <span class="personality-name">Savunmacı</span>
                                <span class="personality-desc">Güvenli ve stratejik</span>
                            </div>
                            <div class="personality-option" data-personality="creative">
                                <span class="personality-emoji">🎨</span>
                                <span class="personality-name">Yaratıcı</span>
                                <span class="personality-desc">Beklenmedik hamleler</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="option-section">
                        <h3>⚙️ AI Ayarları</h3>
                        <div class="ai-settings-grid">
                            <div class="setting-item">
                                <label class="setting-label">
                                    <input type="checkbox" id="aiLearning" checked>
                                    <span class="setting-text">AI Öğrenme</span>
                                </label>
                                <p class="setting-desc">AI oyuncu stilinizi öğrenir</p>
                            </div>
                            <div class="setting-item">
                                <label class="setting-label">
                                    <input type="checkbox" id="aiHints" checked>
                                    <span class="setting-text">AI İpuçları</span>
                                </label>
                                <p class="setting-desc">Zorlandığınızda AI ipuçları verir</p>
                            </div>
                            <div class="setting-item">
                                <label class="setting-label">
                                    <input type="checkbox" id="aiChat" checked>
                                    <span class="setting-text">AI Sohbet</span>
                                </label>
                                <p class="setting-desc">AI rakiplerle sohbet edin</p>
                            </div>
                            <div class="setting-item">
                                <label class="setting-label">Hız</label>
                                <select id="aiSpeed">
                                    <option value="slow">Yavaş</option>
                                    <option value="normal" selected>Normal</option>
                                    <option value="fast">Hızlı</option>
                                    <option value="lightning">Yıldırım</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="ai-stats-preview">
                    <h3>📊 AI Performansı</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value" id="aiWinRate">0%</span>
                            <span class="stat-label">Galibiyet Oranı</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="aiGamesPlayed">0</span>
                            <span class="stat-label">Oyun Sayısı</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="aiAvgScore">0</span>
                            <span class="stat-label">Ortalama Skor</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="aiLevel">1</span>
                            <span class="stat-label">AI Seviyesi</span>
                        </div>
                    </div>
                </div>
                
                <div class="ai-action-buttons">
                    <button class="menu-btn primary" id="startAIGameBtn">
                        <span class="btn-icon">🚀</span>
                        <span class="btn-text">AI Oyunu Başlat</span>
                    </button>
                    
                    <button class="menu-btn secondary" id="aiTournamentBtn">
                        <span class="btn-icon">🏆</span>
                        <span class="btn-text">AI Turnuvası</span>
                    </button>
                    
                    <button class="menu-btn secondary" id="aiTrainingBtn">
                        <span class="btn-icon">🎯</span>
                        <span class="btn-text">AI Antrenmanı</span>
                    </button>
                </div>
            </div>
        `;
        
        // Stil ekle
        const style = document.createElement('style');
        style.textContent = `
            .ai-mode-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: var(--darker-bg);
                overflow-y: auto;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ai-mode-container {
                max-width: 1200px;
                width: 95%;
                background: var(--card-bg);
                border-radius: 20px;
                padding: 40px;
                position: relative;
                border: 2px solid var(--primary-color);
                box-shadow: 0 20px 80px rgba(99, 102, 241, 0.3);
            }
            
            .ai-mode-description {
                text-align: center;
                color: var(--text-secondary);
                margin-bottom: 30px;
                font-size: 1.1rem;
            }
            
            .difficulty-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .difficulty-option {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: var(--light-bg);
                border: 2px solid var(--border-color);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .difficulty-option:hover {
                border-color: var(--primary-color);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2);
            }
            
            .difficulty-option.active {
                border-color: var(--primary-color);
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
            }
            
            .difficulty-icon {
                font-size: 2rem;
            }
            
            .difficulty-info h4 {
                color: var(--primary-color);
                margin-bottom: 5px;
            }
            
            .difficulty-info p {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin: 0;
            }
            
            .personality-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .personality-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                background: var(--light-bg);
                border: 2px solid var(--border-color);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            
            .personality-option:hover {
                border-color: var(--accent-color);
                transform: translateY(-2px);
            }
            
            .personality-option.active {
                border-color: var(--accent-color);
                background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(99, 102, 241, 0.1));
            }
            
            .personality-emoji {
                font-size: 2rem;
                margin-bottom: 10px;
            }
            
            .personality-name {
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 5px;
            }
            
            .personality-desc {
                font-size: 0.8rem;
                color: var(--text-secondary);
            }
            
            .ai-settings-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .setting-item {
                padding: 20px;
                background: var(--light-bg);
                border-radius: 10px;
                border: 1px solid var(--border-color);
            }
            
            .setting-label {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 8px;
            }
            
            .setting-text {
                flex: 1;
            }
            
            .setting-desc {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin: 0;
            }
            
            .ai-stats-preview {
                background: var(--light-bg);
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
            }
            
            .stat-item {
                text-align: center;
                padding: 15px;
                background: var(--card-bg);
                border-radius: 8px;
                border: 1px solid var(--border-color);
            }
            
            .stat-value {
                display: block;
                font-size: 1.8rem;
                font-weight: 700;
                color: var(--primary-color);
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }
            
            .ai-action-buttons {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .ai-action-buttons .menu-btn {
                min-width: 200px;
            }
            
            #aiSpeed {
                width: 100%;
                padding: 8px 12px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(aiScreen);
        
        // Event listener'ları ekle
        this.setupAIOptionsListeners(aiScreen);
        
        // İstatistikleri güncelle
        this.updateAIStats();
    }
    
    setupAIOptionsListeners(screen) {
        // Geri butonu
        screen.querySelector('#backFromAIModeBtn').addEventListener('click', () => {
            this.closeAIModeScreen();
        });
        
        // Zorluk seçimi
        screen.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', () => {
                screen.querySelectorAll('.difficulty-option').forEach(opt => 
                    opt.classList.remove('active')
                );
                option.classList.add('active');
                this.currentAIDifficulty = option.dataset.level;
            });
        });
        
        // Kişilik seçimi
        screen.querySelectorAll('.personality-option').forEach(option => {
            option.addEventListener('click', () => {
                screen.querySelectorAll('.personality-option').forEach(opt => 
                    opt.classList.remove('active')
                );
                option.classList.add('active');
                this.aiSettings.personality = option.dataset.personality;
            });
        });
        
        // AI ayarları
        screen.querySelector('#aiLearning').addEventListener('change', (e) => {
            this.aiSettings.learningEnabled = e.target.checked;
        });
        
        screen.querySelector('#aiHints').addEventListener('change', (e) => {
            this.aiSettings.hintsEnabled = e.target.checked;
        });
        
        screen.querySelector('#aiChat').addEventListener('change', (e) => {
            this.aiSettings.chatEnabled = e.target.checked;
        });
        
        screen.querySelector('#aiSpeed').addEventListener('change', (e) => {
            this.aiSettings.responseSpeed = e.target.value;
        });
        
        // AI oyunu başlat
        screen.querySelector('#startAIGameBtn').addEventListener('click', () => {
            this.startAIGame();
        });
        
        // AI turnuvası
        screen.querySelector('#aiTournamentBtn').addEventListener('click', () => {
            this.startAITournament();
        });
        
        // AI antrenmanı
        screen.querySelector('#aiTrainingBtn').addEventListener('click', () => {
            this.startAITraining();
        });
    }
    
    closeAIModeScreen() {
        const screen = document.querySelector('.ai-mode-screen');
        if (screen) {
            screen.remove();
        }
        this.saveAISettings();
    }
    
    startAIGame() {
        this.closeAIModeScreen();
        
        // AI oyununu başlat
        this.isAIMode = true;
        
        // Yükleme ekranı göster
        this.game.showLoadingScreen();
        
        setTimeout(() => {
            // AI rakipleri oluştur
            this.aiManager.startAIGame(this.currentAIDifficulty);
            
            // Oyun ekranına geç
            this.game.showScreen('gameRoom');
            
            // Oyunu başlat
            this.game.startGame();
            
            // AI modunu etkinleştir
            this.enableAIModeFeatures();
            
            this.game.hideLoadingScreen();
            this.game.showNotification(`🤖 AI Oyunu başladı! Zorluk: ${this.currentAIDifficulty}`, 'success');
        }, 1500);
    }
    
    enableAIModeFeatures() {
        // AI ipucu butonu ekle
        this.addAIHintButton();
        
        // AI durum göstergesi ekle
        this.addAIStatusIndicator();
        
        // AI sohbet özelliklerini aktifleştir
        this.enableAIChatFeatures();
    }
    
    addAIHintButton() {
        const inputActions = document.querySelector('.input-actions');
        if (inputActions && !inputActions.querySelector('.ai-hint-btn')) {
            const aiHintBtn = document.createElement('button');
            aiHintBtn.className = 'action-btn ai-hint-btn';
            aiHintBtn.innerHTML = '🤖 AI İpucu';
            aiHintBtn.addEventListener('click', () => {
                this.requestAIHint();
            });
            
            inputActions.appendChild(aiHintBtn);
        }
    }
    
    addAIStatusIndicator() {
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader && !gameHeader.querySelector('.ai-status')) {
            const aiStatus = document.createElement('div');
            aiStatus.className = 'ai-status';
            aiStatus.innerHTML = `
                <span class="ai-indicator">🤖</span>
                <span class="ai-text">AI Modu Aktif</span>
                <span class="ai-difficulty">${this.currentAIDifficulty}</span>
            `;
            
            aiStatus.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
                padding: 8px 15px;
                border-radius: 20px;
                border: 1px solid var(--primary-color);
                font-size: 0.9rem;
                font-weight: 600;
            `;
            
            gameHeader.appendChild(aiStatus);
        }
    }
    
    enableAIChatFeatures() {
        // AI sohbet mesajları için özel stil
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // AI mesajlarını farklı göster
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && node.classList.contains('chat-message')) {
                            const sender = node.querySelector('.sender');
                            if (sender && sender.textContent.includes('AI')) {
                                node.classList.add('ai-chat-message');
                            }
                        }
                    });
                });
            });
            
            observer.observe(chatMessages, { childList: true });
        }
    }
    
    requestAIHint() {
        if (!this.aiSettings.hintsEnabled) {
            this.game.showNotification('AI ipuçları devre dışı!', 'warning');
            return;
        }
        
        const hint = this.aiManager.requestAIHint();
        if (hint) {
            this.game.showNotification(`🤖 AI İpucu: ${hint.hint}`, 'info');
        } else {
            this.game.showNotification('AI şu an ipucu veremiyor!', 'warning');
        }
    }
    
    startAITournament() {
        this.closeAIModeScreen();
        
        // AI turnuvası başlat
        const tournamentData = {
            id: 'ai_tournament_' + Date.now(),
            name: 'AI Turnuvası',
            rounds: 5,
            participants: ['Oyuncu', 'AI_Zeka', 'AI_Hız', 'AI_Strateji'],
            currentRound: 1,
            scores: {}
        };
        
        // Turnuva ekranını göster
        this.showTournamentScreen(tournamentData);
    }
    
    showTournamentScreen(tournamentData) {
        const tournamentScreen = document.createElement('div');
        tournamentScreen.className = 'tournament-screen';
        tournamentScreen.innerHTML = `
            <div class="tournament-container">
                <h2>🏆 AI Turnuvası</h2>
                <div class="tournament-bracket">
                    ${this.generateTournamentBracket(tournamentData)}
                </div>
                <div class="tournament-actions">
                    <button class="menu-btn primary" onclick="game.aiMode.startTournamentRound()">
                        <span class="btn-icon">🚀</span>
                        <span class="btn-text">Turnuvayı Başlat</span>
                    </button>
                    <button class="menu-btn secondary" onclick="game.aiMode.closeTournamentScreen()">
                        <span class="btn-icon">←</span>
                        <span class="btn-text">Geri Dön</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(tournamentScreen);
    }
    
    generateTournamentBracket(tournamentData) {
        // Basit turnuva şeması
        return `
            <div class="bracket-round">
                <h3>Çeyrek Final</h3>
                <div class="match">
                    <div class="player">Oyuncu</div>
                    <div class="vs">VS</div>
                    <div class="player">AI_Zeka</div>
                </div>
                <div class="match">
                    <div class="player">AI_Hız</div>
                    <div class="vs">VS</div>
                    <div class="player">AI_Strateji</div>
                </div>
            </div>
        `;
    }
    
    startAITraining() {
        this.closeAIModeScreen();
        
        // AI antrenman modu
        const trainingData = {
            mode: 'training',
            focus: 'word_building',
            difficulty: 'adaptive',
            exercises: [
                { type: 'speed', description: 'Hızlı kelime bulma' },
                { type: 'accuracy', description: 'Doğruluk egzersizi' },
                { type: 'vocabulary', description: 'Kelime dağını genişletme' }
            ]
        };
        
        this.showTrainingScreen(trainingData);
    }
    
    showTrainingScreen(trainingData) {
        const trainingScreen = document.createElement('div');
        trainingScreen.className = 'training-screen';
        trainingScreen.innerHTML = `
            <div class="training-container">
                <h2>🎯 AI Antrenmanı</h2>
                <div class="training-exercises">
                    ${trainingData.exercises.map(exercise => `
                        <div class="exercise-card">
                            <h3>${exercise.type}</h3>
                            <p>${exercise.description}</p>
                            <button class="start-exercise-btn" data-type="${exercise.type}">
                                Başla
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="close-training-btn" onclick="game.aiMode.closeTrainingScreen()">
                    Kapat
                </button>
            </div>
        `;
        
        document.body.appendChild(trainingScreen);
        
        // Egzersiz başlatma butonları
        trainingScreen.querySelectorAll('.start-exercise-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.startExercise(btn.dataset.type);
            });
        });
    }
    
    startExercise(type) {
        // Egzersiz başlat
        this.game.showNotification(`🎯 ${type} egzersizi başlatılıyor...`, 'info');
        
        // Egzersize özel oyun modu
        this.game.gameState.exerciseMode = type;
        this.game.gameState.isTraining = true;
        
        // Oyunu başlat
        this.game.showScreen('gameRoom');
        this.game.startGame();
    }
    
    quickStartAI() {
        // Hızlı AI oyunu başlat
        this.currentAIDifficulty = 'medium';
        this.startAIGame();
    }
    
    updateAIStats() {
        // AI istatistiklerini güncelle
        const stats = this.aiManager.getAIStats();
        
        // Ekranı güncelle
        const winRateElement = document.getElementById('aiWinRate');
        const gamesElement = document.getElementById('aiGamesPlayed');
        const scoreElement = document.getElementById('aiAvgScore');
        const levelElement = document.getElementById('aiLevel');
        
        if (winRateElement) winRateElement.textContent = '0%';
        if (gamesElement) gamesElement.textContent = '0';
        if (scoreElement) scoreElement.textContent = '0';
        if (levelElement) levelElement.textContent = '1';
    }
    
    closeTournamentScreen() {
        const screen = document.querySelector('.tournament-screen');
        if (screen) {
            screen.remove();
        }
    }
    
    closeTrainingScreen() {
        const screen = document.querySelector('.training-screen');
        if (screen) {
            screen.remove();
        }
    }
    
    saveAISettings() {
        localStorage.setItem('wordBattleAISettings', JSON.stringify(this.aiSettings));
        console.log('💾 AI ayarları kaydedildi:', this.aiSettings);
    }
    
    loadAISettings() {
        try {
            const saved = localStorage.getItem('wordBattleAISettings');
            if (saved) {
                this.aiSettings = { ...this.aiSettings, ...JSON.parse(saved) };
                console.log('📂 AI ayarları yüklendi:', this.aiSettings);
            }
        } catch (error) {
            console.error('AI ayarları yüklenemedi:', error);
        }
    }
    
    // AI modunu sonlandır
    endAIMode() {
        this.isAIMode = false;
        
        // AI özelliklerini temizle
        this.disableAIModeFeatures();
        
        // AI oyununu bitir
        if (this.aiManager) {
            this.aiManager.endAIGame();
        }
        
        console.log('🤖 AI modu sonlandırıldı');
    }
    
    disableAIModeFeatures() {
        // AI ipucu butonunu kaldır
        const aiHintBtn = document.querySelector('.ai-hint-btn');
        if (aiHintBtn) {
            aiHintBtn.remove();
        }
        
        // AI durum göstergesini kaldır
        const aiStatus = document.querySelector('.ai-status');
        if (aiStatus) {
            aiStatus.remove();
        }
    }
    
    // AI performansını izle
    monitorAIPerformance() {
        if (!this.isAIMode) return;
        
        const performance = this.aiManager.getAIStats();
        
        // AI zorluğunu ayarla
        if (performance.performance.accuracy > 80) {
            // AI çok başarılı, zorluğu artır
            this.currentAIDifficulty = this.ai.ai.getNextDifficulty(this.currentAIDifficulty);
        } else if (performance.performance.accuracy < 40) {
            // AI zorlanıyor, zorluğu azalt
            this.currentAIDifficulty = this.ai.ai.getPreviousDifficulty(this.currentAIDifficulty);
        }
        
        console.log('📊 AI performans izleniyor:', performance);
    }
}

// Global erişim
window.AIGameMode = AIGameMode;
