// Kelime Savaşı - Ana Başlatıcı
class WordBattleApp {
    constructor() {
        this.game = null;
        this.network = null;
        this.ui = null;
        this.isInitialized = false;
        
        // Performans izleme
        this.performanceMonitor = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0
        };
        
        // Uygulama ayarları
        this.settings = {
            soundVolume: 0.7,
            musicVolume: 0.5,
            notifications: true,
            autoSave: true,
            theme: 'dark',
            language: 'tr'
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🧠 Kelime Savaşı başlatılıyor...');
            
            // Yükleme ekranını göster
            this.showLoadingScreen();
            
            // Ayarları yükle
            this.loadSettings();
            
            // Sistemleri başlat
            await this.initializeSystems();
            
            // Event listener'ları ayarla
            this.setupGlobalEventListeners();
            
            // Performans izlemeyi başlat
            this.startPerformanceMonitoring();
            
            // Servis worker'ı kaydet (PWA için)
            this.registerServiceWorker();
            
            // Yükleme ekranını gizle
            this.hideLoadingScreen();
            
            console.log('✅ Kelime Savaşı başarıyla başlatıldı!');
            
        } catch (error) {
            console.error('❌ Başlatma hatası:', error);
            this.showError('Uygulama başlatılırken bir hata oluştu: ' + error.message);
        }
    }
    
    async initializeSystems() {
        // Oyun motorunu başlat
        this.game = new WordBattleGame();
        
        // AI sistemini başlat
        this.aiMode = new AIGameMode(this.game);
        
        // UI yöneticisini başlat
        this.ui = new UIManager(this.game);
        
        // Ağ yöneticisini başlat
        this.network = new NetworkManager(this.game);
        
        // Sistemleri birbirine bağla
        this.game.ui = this.ui;
        this.game.network = this.network;
        this.game.aiMode = this.aiMode;
        
        // Kullanıcı verilerini yükle
        this.loadUserData();
        
        this.isInitialized = true;
    }
    
    setupGlobalEventListeners() {
        // Pencere olayları
        window.addEventListener('beforeunload', (e) => {
            if (this.settings.autoSave && this.isInitialized) {
                this.saveUserData();
                e.preventDefault();
                e.returnValue = 'Veriler kaydediliyor. Çıkmak istediğinizden emin misiniz?';
            }
        });
        
        window.addEventListener('blur', () => {
            if (this.game && this.game.gameState.isPlaying) {
                this.pauseGame();
            }
        });
        
        window.addEventListener('focus', () => {
            if (this.game && this.game.gameState.isPaused) {
                this.resumeGame();
            }
        });
        
        // Klavye kısayolları
        document.addEventListener('keydown', (e) => {
            // F11 - Tam ekran
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            
            // Ctrl+S - Hızlı kaydet
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.quickSave();
            }
            
            // Ctrl+H - Yardım
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                this.showHelp();
            }
            
            // ESC - Menüye dön
            if (e.key === 'Escape') {
                if (this.game && this.game.currentScreen !== 'mainMenu') {
                    this.game.showScreen('mainMenu');
                }
            }
        });
        
        // Online/offline durumu
        window.addEventListener('online', () => {
            this.showNotification('İnternet bağlantısı geri geldi!', 'success');
            if (this.network) {
                this.network.reconnect();
            }
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('İnternet bağlantısı kesildi!', 'error');
            if (this.network) {
                this.network.disconnect();
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
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker kaydedildi:', registration);
                })
                .catch(error => {
                    console.log('❌ Service Worker kaydedilemedi:', error);
                });
        }
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            // Yükleme animasyonunu tamamlamak için biraz bekle
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'welcome-modal';
        welcome.innerHTML = `
            <div class="welcome-content">
                <h2>🧠 Kelime Savaşı'na Hoş Geldin!</h2>
                <p>Online kelime yarışmasında zekini test et, arkadaşlarınla yarış!</p>
                <div class="welcome-features">
                    <div class="feature">
                        <span class="feature-icon">⚡</span>
                        <span class="feature-text">Hızlı oyun modu</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🏆</span>
                        <span class="feature-text">Liderlik tablosu</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">💬</span>
                        <span class="feature-text">Canlı sohbet</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🎯</span>
                        <span class="feature-text">Farklı kategoriler</span>
                    </div>
                </div>
                <div class="welcome-tips">
                    <h3>💡 İpuçları:</h3>
                    <ul>
                        <li>Harfleri tıklayarak kelime oluştur</li>
                        <li>Enter tuşu ile kelimeyi gönder</li>
                        <li>Güçlendirmeleri stratejik kullan</li>
                        <li>Sohbetten yarışmacılarla etkileşime geç</li>
                    </ul>
                </div>
                <button class="welcome-start-btn">Başla!</button>
            </div>
        `;
        
        welcome.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 4000;
            animation: fadeIn 0.5s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .welcome-content {
                background: linear-gradient(135deg, var(--card-bg), var(--light-bg));
                border: 2px solid var(--primary-color);
                border-radius: 20px;
                padding: 40px;
                max-width: 600px;
                width: 90%;
                text-align: center;
                color: var(--text-primary);
                box-shadow: 0 20px 80px rgba(99, 102, 241, 0.3);
            }
            
            .welcome-content h2 {
                color: var(--primary-color);
                margin-bottom: 15px;
                font-size: 2rem;
            }
            
            .welcome-features {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 25px 0;
            }
            
            .feature {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                background: var(--light-bg);
                border-radius: 10px;
                border: 1px solid var(--border-color);
            }
            
            .feature-icon {
                font-size: 1.5rem;
            }
            
            .feature-text {
                font-weight: 600;
            }
            
            .welcome-tips {
                text-align: left;
                margin: 25px 0;
            }
            
            .welcome-tips h3 {
                color: var(--accent-color);
                margin-bottom: 10px;
            }
            
            .welcome-tips ul {
                list-style: none;
                padding: 0;
            }
            
            .welcome-tips li {
                padding: 5px 0;
                color: var(--text-secondary);
            }
            
            .welcome-tips li::before {
                content: '→ ';
                color: var(--primary-color);
                font-weight: bold;
            }
            
            .welcome-start-btn {
                background: var(--gradient-primary);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 20px;
            }
            
            .welcome-start-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(welcome);
        
        // Kapatma butonu
        welcome.querySelector('.welcome-start-btn').addEventListener('click', () => {
            welcome.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                welcome.remove();
                style.remove();
            }, 500);
        });
        
        // Otomatik kapanma
        setTimeout(() => {
            if (welcome.parentNode) {
                welcome.querySelector('.welcome-start-btn').click();
            }
        }, 15000);
    }
    
    quickSave() {
        if (this.game && this.isInitialized) {
            this.saveUserData();
            this.showNotification('⚡ Hızlı kaydedildi!', 'success');
        }
    }
    
    saveUserData() {
        if (!this.isInitialized) return;
        
        const saveData = {
            userData: this.game.userData,
            settings: this.settings,
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        localStorage.setItem('wordBattleSaveData', JSON.stringify(saveData));
        console.log('💾 Veriler kaydedildi');
    }
    
    loadUserData() {
        try {
            const saveData = localStorage.getItem('wordBattleSaveData');
            
            if (saveData) {
                const data = JSON.parse(saveData);
                
                // Ayarları yükle
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
                
                // Kullanıcı verisini yükle
                if (data.userData && this.game) {
                    this.game.userData = { ...this.game.userData, ...data.userData };
                }
                
                console.log('📂 Kayıtlı veriler yüklendi');
            }
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
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
    
    pauseGame() {
        if (this.game && this.game.gameState.isPlaying && !this.game.gameState.isPaused) {
            this.game.gameState.isPaused = true;
            if (this.game.timer) {
                clearInterval(this.game.timer);
            }
            console.log('⏸️ Oyun duraklatıldı');
        }
    }
    
    resumeGame() {
        if (this.game && this.game.gameState.isPaused) {
            this.game.gameState.isPaused = false;
            if (this.game.gameState.timeLeft > 0) {
                this.game.startTimer();
            }
            console.log('▶️ Oyuna devam ediliyor');
        }
    }
    
    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h2>📖 Yardım</h2>
                <div class="help-sections">
                    <div class="help-section">
                        <h3>🎮 Oyun Nasıl Oynanır?</h3>
                        <ol>
                            <li>Verilen harflerle kelime oluştur</li>
                            <li>Kelimeyi input'a yaz ve Enter'a bas</li>
                            <li>En yüksek skoru elde et</li>
                            <li>Süresi bitmeden en çok kelimeyi bul</li>
                        </ol>
                    </div>
                    
                    <div class="help-section">
                        <h3>⌨️ Klavye Kısayolları</h3>
                        <ul>
                            <li><kbd>Enter</kbd> - Kelimeyi gönder</li>
                            <li><kbd>ESC</kbd> - Ana menü</li>
                            <li><kbd>F11</kbd> - Tam ekran</li>
                            <li><kbd>Ctrl+S</kbd> - Hızlı kaydet</li>
                            <li><kbd>Ctrl+H</kbd> - Yardım</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h3>🎯 Güçlendirmeler</h3>
                        <ul>
                            <li><span class="powerup">⏰</span> Zaman Durdurma - Süreyi 10 saniye durdurur</li>
                            <li><span class="powerup">🔤</span> Ekstra Harf - Yeni harf ekler</li>
                            <li><span class="powerup">💡</span> Süper İpucu - Kelime hakkında ipucu verir</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h3>🏆 Puanlama</h3>
                        <ul>
                            <li>Her harf: 10 puan</li>
                            <li>6+ harfli kelimeler: +20 puan</li>
                            <li>8+ harfli kelimeler: +50 puan</li>
                            <li>Seri bonus: 5+ kelime +100 puan</li>
                        </ul>
                    </div>
                </div>
                <button class="help-close-btn">Kapat</button>
            </div>
        `;
        
        this.showModal(helpContent);
        
        // Kapatma butonu
        document.querySelector('.help-close-btn').addEventListener('click', () => {
            this.closeModal();
        });
    }
    
    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = content;
        
        document.body.appendChild(modal);
        
        // Modal dışına tıklayınca kapat
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }
    
    showNotification(message, type = 'info') {
        if (!this.settings.notifications) return;
        
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Otomatik kaldır
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
        console.error(message);
    }
    
    loadSettings() {
        try {
            const settings = localStorage.getItem('wordBattleSettings');
            if (settings) {
                this.settings = { ...this.settings, ...JSON.parse(settings) };
            }
        } catch (error) {
            console.error('Ayarlar yüklenemedi:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('wordBattleSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Ayarlar kaydedilemedi:', error);
        }
    }
}

// UI Yöneticisi
class UIManager {
    constructor(game) {
        this.game = game;
        this.currentTheme = 'dark';
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupAnimations();
        this.setupResponsive();
    }
    
    setupTheme() {
        // Tema ayarları
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.currentTheme = prefersDark.matches ? 'dark' : 'light';
        
        prefersDark.addEventListener('change', (e) => {
            this.currentTheme = e.matches ? 'dark' : 'light';
            this.applyTheme();
        });
        
        this.applyTheme();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
    
    setupAnimations() {
        // Sayfa geçiş animasyonları
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(20px); }
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .animate-bounce {
                animation: bounce 2s infinite;
            }
            
            .animate-pulse {
                animation: pulse 2s infinite;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupResponsive() {
        // Responsive tasarım için viewport meta tag'i
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(meta);
        }
        
        // Touch device kontrolü
        this.isTouchDevice = 'ontouchstart' in window;
        
        if (this.isTouchDevice) {
            document.body.classList.add('touch-device');
        }
    }
}

// Ağ Yöneticisi
class NetworkManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.init();
    }
    
    init() {
        // WebSocket bağlantısı (gerçek sunucu için)
        // this.connect();
    }
    
    connect() {
        try {
            // this.socket = new WebSocket('ws://localhost:8080');
            // this.setupSocketEvents();
        } catch (error) {
            console.error('WebSocket bağlantı hatası:', error);
        }
    }
    
    setupSocketEvents() {
        if (!this.socket) return;
        
        this.socket.onopen = () => {
            console.log('🌐 Sunucuya bağlandı');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.socket.onclose = () => {
            console.log('🌐 Sunucu bağlantısı kesildi');
            this.isConnected = false;
            this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
            console.error('🌐 WebSocket hatası:', error);
        };
    }
    
    handleMessage(data) {
        // Gelen mesajları işle
        switch (data.type) {
            case 'roomUpdate':
                this.game.updateRoom(data.payload);
                break;
            case 'gameUpdate':
                this.game.updateGameState(data.payload);
                break;
            case 'chatMessage':
                this.game.addChatMessage(data.payload.sender, data.payload.message);
                break;
        }
    }
    
    send(type, payload) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({ type, payload }));
        }
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
    }
    
    reconnect() {
        this.connect();
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.reconnect();
            }, 2000 * this.reconnectAttempts);
        }
    }
}

// Uygulamayı başlat
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new WordBattleApp();
    
    // Global erişim
    window.WordBattleApp = WordBattleApp;
    window.app = app;
    
    // Hoş geldin mesajını göster
    setTimeout(() => {
        app.showWelcomeMessage();
    }, 1000);
});

// Service Worker (PWA desteği için)
const swCode = `
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
`;

// Service Worker dosyasını oluştur
const swBlob = new Blob([swCode], { type: 'application/javascript' });
const swUrl = URL.createObjectURL(swBlob);

// Service Worker'ı kaydet
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(swUrl)
        .then(registration => {
            console.log('Service Worker registered:', registration);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}
