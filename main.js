// ===== MAIN GAME MANAGER =====
class GameManager {
    constructor() {
        this.currentScreen = 'loading-screen';
        this.currentChapter = 1;
        this.currentScene = 0;
        this.gameState = {
            health: 100,
            score: 0,
            crystals: 0,
            inventory: [],
            unlockedChapters: [1],
            chapterProgress: {},
            playerChoices: [],
            gameStarted: false,
            gameCompleted: false
        };
        
        this.storyManager = new StoryManager();
        this.uiManager = new UIManager();
        this.audioManager = new AudioManager();
        this.saveManager = new SaveManager();
        
        this.init();
    }

    async init() {
        // Yükleme ekranını göster
        this.uiManager.showScreen('loading-screen');
        
        // Oyun verilerini yükle
        await this.loadGameData();
        
        // Sesleri hazırla
        await this.audioManager.init();
        
        // Oyunu başlat
        setTimeout(() => {
            this.uiManager.showScreen('main-menu');
            this.audioManager.playMusic('menu');
        }, 2000);
    }

    async loadGameData() {
        // Kayıtlı oyun var mı kontrol et
        const savedGame = this.saveManager.loadGame();
        if (savedGame) {
            this.gameState = { ...this.gameState, ...savedGame };
        }
        
        // Yükleme animasyonu
        this.uiManager.animateLoadingProgress();
    }

    // ===== OYUN KONTROLLERİ =====
    newGame() {
        this.gameState = {
            health: 100,
            score: 0,
            crystals: 0,
            inventory: [],
            unlockedChapters: [1],
            chapterProgress: {},
            playerChoices: [],
            gameStarted: true,
            gameCompleted: false
        };
        
        this.currentChapter = 1;
        this.currentScene = 0;
        
        this.uiManager.showScreen('chapter-select');
        this.audioManager.playSound('button-click');
        this.saveManager.saveGame(this.gameState);
    }

    continueGame() {
        if (this.gameState.gameStarted) {
            this.uiManager.showScreen('chapter-select');
        } else {
            this.uiManager.showMessage('Kayıtlı oyun bulunamadı!', 'warning');
        }
        this.audioManager.playSound('button-click');
    }

    showSettings() {
        this.uiManager.showModal('settings-modal');
        this.audioManager.playSound('button-click');
    }

    showCredits() {
        this.uiManager.showCredits();
        this.audioManager.playSound('button-click');
    }

    // ===== BÖLÜM YÖNETİMİ =====
    selectChapter(chapterId) {
        if (!this.gameState.unlockedChapters.includes(chapterId)) {
            this.uiManager.showMessage('Bu bölüm henüz kilitli!', 'warning');
            return;
        }
        
        this.currentChapter = chapterId;
        this.currentScene = 0;
        this.startChapter();
    }

    async startChapter() {
        this.uiManager.showScreen('game-screen');
        this.audioManager.playMusic(`chapter-${this.currentChapter}`);
        
        // Bölüm başlangıç animasyonu
        await this.uiManager.showChapterIntro(this.currentChapter);
        
        // İlk sahneyi yükle
        this.loadScene(0);
    }

    loadScene(sceneIndex) {
        const scene = this.storyManager.getScene(this.currentChapter, sceneIndex);
        if (!scene) {
            this.completeChapter();
            return;
        }
        
        this.currentScene = sceneIndex;
        this.uiManager.displayScene(scene);
        this.uiManager.updateStats(this.gameState);
    }

    // ===== SEÇİM İŞLEMLERİ =====
    makeChoice(choiceIndex) {
        const scene = this.storyManager.getScene(this.currentChapter, this.currentScene);
        const choice = scene.choices[choiceIndex];
        
        if (!choice) return;
        
        // Seçimi kaydet
        this.gameState.playerChoices.push({
            chapter: this.currentChapter,
            scene: this.currentScene,
            choice: choiceIndex
        });
        
        // Seçim sonucunu işle
        this.processChoice(choice);
        
        // Sesi çal
        this.audioManager.playSound('choice-made');
        
        // Sonraki sahneye geç
        setTimeout(() => {
            this.loadScene(this.currentScene + 1);
        }, 2000);
    }

    processChoice(choice) {
        // Puan ekle
        if (choice.points) {
            this.gameState.score += choice.points;
            this.uiManager.showFloatingText(`+${choice.points} puan`, 'success');
        }
        
        // Can değiştir
        if (choice.health) {
            this.gameState.health = Math.max(0, Math.min(100, this.gameState.health + choice.health));
            if (choice.health < 0) {
                this.uiManager.showFloatingText(`${choice.health} can`, 'error');
            } else {
                this.uiManager.showFloatingText(`+${choice.health} can`, 'success');
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
        this.uiManager.updateStats(this.gameState);
        
        // Oyunu kaydet
        this.saveManager.saveGame(this.gameState);
        
        // Oyunu kontrol et
        if (this.gameState.health <= 0) {
            this.gameOver();
        }
    }

    // ===== MODAL İŞLEMLERİ =====
    toggleInventory() {
        this.uiManager.toggleModal('inventory-modal');
        this.audioManager.playSound('button-click');
    }

    toggleMap() {
        this.uiManager.toggleModal('map-modal');
        this.audioManager.playSound('button-click');
    }

    togglePause() {
        this.uiManager.toggleModal('pause-modal');
        this.audioManager.playSound('button-click');
    }

    closeModal(modalId) {
        this.uiManager.closeModal(modalId);
        this.audioManager.playSound('button-click');
    }

    // ===== OYUN DURUMU =====
    showMainMenu() {
        this.uiManager.showScreen('main-menu');
        this.audioManager.playMusic('menu');
    }

    showChapterSelect() {
        this.uiManager.showScreen('chapter-select');
        this.audioManager.playMusic('menu');
    }

    resumeGame() {
        this.uiManager.closeModal('pause-modal');
    }

    restartChapter() {
        this.currentScene = 0;
        this.gameState.health = 100;
        this.uiManager.closeModal('pause-modal');
        this.loadScene(0);
        this.saveManager.saveGame(this.gameState);
    }

    saveGame() {
        this.saveManager.saveGame(this.gameState);
        this.uiManager.showMessage('Oyun kaydedildi!', 'success');
        this.uiManager.closeModal('pause-modal');
    }

    // ===== OYUN SONU =====
    completeChapter() {
        // Bölüm ilerlemesini güncelle
        this.gameState.chapterProgress[this.currentChapter] = 100;
        
        // Sonraki bölümü kilitle
        const nextChapter = this.currentChapter + 1;
        if (nextChapter <= 6 && !this.gameState.unlockedChapters.includes(nextChapter)) {
            this.gameState.unlockedChapters.push(nextChapter);
            this.uiManager.showMessage(`Bölüm ${nextChapter} kilitlendi!`, 'success');
        }
        
        // Oyunu kaydet
        this.saveManager.saveGame(this.gameState);
        
        // Bölüm bitiş ekranı
        this.showChapterComplete();
    }

    showChapterComplete() {
        const isLastChapter = this.currentChapter === 6;
        const message = isLastChapter ? 
            'Tebrikler! Oyunu tamamladın!' : 
            `Bölüm ${this.currentChapter} tamamlandı!`;
        
        this.uiManager.showChapterCompleteScreen(message, isLastChapter);
        this.audioManager.playSound('chapter-complete');
    }

    gameOver() {
        this.uiManager.showGameOverScreen();
        this.audioManager.playSound('game-over');
    }

    // ===== KLAVYE KONTROLLERİ =====
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
                this.saveGame();
                break;
        }
    }
}

// ===== GLOBAL GAME INSTANCE =====
let gameManager;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        gameManager = new GameManager();
        
        // Klavye olaylarını dinle
        document.addEventListener('keydown', (e) => {
            gameManager.handleKeyPress(e);
        });
        
        // Pencere kapatıldığında kaydet
        window.addEventListener('beforeunload', () => {
            if (gameManager && gameManager.gameState.gameStarted) {
                gameManager.saveManager.saveGame(gameManager.gameState);
            }
        });
        
        console.log('Mine\'in Maceraları başarıyla yüklendi!');
        
    } catch (error) {
        console.error('Oyun yüklenirken hata:', error);
        document.getElementById('loading-text').textContent = 'Oyun yüklenemedi. Sayfayı yenileyin.';
    }
});

// ===== EXPORT FOR DEBUGGING =====
window.gameManager = () => gameManager;
