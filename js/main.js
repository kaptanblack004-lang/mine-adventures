// Efsanevi Mini Oyunlar - Ana Uygulama
// Menü yönetimi, ayarlar ve genel kontrol

// Ekran yönetimi
function showMenu() {
    console.log('🏠 showMenu() fonksiyonu çağrıldı');
    hideAllScreens();
    const menuElement = document.getElementById('menu');
    console.log('📍 Menu element:', menuElement);
    menuElement.classList.add('active');
    console.log('✅ Menu active class eklendi');
    document.getElementById('game-title').textContent = '';
    updateUI();
}

function showHighScores() {
    console.log('🏆 showHighScores() fonksiyonu çağrıldı');
    hideAllScreens();
    const scoresElement = document.getElementById('high-scores');
    console.log('📍 Scores element:', scoresElement);
    scoresElement.classList.add('active');
    console.log('✅ Scores active class eklendi');
    displayHighScores();
}

function showSettings() {
    console.log('⚙️ showSettings() fonksiyonu çağrıldı');
    hideAllScreens();
    const settingsElement = document.getElementById('settings');
    console.log('📍 Settings element:', settingsElement);
    settingsElement.classList.add('active');
    console.log('✅ Settings active class eklendi');
}

function showMultiplayer() {
    console.log('👥 showMultiplayer() fonksiyonu çağrıldı');
    hideAllScreens();
    const multiplayerElement = document.getElementById('multiplayer');
    console.log('📍 Multiplayer element:', multiplayerElement);
    multiplayerElement.classList.add('active');
    console.log('✅ Multiplayer active class eklendi');
    initWebSocket();
}

function showGameScreen(gameType) {
    console.log('🎮 showGameScreen() çağrıldı, gameType:', gameType);
    hideAllScreens();
    const gameScreenElement = document.getElementById('game-screen');
    console.log('📍 Game screen element:', gameScreenElement);
    gameScreenElement.classList.add('active');
    console.log('✅ Game screen active class eklendi');

    // Oyun başlığını ayarla
    const gameTitles = {
        xox: 'XOX',
        snake: 'Yılan',
        tetris: 'Tetris',
        memory: 'Hafıza',
        pong: 'Pong',
        space: 'Uzay Savunması'
    };

    const title = gameTitles[gameType] || 'Oyun';
    document.getElementById('game-title').textContent = title;
    console.log('📝 Oyun başlığı ayarlandı:', title);
}

function hideAllScreens() {
    console.log('🔄 hideAllScreens() çağrıldı');
    const screens = document.querySelectorAll('.screen');
    console.log('📍 Bulunan screen elementleri:', screens.length);
    screens.forEach((screen, index) => {
        console.log(`📱 Screen ${index}:`, screen.id, screen.className);
        screen.classList.remove('active');
    });
}

// Oyun başlatma
function startGame(gameType) {
    console.log('🎮 startGame() fonksiyonu çağrıldı, gameType:', gameType);
    showGameScreen(gameType);
    console.log('🎮 gameManager çağrılıyor:', gameManager);
    gameManager.startGame(gameType);
    console.log('🎵 audioManager çağrılıyor:', audioManager);
    audioManager.playClick();
}

// Oyun kontrolleri
function pauseGame() {
    gameManager.pauseGame();
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.textContent = gameManager.currentGame?.paused ? '▶️ Devam Et' : '⏸️ Duraklat';
    audioManager.playClick();
}

function restartGame() {
    gameManager.restartGame();
    audioManager.playSuccess();
}

function quitGame() {
    gameManager.quitGame();
    audioManager.playClick();
}

// UI güncelleme
function updateUI() {
    if (gameManager.currentGame) {
        document.getElementById('score').textContent = `Skor: ${gameManager.currentGame.score}`;
        document.getElementById('level').textContent = `Seviye: ${gameManager.currentGame.level}`;
        document.getElementById('lives').textContent = `Can: ${gameManager.currentGame.lives}`;
    } else {
        document.getElementById('score').textContent = 'Skor: 0';
        document.getElementById('level').textContent = 'Seviye: 1';
        document.getElementById('lives').textContent = 'Can: 3';
    }
}

// Klavye kontrolleri
function handleKeyPress(e) {
    switch (e.key) {
        case 'Escape':
            if (document.getElementById('game-screen').classList.contains('active')) {
                quitGame();
            } else if (document.getElementById('settings').classList.contains('active') ||
                       document.getElementById('high-scores').classList.contains('active')) {
                showMenu();
            }
            break;
        case ' ':
            e.preventDefault(); // Space tuşunun sayfayı kaydırmasını engelle
            break;
    }
}

// Ekran geçiş animasyonları
function initScreenTransitions() {
    const screens = document.querySelectorAll('.screen');

    screens.forEach(screen => {
        screen.addEventListener('transitionend', () => {
            // Geçiş tamamlandığında gerekli işlemleri yap
        });
    });
}

// Yüksek skor sistemi
let highScores = JSON.parse(localStorage.getItem('highScores')) || {
    xox: [],
    snake: [],
    tetris: [],
    memory: [],
    pong: [],
    space: []
};

function saveHighScore(gameType, score, playerName = 'Oyuncu') {
    if (!highScores[gameType]) {
        highScores[gameType] = [];
    }

    highScores[gameType].push({
        name: playerName,
        score: score,
        date: new Date().toLocaleDateString('tr-TR')
    });

    // Skorları sırala ve en iyi 10'u tut
    highScores[gameType].sort((a, b) => b.score - a.score);
    highScores[gameType] = highScores[gameType].slice(0, 10);

    localStorage.setItem('highScores', JSON.stringify(highScores));
    loadHighScores();
}

function loadHighScores() {
    highScores = JSON.parse(localStorage.getItem('highScores')) || {
        xox: [],
        snake: [],
        tetris: [],
        memory: [],
        pong: [],
        space: []
    };
}

function displayHighScores() {
    const scoresList = document.getElementById('scores-list');
    scoresList.innerHTML = '';

    const gameTypes = Object.keys(highScores);
    let allScores = [];

    // Tüm oyunların skorlarını birleştir
    gameTypes.forEach(gameType => {
        highScores[gameType].forEach((score, index) => {
            allScores.push({
                game: gameType,
                ...score,
                globalRank: allScores.length + 1
            });
        });
    });

    // Global sıralama
    allScores.sort((a, b) => b.score - a.score);

    // İlk 10 skoru göster
    allScores.slice(0, 10).forEach((score, index) => {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-item';
        scoreElement.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span class="name">${score.name}</span>
            <span class="game">${score.game.toUpperCase()}</span>
            <span class="score">${score.score}</span>
            <span class="date">${score.date}</span>
        `;
        scoresList.appendChild(scoreElement);
    });

    if (allScores.length === 0) {
        scoresList.innerHTML = '<p class="no-scores">Henüz skor kaydedilmemiş.</p>';
    }
}

// Uygulama başlatma
function initializeApp() {
    // İlk ekranı göster
    showMenu();

    // Klavye kontrolleri
    document.addEventListener('keydown', handleKeyPress);

    // Ekran geçiş animasyonları
    initScreenTransitions();
}

// Parçacık efekti
function initParticles() {
    const canvas = document.getElementById('particles-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Pencere boyutu değişiminde canvas'ı güncelle
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Ayarları kaydet
function saveSettings() {
    const soundEnabled = document.getElementById('sound-enabled');
    const musicEnabled = document.getElementById('music-enabled');
    const volume = document.getElementById('volume');
    
    if (soundEnabled && audioManager) {
        audioManager.setSoundEnabled(soundEnabled.checked);
    }
    
    if (musicEnabled && audioManager) {
        audioManager.setMusicEnabled(musicEnabled.checked);
    }
    
    if (volume && audioManager) {
        audioManager.setVolume(volume.value);
        const volumeValue = document.getElementById('volume-value');
        if (volumeValue) {
            volumeValue.textContent = volume.value;
        }
    }
    
    showNotification('Ayarlar kaydedildi!', 'success');
}

// Multiplayer oyunu sıfırla
function resetMultiplayerGame(gameType) {
    console.log('🔄 Multiplayer oyun sıfırlanıyor:', gameType);
    
    if (gameType === 'xox') {
        const board = document.getElementById('multiplayer-xox-board');
        if (board) {
            // Tüm hücreleri temizle
            const cells = board.querySelectorAll('.xox-cell');
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('filled', 'x', 'o');
            });
        }
        
        // Oyun durumunu güncelle
        const gameStatus = document.querySelector('.game-status');
        if (gameStatus) {
            gameStatus.textContent = 'Oyun sıfırlandı - Yeni oyun başlatın';
        }
        
        showNotification('Oyun sıfırlandı!', 'info');
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sayfa yüklendi - Element kontrolü başlıyor...');
    
    // Tüm elementleri kontrol et
    const elements = {
        'menu': document.getElementById('menu'),
        'high-scores': document.getElementById('high-scores'),
        'settings': document.getElementById('settings'),
        'multiplayer': document.getElementById('multiplayer'),
        'game-screen': document.getElementById('game-screen'),
        'game-canvas': document.getElementById('game-canvas'),
        'scores-list': document.getElementById('scores-list'),
        'sound-enabled': document.getElementById('sound-enabled'),
        'volume': document.getElementById('volume')
    };
    
    console.log('📋 Element kontrol sonuçları:');
    Object.keys(elements).forEach(id => {
        const element = elements[id];
        const exists = element !== null;
        const hasContent = exists ? element.innerHTML.length > 0 : false;
        console.log(`📍 ${id}: ${exists ? '✅' : '❌'} | Content: ${hasContent ? '✅' : '❌'} | Classes: ${exists ? element.className : 'N/A'}`);
        
        if (exists && id === 'game-canvas') {
            console.log('🎨 Canvas bilgileri:', {
                width: element.width,
                height: element.height,
                context: !!element.getContext
            });
        }
    });
    
    initializeApp();
    loadHighScores();
    initParticles();
    
    // WebSocket'i başlat (multiplayer.js varsa)
    if (typeof initWebSocket === 'function') {
        initWebSocket();
    }

    // Chat enter tuşu
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (typeof sendChatMessage === 'function') {
                    sendChatMessage();
                }
            }
        });
    }

    // Oda katılma butonları
    document.querySelectorAll('.join-room-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const roomId = this.dataset.room;
            if (typeof joinRoom === 'function') {
                joinRoom(roomId);
            }
        });
    });
});

// Global olarak fonksiyonları window objesine ata
window.showMenu = showMenu;
window.showHighScores = showHighScores;
window.showMultiplayer = showMultiplayer;
window.showSettings = showSettings;
window.startGame = startGame;
window.saveSettings = saveSettings;
window.pauseGame = pauseGame;
window.restartGame = restartGame;
window.quitGame = quitGame;
window.initializeApp = initializeApp;
window.loadHighScores = loadHighScores;
window.initParticles = initParticles;
window.initScreenTransitions = initScreenTransitions;
window.displayHighScores = displayHighScores;
window.handleKeyPress = handleKeyPress;
window.saveHighScore = saveHighScore;
window.showNotification = showNotification;
window.resetMultiplayerGame = resetMultiplayerGame;
