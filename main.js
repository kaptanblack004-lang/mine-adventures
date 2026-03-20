// ===== PROFESSIONEL MINE MACERALARI - MAIN.JS =====

/**
 * Ana oyun kontrolörü
 * Tüm oyun mantığını burada yönetiyoruz
 */

class MineAdventureGame {
    constructor() {
        // Oyun durumu
        this.gameState = {
            currentScreen: 'loading-screen',
            currentChapter: 1,
            currentScene: 0,
            health: 100,
            score: 0,
            crystals: 0,
            inventory: [],
            unlockedChapters: [1],
            chapterProgress: {},
            playerChoices: [],
            gameStarted: false,
            gameCompleted: false,
            startTime: Date.now(),
            playTime: 0,
            settings: {
                musicVolume: 70,
                sfxVolume: 80,
                textSpeed: 'normal',
                autoSave: true,
                particleEffects: true,
                theme: 'dark'
            }
        };

        // Yöneticiler
        this.audioManager = null;
        this.saveManager = null;
        this.uiManager = null;
        
        // Başlat
        this.init();
    }

    /**
     * Oyunu başlatır
     */
    async init() {
        try {
            console.log('🎮 Mine\'in Maceraları başlatılıyor...');
            
            // Yöneticileri başlat
            this.audioManager = new AudioManager();
            this.saveManager = new SaveManager();
            this.uiManager = new UIManager();
            
            // Oyun verilerini yükle
            await this.loadGameData();
            
            // UI'ı başlat
            this.uiManager.init(this);
            
            // Sesleri başlat
            await this.audioManager.init(this.gameState.settings);
            
            // Yükleme ekranını göster
            this.showLoadingScreen();
            
            // Ana menüye geç
            setTimeout(() => {
                this.showMainMenu();
            }, 3000);
            
            console.log('✅ Oyun başarıyla başlatıldı!');
            
        } catch (error) {
            console.error('❌ Oyun başlatılırken hata:', error);
            this.showError('Oyun başlatılamadı. Sayfayı yenileyin.');
        }
    }

    /**
     * Oyun verilerini yükler
     */
    async loadGameData() {
        try {
            // Kayıtlı oyun var mı kontrol et
            const savedGame = this.saveManager.loadGame();
            if (savedGame) {
                this.gameState = { ...this.gameState, ...savedGame };
                console.log('💾 Kayıtlı oyun yüklendi');
            } else {
                console.log('🆕 Yeni oyun başlatılıyor');
            }
            
            // Yükleme animasyonu
            this.animateLoading();
            
        } catch (error) {
            console.error('❌ Oyun verileri yüklenemedi:', error);
        }
    }

    /**
     * Yükleme ekranını gösterir
     */
    showLoadingScreen() {
        this.uiManager.showScreen('loading-screen');
        this.audioManager.playMusic('menu');
    }

    /**
     * Yükleme animasyonu
     */
    animateLoading() {
        const progressFill = document.getElementById('progress-fill');
        const loadingText = document.getElementById('loading-text');
        
        if (!progressFill || !loadingText) return;
        
        let progress = 0;
        const messages = [
            'Oyun yükleniyor...',
            'Hikaye hazırlanıyor...',
            'Karakterler oluşturuluyor...',
            'Dünyalar inşa ediliyor...',
            'Macera başlıyor...'
        ];
        
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            progressFill.style.width = `${progress}%`;
            
            const messageIndex = Math.floor((progress / 100) * messages.length);
            loadingText.textContent = messages[Math.min(messageIndex, messages.length - 1)];
            
        }, 200);
    }

    /**
     * Ana menüyü gösterir
     */
    showMainMenu() {
        this.uiManager.showScreen('main-menu');
        this.audioManager.playMusic('menu');
        this.updateMenuStats();
        
        // Parçacık efektleri
        if (this.gameState.settings.particleEffects) {
            this.uiManager.createParticles('particles');
        }
    }

    /**
     * Menü istatistiklerini günceller
     */
    updateMenuStats() {
        const highScore = this.saveManager.getHighScore();
        const playTime = this.formatPlayTime(this.gameState.playTime);
        
        const highScoreElement = document.getElementById('high-score');
        const playTimeElement = document.getElementById('play-time');
        
        if (highScoreElement) highScoreElement.textContent = highScore;
        if (playTimeElement) playTimeElement.textContent = playTime;
    }

    /**
     * Oyun süresini formatlar
     */
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    /**
     * Yeni oyun başlatır
     */
    newGame() {
        console.log('🎮 Yeni oyun başlatılıyor...');
        
        // Oyun durumunu sıfırla
        this.gameState = {
            ...this.gameState,
            currentChapter: 1,
            currentScene: 0,
            health: 100,
            score: 0,
            crystals: 0,
            inventory: [],
            unlockedChapters: [1],
            chapterProgress: {},
            playerChoices: [],
            gameStarted: true,
            gameCompleted: false,
            startTime: Date.now()
        };
        
        // Oyunu kaydet
        this.saveManager.saveGame(this.gameState);
        
        // Bölüm seçim ekranına git
        this.showChapterSelect();
        
        // Ses
        this.audioManager.playSound('button-click');
        this.uiManager.showNotification('Yeni oyun başlatıldı!', 'success');
    }

    /**
     * Oyuna devam eder
     */
    continueGame() {
        if (this.gameState.gameStarted) {
            this.showChapterSelect();
            this.audioManager.playSound('button-click');
        } else {
            this.uiManager.showNotification('Kayıtlı oyun bulunamadı!', 'warning');
        }
    }

    /**
     * Bölüm seçim ekranını gösterir
     */
    showChapterSelect() {
        this.uiManager.showScreen('chapter-select');
        this.audioManager.playMusic('menu');
        this.updateChaptersGrid();
        
        // Parçacık efektleri
        if (this.gameState.settings.particleEffects) {
            this.uiManager.createParticles('chapter-particles');
        }
    }

    /**
     * Bölüm grid'ini günceller
     */
    updateChaptersGrid() {
        const chaptersGrid = document.getElementById('chapters-grid');
        if (!chaptersGrid) return;
        
        const chapters = this.getAllChapters();
        const completedCount = this.gameState.unlockedChapters.filter(ch => 
            this.gameState.chapterProgress[ch] === 100
        ).length;
        
        // İlerleme bilgisini güncelle
        const progressElement = document.getElementById('chapters-completed');
        if (progressElement) {
            progressElement.textContent = `${completedCount}/6`;
        }
        
        // Bölüm kartlarını oluştur
        chaptersGrid.innerHTML = chapters.map(chapter => this.createChapterCard(chapter)).join('');
        
        // Olay dinleyicileri ekle
        this.attachChapterCardListeners();
    }

    /**
     * Tüm bölümleri döndürür
     */
    getAllChapters() {
        return [
            { id: 1, title: 'Kristal Kale\'nin Sırrı', icon: '🏰', scenes: 3 },
            { id: 2, title: 'Gizemli Orman', icon: '🌲', scenes: 3 },
            { id: 3, title: 'Kaybolmuş Anahtarlar', icon: '🗝️', scenes: 3 },
            { id: 4, title: 'Ejderhanın Yolu', icon: '🐉', scenes: 3 },
            { id: 5, title: 'Sihirli Kristaller', icon: '💎', scenes: 3 },
            { id: 6, title: 'Final: Taç Giyme', icon: '👑', scenes: 3 }
        ];
    }

    /**
     * Bölüm kartı oluşturur
     */
    createChapterCard(chapter) {
        const isUnlocked = this.gameState.unlockedChapters.includes(chapter.id);
        const progress = this.gameState.chapterProgress[chapter.id] || 0;
        const isCompleted = progress === 100;
        
        return `
            <div class="chapter-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                 data-chapter="${chapter.id}"
                 ${isUnlocked ? '' : 'data-locked="true"'}>
                ${!isUnlocked ? '<div class="lock-overlay">🔒</div>' : ''}
                <div class="chapter-icon">${chapter.icon}</div>
                <h3>Bölüm ${chapter.id}</h3>
                <p>${chapter.title}</p>
                <div class="chapter-progress">
                    <div class="progress-bar small">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}%</span>
                </div>
                ${isCompleted ? '<div class="completion-badge">✅ Tamamlandı</div>' : ''}
            </div>
        `;
    }

    /**
     * Bölüm kartı olay dinleyicilerini ekler
     */
    attachChapterCardListeners() {
        const chapterCards = document.querySelectorAll('.chapter-card');
        
        chapterCards.forEach(card => {
            card.addEventListener('click', () => {
                const chapterId = parseInt(card.dataset.chapter);
                const isLocked = card.dataset.locked === 'true';
                
                if (isLocked) {
                    this.uiManager.showNotification('Bu bölüm henüz kilitli!', 'warning');
                    return;
                }
                
                this.selectChapter(chapterId);
            });
        });
    }

    /**
     * Bölüm seçer
     */
    selectChapter(chapterId) {
        console.log(`📖 Bölüm ${chapterId} seçildi`);
        
        this.currentChapter = chapterId;
        this.currentScene = 0;
        
        // Oyun ekranına geç
        this.showGameScreen();
        
        // Bölümü başlat
        this.startChapter();
        
        // Ses
        this.audioManager.playSound('button-click');
        this.audioManager.playMusic(`chapter-${chapterId}`);
    }

    /**
     * Oyun ekranını gösterir
     */
    showGameScreen() {
        this.uiManager.showScreen('game-screen');
        this.updateGameUI();
        
        // Parçacık efektleri
        if (this.gameState.settings.particleEffects) {
            this.uiManager.createParticles('game-particles');
        }
    }

    /**
     * Oyun UI'ını günceller
     */
    updateGameUI() {
        // Bölüm bilgisi
        const chapterName = document.getElementById('current-chapter-name');
        if (chapterName) {
            const chapter = this.getAllChapters().find(ch => ch.id === this.currentChapter);
            chapterName.textContent = `Bölüm ${this.currentChapter}: ${chapter ? chapter.title : ''}`;
        }
        
        // İstatistikler
        this.updatePlayerStats();
        
        // Sahne ilerlemesi
        this.updateSceneProgress();
    }

    /**
     * Oyuncu istatistiklerini günceller
     */
    updatePlayerStats() {
        // Can
        const healthValue = document.getElementById('health-value');
        const healthFill = document.getElementById('health-fill');
        if (healthValue) healthValue.textContent = this.gameState.health;
        if (healthFill) healthFill.style.width = `${this.gameState.health}%`;
        
        // Skor
        const scoreValue = document.getElementById('score-value');
        if (scoreValue) scoreValue.textContent = this.gameState.score;
        
        // Kristaller
        const crystalsValue = document.getElementById('crystals-value');
        if (crystalsValue) crystalsValue.textContent = this.gameState.crystals;
    }

    /**
     * Sahne ilerlemesini günceller
     */
    updateSceneProgress() {
        const chapter = this.getAllChapters().find(ch => ch.id === this.currentChapter);
        const progressFill = document.getElementById('scene-progress-fill');
        const progressText = document.getElementById('scene-progress-text');
        
        if (chapter && progressFill && progressText) {
            const progress = ((this.currentScene + 1) / chapter.scenes) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${this.currentScene + 1}/${chapter.scenes}`;
        }
    }

    /**
     * Bölümü başlatır
     */
    startChapter() {
        console.log(`🎭 Bölüm ${this.currentChapter} başlatılıyor`);
        
        // İlk sahneyi yükle
        this.loadScene(0);
    }

    /**
     * Sahneyi yükler
     */
    loadScene(sceneIndex) {
        const scene = this.getScene(this.currentChapter, sceneIndex);
        if (!scene) {
            this.completeChapter();
            return;
        }
        
        this.currentScene = sceneIndex;
        this.displayScene(scene);
    }

    /**
     * Sahneyi döndürür
     */
    getScene(chapterId, sceneIndex) {
        // Bu kısım story-data.js'den gelecek
        return window.STORY_DATA?.[chapterId]?.scenes?.[sceneIndex] || null;
    }

    /**
     * Sahneyi gösterir
     */
    displayScene(scene) {
        // Sahne başlığı
        const sceneTitle = document.getElementById('scene-title');
        if (sceneTitle) sceneTitle.textContent = scene.title;
        
        // Sahne açıklaması
        const sceneDescription = document.getElementById('scene-description');
        if (sceneDescription) sceneDescription.textContent = scene.text;
        
        // Sahne görseli
        const sceneImage = document.getElementById('scene-image');
        if (sceneImage && scene.image) {
            sceneImage.innerHTML = `<div class="image-placeholder">${scene.image}</div>`;
        }
        
        // Seçenekler
        this.displayChoices(scene.choices);
    }

    /**
     * Seçenekleri gösterir
     */
    displayChoices(choices) {
        const choicesContainer = document.getElementById('choices-container');
        if (!choicesContainer) return;
        
        choicesContainer.innerHTML = choices.map((choice, index) => `
            <button class="choice-btn" data-choice="${index}">
                ${choice.text}
            </button>
        `).join('');
        
        // Olay dinleyicileri ekle
        this.attachChoiceListeners(choices);
    }

    /**
     * Seçenek olay dinleyicilerini ekler
     */
    attachChoiceListeners(choices) {
        const choiceButtons = document.querySelectorAll('.choice-btn');
        
        choiceButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.makeChoice(index, choices[index]);
            });
        });
    }

    /**
     * Seçim yapar
     */
    makeChoice(choiceIndex, choice) {
        console.log(`🎯 Seçim: ${choice.text}`);
        
        // Seçimi kaydet
        this.gameState.playerChoices.push({
            chapter: this.currentChapter,
            scene: this.currentScene,
            choice: choiceIndex,
            text: choice.text
        });
        
        // Seçim sonucunu işle
        this.processChoice(choice);
        
        // Ses
        this.audioManager.playSound('choice-made');
        
        // Sonraki sahneye geç
        setTimeout(() => {
            this.loadScene(this.currentScene + 1);
        }, 2000);
    }

    /**
     * Seçim sonucunu işler
     */
    processChoice(choice) {
        // Puan ekle
        if (choice.points) {
            this.gameState.score += choice.points;
            this.uiManager.showFloatingText(`+${choice.points} puan`, 'success');
        }
        
        // Can değiştir
        if (choice.health) {
            const oldHealth = this.gameState.health;
            this.gameState.health = Math.max(0, Math.min(100, this.gameState.health + choice.health));
            
            if (choice.health < 0) {
                this.uiManager.showFloatingText(`${choice.health} can`, 'error');
            } else {
                this.uiManager.showFloatingText(`+${choice.health} can`, 'success');
            }
            
            // Can kontrolü
            if (this.gameState.health <= 0) {
                this.gameOver();
                return;
            }
        }
        
        // Kristal ekle
        if (choice.crystals) {
            this.gameState.crystals += choice.crystals;
            this.uiManager.showFloatingText(`+${choice.crystals} kristal`, 'success');
        }
        
        // Envantere ekle
        if (choice.reward) {
            this.gameState.inventory.push(choice.reward);
            this.uiManager.showNotification(`Ödül kazanıldı: ${choice.reward.name}`, 'success');
        }
        
        // İstatistikleri güncelle
        this.updatePlayerStats();
        
        // Oyunu kaydet
        if (this.gameState.settings.autoSave) {
            this.saveManager.saveGame(this.gameState);
        }
    }

    /**
     * Bölümü tamamlar
     */
    completeChapter() {
        console.log(`🎉 Bölüm ${this.currentChapter} tamamlandı!`);
        
        // Bölüm ilerlemesini güncelle
        this.gameState.chapterProgress[this.currentChapter] = 100;
        
        // Sonraki bölümü kilitle
        const nextChapter = this.currentChapter + 1;
        if (nextChapter <= 6 && !this.gameState.unlockedChapters.includes(nextChapter)) {
            this.gameState.unlockedChapters.push(nextChapter);
            this.uiManager.showNotification(`Bölüm ${nextChapter} kilitlendi!`, 'success');
        }
        
        // Oyunu kaydet
        this.saveManager.saveGame(this.gameState);
        
        // Bölüm bitiş ekranı
        this.showChapterComplete();
    }

    /**
     * Bölüm tamamlama ekranını gösterir
     */
    showChapterComplete() {
        const isLastChapter = this.currentChapter === 6;
        const message = isLastChapter ? 
            '🎉 Tebrikler! Oyunu tamamladın!' : 
            `✅ Bölüm ${this.currentChapter} tamamlandı!`;
        
        this.uiManager.showNotification(message, 'success');
        this.audioManager.playSound('chapter-complete');
        
        // Ana menüye dön
        setTimeout(() => {
            if (isLastChapter) {
                this.showGameComplete();
            } else {
                this.showChapterSelect();
            }
        }, 3000);
    }

    /**
     * Oyunu tamamlama ekranını gösterir
     */
    showGameComplete() {
        this.gameState.gameCompleted = true;
        this.saveManager.saveGame(this.gameState);
        
        this.uiManager.showNotification(
            `🏆 Oyun tamamlandı! Toplam skor: ${this.gameState.score}`, 
            'success'
        );
        
        this.showMainMenu();
    }

    /**
     * Oyun biter
     */
    gameOver() {
        console.log('💀 Oyun bitti!');
        
        this.uiManager.showNotification('💀 Oyun bitti! Canın tükendi.', 'error');
        this.audioManager.playSound('game-over');
        
        // Ana menüye dön
        setTimeout(() => {
            this.showMainMenu();
        }, 3000);
    }

    /**
     * Ayarları gösterir
     */
    showSettings() {
        this.uiManager.showModal('settings-modal');
        this.audioManager.playSound('button-click');
    }

    /**
     * Kredileri gösterir
     */
    showCredits() {
        this.uiManager.showModal('credits-modal');
        this.audioManager.playSound('button-click');
    }

    /**
     * Envanteri gösterir
     */
    toggleInventory() {
        this.uiManager.toggleModal('inventory-modal');
        this.audioManager.playSound('button-click');
    }

    /**
     * Haritayı gösterir
     */
    toggleMap() {
        this.uiManager.toggleModal('map-modal');
        this.audioManager.playSound('button-click');
    }

    /**
     * Oyunu duraklatır
     */
    togglePause() {
        this.uiManager.toggleModal('pause-modal');
        this.audioManager.playSound('button-click');
    }

    /**
     * Ana menüye döner
     */
    backToMenu() {
        this.showMainMenu();
        this.audioManager.playSound('button-click');
    }

    /**
     * Hata gösterir
     */
    showError(message) {
        console.error('❌', message);
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = 'var(--error)';
        }
    }

    /**
     * Klavye kontrollerini yönetir
     */
    handleKeyPress(event) {
        switch(event.key) {
            case 'Escape':
                this.uiManager.closeAllModals();
                break;
            case 'i':
            case 'I':
                this.toggleInventory();
                break;
            case 'm':
            case 'M':
                this.toggleMap();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
            case 's':
            case 'S':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.saveManager.saveGame(this.gameState);
                    this.uiManager.showNotification('Oyun kaydedildi!', 'success');
                }
                break;
        }
    }
}

// ===== GLOBAL OYUN INSTANCE =====
let game;

// ===== BAŞLATMA =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Mine\'in Maceraları yükleniyor...');
        
        // Oyunu oluştur
        game = new MineAdventureGame();
        
        // Klavye olaylarını dinle
        document.addEventListener('keydown', (e) => {
            game.handleKeyPress(e);
        });
        
        // Pencere kapatıldığında kaydet
        window.addEventListener('beforeunload', () => {
            if (game && game.gameState.gameStarted) {
                game.saveManager.saveGame(game.gameState);
            }
        });
        
        // Oyun süresini güncelle
        setInterval(() => {
            if (game && game.gameState.gameStarted) {
                game.gameState.playTime = Math.floor((Date.now() - game.gameState.startTime) / 1000);
            }
        }, 1000);
        
        console.log('✅ Mine\'in Maceraları başarıyla yüklendi!');
        
    } catch (error) {
        console.error('❌ Oyun yüklenirken hata:', error);
        
        // Hata mesajını göster
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = 'Oyun yüklenemedi. Sayfayı yenileyin.';
            loadingText.style.color = 'var(--error)';
        }
    }
});

// ===== DEBUG İÇİN EXPORT =====
window.game = () => game;
window.MineAdventureGame = MineAdventureGame;
