// Minecraft Pro - Ana Başlatıcı ve Entegrasyon
class MinecraftPro {
    constructor() {
        this.game = null;
        this.inventory = null;
        this.crafting = null;
        this.isInitialized = false;
        
        // Performans izleme
        this.performanceMonitor = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0
        };
        
        // Ayarlar
        this.settings = {
            soundVolume: 0.5,
            musicVolume: 0.3,
            particleQuality: 'high',
            renderDistance: 'medium',
            autoSave: true,
            showFPS: false
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🎮 Minecraft Pro başlatılıyor...');
            
            // Yükleme ekranını göster
            this.showLoadingScreen();
            
            // Ayarları yükle
            this.loadSettings();
            
            // Oyun sistemlerini başlat
            await this.initializeSystems();
            
            // Event listener'ları ayarla
            this.setupGlobalEventListeners();
            
            // Performans izlemeyi başlat
            this.startPerformanceMonitoring();
            
            // Oyunu başlat
            this.startGame();
            
            console.log('✅ Minecraft Pro başarıyla başlatıldı!');
            
        } catch (error) {
            console.error('❌ Başlatma hatası:', error);
            this.showError('Oyun başlatılırken bir hata oluştu: ' + error.message);
        }
    }
    
    async initializeSystems() {
        // Ana oyun motorunu başlat
        this.game = new MinecraftGame();
        
        // Envanter sistemini başlat
        this.inventory = new Inventory(this.game);
        
        // Crafting sistemini başlat
        this.crafting = new CraftingSystem(this.game);
        
        // Sistemleri birbirine bağla
        this.game.inventory = this.inventory;
        this.game.crafting = this.crafting;
        
        // Kayıtlı veriyi yükle
        this.loadSavedData();
        
        this.isInitialized = true;
    }
    
    setupGlobalEventListeners() {
        // Pencere olayları
        window.addEventListener('beforeunload', (e) => {
            if (this.settings.autoSave && this.isInitialized) {
                this.saveGame();
                e.preventDefault();
                e.returnValue = 'Oyun kaydediliyor. Çıkmak istediğinizden emin misiniz?';
            }
        });
        
        window.addEventListener('blur', () => {
            if (this.game && this.game.isRunning && !this.game.isPaused) {
                this.game.toggleMenu();
            }
        });
        
        // Klavye kısayolları
        document.addEventListener('keydown', (e) => {
            // F3 - FPS göster/gizle
            if (e.key === 'F3') {
                this.settings.showFPS = !this.settings.showFPS;
                this.updateFPSDisplay();
            }
            
            // F5 - Hızlı kaydet
            if (e.key === 'F5') {
                this.quickSave();
            }
            
            // F11 - Tam ekran
            if (e.key === 'F11') {
                this.toggleFullscreen();
            }
            
            // G - Debug modu
            if (e.key === 'g' && e.ctrlKey) {
                this.toggleDebugMode();
            }
        });
        
        // Performans optimizasyonu
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        });
    }
    
    startGame() {
        if (!this.isInitialized) {
            console.error('Oyun sistemleri henüz başlatılmadı!');
            return;
        }
        
        // Oyunu başlat
        this.game.start();
        
        // Welcome mesajı
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 4000);
    }
    
    showLoadingScreen() {
        // Yükleme ekranı zaten HTML'de var
        // Burada ek animasyonlar veya progress güncellemeleri yapılabilir
        console.log('📦 Yükleme ekranı gösteriliyor...');
    }
    
    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'welcome-message';
        welcome.innerHTML = `
            <h2>🎮 Minecraft Pro'ya Hoş Geldin! 🎮</h2>
            <p>Arkadaşına özel olarak hazırlanan bu oyunda keşfet, inşa et ve hayal et!</p>
            <div class="welcome-tips">
                <h3>💡 İpuçları:</h3>
                <ul>
                    <li>WASD tuşları ile hareket et</li>
                    <li>Boşluk tuşu ile zıpla</li>
                    <li>Sol tık ile blokları kır</li>
                    <li>Sağ tık ile blok yerleştir</li>
                    <li>E tuşu ile envanteri aç</li>
                    <li>C tuşu ile crafting masasında üretim yap</li>
                </ul>
            </div>
            <button class="welcome-close">Başla!</button>
        `;
        
        welcome.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(13, 13, 13, 0.98));
            border: 3px solid #4CAF50;
            border-radius: 20px;
            padding: 30px;
            z-index: 2000;
            max-width: 500px;
            text-align: center;
            color: white;
            box-shadow: 0 20px 80px rgba(76, 175, 80, 0.3);
            animation: slideIn 0.5s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
            
            .welcome-message h2 {
                color: #4CAF50;
                font-family: 'Orbitron', monospace;
                margin-bottom: 15px;
            }
            
            .welcome-message h3 {
                color: #FF9800;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            
            .welcome-message ul {
                text-align: left;
                margin: 10px 0;
            }
            
            .welcome-message li {
                margin: 5px 0;
                color: #b0b0b0;
            }
            
            .welcome-close {
                background: linear-gradient(45deg, #4CAF50, #8BC34A);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-family: 'Orbitron', monospace;
                margin-top: 20px;
                transition: all 0.3s ease;
            }
            
            .welcome-close:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(welcome);
        
        // Kapatma butonu
        welcome.querySelector('.welcome-close').addEventListener('click', () => {
            welcome.style.animation = 'slideIn 0.5s ease-out reverse';
            setTimeout(() => {
                welcome.remove();
                style.remove();
            }, 500);
        });
        
        // Otomatik kapanma
        setTimeout(() => {
            if (welcome.parentNode) {
                welcome.querySelector('.welcome-close').click();
            }
        }, 10000);
    }
    
    startPerformanceMonitoring() {
        let lastTime = performance.now();
        let frames = 0;
        
        const monitor = () => {
            const currentTime = performance.now();
            frames++;
            
            if (currentTime - lastTime >= 1000) {
                this.performanceMonitor.fps = frames;
                this.performanceMonitor.frameTime = (currentTime - lastTime) / frames;
                
                // Memory kullanımı (eğer destekleniyorsa)
                if (performance.memory) {
                    this.performanceMonitor.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                }
                
                // FPS display'ı güncelle
                if (this.settings.showFPS) {
                    this.updateFPSDisplay();
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }
    
    updateFPSDisplay() {
        let fpsDisplay = document.getElementById('fpsDisplay');
        
        if (!fpsDisplay && this.settings.showFPS) {
            fpsDisplay = document.createElement('div');
            fpsDisplay.id = 'fpsDisplay';
            fpsDisplay.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #4CAF50;
                padding: 10px;
                border-radius: 5px;
                font-family: 'Orbitron', monospace;
                font-size: 12px;
                z-index: 1000;
                border: 1px solid #4CAF50;
            `;
            document.body.appendChild(fpsDisplay);
        }
        
        if (fpsDisplay) {
            if (this.settings.showFPS) {
                fpsDisplay.style.display = 'block';
                fpsDisplay.innerHTML = `
                    FPS: ${this.performanceMonitor.fps}<br>
                    Frame: ${this.performanceMonitor.frameTime.toFixed(2)}ms<br>
                    Memory: ${this.performanceMonitor.memoryUsage.toFixed(1)}MB
                `;
            } else {
                fpsDisplay.style.display = 'none';
            }
        }
    }
    
    quickSave() {
        if (this.game && this.isInitialized) {
            this.saveGame();
            this.showNotification('⚡ Hızlı kaydedildi!', 'success');
        }
    }
    
    saveGame() {
        if (!this.isInitialized) return;
        
        const saveData = {
            game: this.game.getSaveData(),
            inventory: this.inventory.getSaveData(),
            settings: this.settings,
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        localStorage.setItem('minecraftProSave', JSON.stringify(saveData));
        console.log('💾 Oyun kaydedildi');
    }
    
    loadSavedData() {
        try {
            const saveData = localStorage.getItem('minecraftProSave');
            
            if (saveData) {
                const data = JSON.parse(saveData);
                
                // Ayarları yükle
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
                
                // Oyun verisini yükle (oyun başladıktan sonra)
                if (data.game && this.game) {
                    setTimeout(() => {
                        this.game.loadSaveData(data.game);
                    }, 100);
                }
                
                // Envanter verisini yükle
                if (data.inventory && this.inventory) {
                    this.inventory.loadSaveData(data.inventory);
                }
                
                console.log('📂 Kayıtlı veri yüklendi');
            }
        } catch (error) {
            console.error('Kayıt yükleme hatası:', error);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Tam ekran moduna geçilemedi:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    toggleDebugMode() {
        // Debug modu özellikleri
        console.log('🐛 Debug modu aktif');
        
        // Fly modu
        if (this.game && this.game.player) {
            this.game.player.abilities.fly = !this.game.player.abilities.fly;
            this.showNotification(
                this.game.player.abilities.fly ? '🚁 Uçuş modu aktif' : '🚶 Uçuş modu pasif',
                'info'
            );
        }
        
        // Blok limitlerini kaldır
        this.game.player.speed *= 2;
        
        // Tüm blokları gör
        this.game.world.blocks.forEach(block => {
            block.revealed = true;
        });
    }
    
    pauseGame() {
        if (this.game && this.game.isRunning && !this.game.isPaused) {
            this.game.isPaused = true;
            console.log('⏸️ Oyun duraklatıldı');
        }
    }
    
    resumeGame() {
        if (this.game && this.game.isPaused) {
            this.game.isPaused = false;
            console.log('▶️ Oyuna devam ediliyor');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 3000;
            animation: notificationSlide 0.3s ease-out;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlide {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Otomatik kaldır
        setTimeout(() => {
            notification.style.animation = 'notificationSlide 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
        console.error(message);
    }
    
    loadSettings() {
        try {
            const settings = localStorage.getItem('minecraftProSettings');
            if (settings) {
                this.settings = { ...this.settings, ...JSON.parse(settings) };
            }
        } catch (error) {
            console.error('Ayarlar yüklenemedi:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('minecraftProSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Ayarlar kaydedilemedi:', error);
        }
    }
}

// Oyunu başlat
let minecraftPro;

// DOM yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    minecraftPro = new MinecraftPro();
});

// Global erişim için
window.MinecraftPro = MinecraftPro;
window.minecraftPro = minecraftPro;
