// ===== UI MANAGER =====

/**
 * UI yöneticisi
 */

class UIManager {
    constructor() {
        this.currentScreen = null;
        this.activeModals = new Set();
        this.particles = [];
    }

    init(game) {
        this.game = game;
        this.setupEventListeners();
        console.log('🎨 UI Manager initialized');
    }

    setupEventListeners() {
        // Ana menü butonları
        const newGameBtn = document.getElementById('new-game-btn');
        const continueBtn = document.getElementById('continue-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const creditsBtn = document.getElementById('credits-btn');

        if (newGameBtn) newGameBtn.addEventListener('click', () => this.game.newGame());
        if (continueBtn) continueBtn.addEventListener('click', () => this.game.continueGame());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.game.showSettings());
        if (creditsBtn) creditsBtn.addEventListener('click', () => this.game.showCredits());

        // Bölüm seçim
        const backToMenuBtn = document.getElementById('back-to-menu');
        if (backToMenuBtn) backToMenuBtn.addEventListener('click', () => this.game.backToMenu());

        // Oyun ekranı kontrolleri
        const pauseBtn = document.getElementById('pause-btn');
        const inventoryBtn = document.getElementById('inventory-btn');
        const mapBtn = document.getElementById('map-btn');
        const soundBtn = document.getElementById('sound-btn');

        if (pauseBtn) pauseBtn.addEventListener('click', () => this.game.togglePause());
        if (inventoryBtn) inventoryBtn.addEventListener('click', () => this.game.toggleInventory());
        if (mapBtn) mapBtn.addEventListener('click', () => this.game.toggleMap());
        if (soundBtn) soundBtn.addEventListener('click', () => this.toggleSound());

        // Modal kapatma butonları
        this.setupModalCloseListeners();
    }

    setupModalCloseListeners() {
        const closeButtons = [
            { id: 'close-inventory', modal: 'inventory-modal' },
            { id: 'close-map', modal: 'map-modal' },
            { id: 'close-pause', modal: 'pause-modal' },
            { id: 'close-settings', modal: 'settings-modal' },
            { id: 'close-credits', modal: 'credits-modal' }
        ];

        closeButtons.forEach(({ id, modal }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.closeModal(modal));
            }
        });

        // Modal overlay tıklamaları
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    const modal = overlay.parentElement;
                    const modalId = modal.id;
                    this.closeModal(modalId);
                }
            });
        });
    }

    showScreen(screenId) {
        // Tüm ekranları gizle
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Hedef ekranı göster
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        // Tüm modalları kapat
        this.closeAllModals();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.activeModals.add(modalId);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            this.activeModals.delete(modalId);
        }
    }

    toggleModal(modalId) {
        if (this.activeModals.has(modalId)) {
            this.closeModal(modalId);
        } else {
            this.showModal(modalId);
        }
    }

    closeAllModals() {
        this.activeModals.forEach(modalId => {
            this.closeModal(modalId);
        });
    }

    createParticles(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Mevcut parçacıkları temizle
        container.innerHTML = '';

        // Yeni parçacıklar oluştur
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.animationDuration = `${10 + Math.random() * 10}s`;
            
            container.appendChild(particle);
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        // Animasyonu tetikle
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Otomatik kaldır
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showFloatingText(text, type = 'info') {
        const container = document.querySelector('.game-content');
        if (!container) return;

        const floatingText = document.createElement('div');
        floatingText.className = `floating-text ${type}`;
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: bold;
            color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            z-index: 1000;
            pointer-events: none;
            animation: floatUp 2s ease-out forwards;
        `;

        // CSS animasyonu ekle
        if (!document.querySelector('#floating-text-style')) {
            const style = document.createElement('style');
            style.id = 'floating-text-style';
            style.textContent = `
                @keyframes floatUp {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -150%);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(floatingText);

        // Kaldır
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 2000);
    }

    toggleSound() {
        const soundBtn = document.getElementById('sound-btn');
        if (!soundBtn) return;

        const isMuted = this.game.audioManager.toggleMute();
        soundBtn.querySelector('.btn-icon').textContent = isMuted ? '🔇' : '🔊';
        
        this.showNotification(isMuted ? 'Ses kapatıldı' : 'Ses açıldı', 'info');
    }

    updateInventory() {
        const inventoryGrid = document.getElementById('inventory-grid');
        const totalItems = document.getElementById('total-items');
        const rareItems = document.getElementById('rare-items');

        if (!inventoryGrid) return;

        const inventory = this.game.gameState.inventory || [];
        
        // Envanter grid'ini güncelle
        inventoryGrid.innerHTML = inventory.map((item, index) => `
            <div class="inventory-item">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
            </div>
        `).join('');

        // İstatistikleri güncelle
        if (totalItems) totalItems.textContent = inventory.length;
        if (rareItems) rareItems.textContent = inventory.filter(item => 
            item.name.includes('Altın') || item.name.includes('Ejderha') || item.name.includes('Tacı')
        ).length;
    }

    updateMap() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        const chapters = this.game.getAllChapters();
        
        mapContainer.innerHTML = chapters.map(chapter => {
            const isUnlocked = this.game.gameState.unlockedChapters.includes(chapter.id);
            const progress = this.game.gameState.chapterProgress[chapter.id] || 0;
            
            return `
                <div class="map-region ${!isUnlocked ? 'locked' : ''}">
                    <div class="region-icon">${chapter.icon}</div>
                    <div class="region-name">${chapter.title}</div>
                    <div class="region-status">${isUnlocked ? `${progress}%` : 'Kilitli'}</div>
                </div>
            `;
        }).join('');
    }

    updateSettings() {
        // Ayarları UI'dan oku
        const musicVolume = document.getElementById('music-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const textSpeed = document.getElementById('text-speed');
        const autoSave = document.getElementById('auto-save');
        const particleEffects = document.getElementById('particle-effects');
        const theme = document.getElementById('theme');

        if (musicVolume) {
            musicVolume.value = this.game.gameState.settings.musicVolume;
            document.getElementById('music-volume-value').textContent = `${this.game.gameState.settings.musicVolume}%`;
        }

        if (sfxVolume) {
            sfxVolume.value = this.game.gameState.settings.sfxVolume;
            document.getElementById('sfx-volume-value').textContent = `${this.game.gameState.settings.sfxVolume}%`;
        }

        if (textSpeed) textSpeed.value = this.game.gameState.settings.textSpeed;
        if (autoSave) autoSave.checked = this.game.gameState.settings.autoSave;
        if (particleEffects) particleEffects.checked = this.game.gameState.settings.particleEffects;
        if (theme) theme.value = this.game.gameState.settings.theme;

        // Ayar değişikliği dinleyicileri
        this.setupSettingsListeners();
    }

    setupSettingsListeners() {
        const musicVolume = document.getElementById('music-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const saveSettings = document.getElementById('save-settings');
        const resetSettings = document.getElementById('reset-settings');

        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('music-volume-value').textContent = `${value}%`;
                this.game.gameState.settings.musicVolume = parseInt(value);
            });
        }

        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('sfx-volume-value').textContent = `${value}%`;
                this.game.gameState.settings.sfxVolume = parseInt(value);
            });
        }

        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                // Ayarları kaydet
                this.game.saveManager.saveGame(this.game.gameState);
                this.showNotification('Ayarlar kaydedildi!', 'success');
                this.closeModal('settings-modal');
            });
        }

        if (resetSettings) {
            resetSettings.addEventListener('click', () => {
                // Ayarları sıfırla
                this.game.gameState.settings = {
                    musicVolume: 70,
                    sfxVolume: 80,
                    textSpeed: 'normal',
                    autoSave: true,
                    particleEffects: true,
                    theme: 'dark'
                };
                this.updateSettings();
                this.showNotification('Ayarlar sıfırlandı!', 'info');
            });
        }
    }
}

window.UIManager = UIManager;
