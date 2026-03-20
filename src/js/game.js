// Minecraft Pro - Ana Oyun Motoru
class MinecraftGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.gameTime = 0;
        this.dayNightCycle = 0;
        this.currentFPS = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        
        // Oyun durumu
        this.gameState = {
            health: 100,
            hunger: 100,
            level: 1,
            experience: 0,
            score: 0
        };
        
        // Dünya ve oyuncu
        this.world = null;
        this.player = null;
        this.camera = { x: 0, y: 0, zoom: 1 };
        
        // Input yönetimi
        this.keys = {};
        this.mouse = { x: 0, y: 0, leftClick: false, rightClick: false };
        
        // Partikül sistemi
        this.particles = [];
        
        // Ses sistemi
        this.sounds = {
            break: null,
            place: null,
            walk: null,
            jump: null,
            background: null
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadAssets();
        this.initializeWorld();
        this.initializePlayer();
        
        console.log('Minecraft Pro başlatılıyor...');
    }
    
    setupCanvas() {
        // Canvas boyutunu ayarla
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Canvas ayarları
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.font = '16px Orbitron';
    }
    
    setupEventListeners() {
        // Klavye kontrolleri
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Özel tuşlar
            if (e.key === 'Escape') {
                this.toggleMenu();
            }
            if (e.key.toLowerCase() === 'e') {
                this.toggleInventory();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mouse kontrolleri
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouse.leftClick = true;
            if (e.button === 2) this.mouse.rightClick = true;
            this.handleMouseClick(e);
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.leftClick = false;
            if (e.button === 2) this.mouse.rightClick = false;
        });
        
        // Sağ klik menüsünü engelle
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Menu butonları
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.hideMenu();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveGame();
        });
        
        document.getElementById('loadBtn').addEventListener('click', () => {
            this.loadGame();
        });
        
        document.getElementById('exitBtn').addEventListener('click', () => {
            this.exitGame();
        });
    }
    
    loadAssets() {
        // Ses dosyalarını yükle
        this.sounds.break = new Audio('assets/sounds/break.mp3');
        this.sounds.place = new Audio('assets/sounds/place.mp3');
        this.sounds.walk = new Audio('assets/sounds/walk.mp3');
        this.sounds.jump = new Audio('assets/sounds/jump.mp3');
        this.sounds.background = new Audio('assets/music/background.mp3');
        
        // Arka plan müziğini ayarla
        this.sounds.background.loop = true;
        this.sounds.background.volume = 0.3;
    }
    
    initializeWorld() {
        // Dünya nesnesini oluştur
        this.world = new World(this);
        this.world.generate();
    }
    
    initializePlayer() {
        // Oyuncu nesnesini oluştur
        this.player = new Player(this, 0, 100);
    }
    
    start() {
        this.isRunning = true;
        this.hideLoadingScreen();
        this.gameLoop();
        
        // Arka plan müziğini başlat
        if (this.sounds.background) {
            this.sounds.background.play().catch(e => console.log('Müzik başlatılamadı:', e));
        }
        
        console.log('Oyun başladı!');
    }
    
    gameLoop(timestamp = 0) {
        if (!this.isRunning) return;
        
        // FPS hesapla
        this.frameCount++;
        if (timestamp - this.lastFPSUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = timestamp;
        }
        
        // Delta time hesapla
        const deltaTime = timestamp - this.gameTime;
        this.gameTime = timestamp;
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    update(deltaTime) {
        // Oyun zamanını güncelle
        this.updateGameTime(deltaTime);
        
        // Oyuncuyu güncelle
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Dünyayı güncelle
        if (this.world) {
            this.world.update(deltaTime);
        }
        
        // Partikülleri güncelle
        this.updateParticles(deltaTime);
        
        // UI güncelle
        this.updateUI();
        
        // Input sıfırla
        this.mouse.leftClick = false;
        this.mouse.rightClick = false;
    }
    
    updateGameTime(deltaTime) {
        // Gün/gece döngüsü
        this.dayNightCycle += deltaTime * 0.00001; // Yavaş döngü
        if (this.dayNightCycle > 1) {
            this.dayNightCycle = 0;
        }
        
        // UI zamanı güncelle
        const hours = Math.floor(this.dayNightCycle * 24);
        const minutes = Math.floor((this.dayNightCycle * 24 - hours) * 60);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const period = hours >= 6 && hours < 18 ? 'Gündüz' : 'Gece';
        document.getElementById('gameTime').textContent = `${period} ${timeString}`;
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
    }
    
    updateUI() {
        // İstatistikleri güncelle
        document.getElementById('health').textContent = this.gameState.health;
        document.getElementById('hunger').textContent = this.gameState.hunger;
        document.getElementById('level').textContent = this.gameState.level;
        
        // Koordinatları güncelle
        if (this.player) {
            document.getElementById('coordX').textContent = Math.floor(this.player.x);
            document.getElementById('coordY').textContent = Math.floor(this.player.y);
            document.getElementById('coordZ').textContent = Math.floor(this.player.z || 0);
        }
    }
    
    render() {
        // Canvas'ı temizle
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Gökyüzünü çiz
        this.renderSky();
        
        // Dünyayı çiz
        if (this.world) {
            this.world.render(this.ctx);
        }
        
        // Oyuncuyu çiz
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Partikülleri çiz
        this.renderParticles();
        
        // UI overlay'ı çiz
        this.renderOverlay();
    }
    
    renderSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        // Gün/geye göre gökyüzü rengi
        const brightness = Math.sin(this.dayNightCycle * Math.PI * 2) * 0.5 + 0.5;
        
        if (brightness > 0.3) {
            // Gündüz
            gradient.addColorStop(0, `rgba(135, 206, 235, ${brightness})`);
            gradient.addColorStop(0.5, `rgba(152, 216, 232, ${brightness})`);
            gradient.addColorStop(1, `rgba(124, 179, 66, ${brightness})`);
        } else {
            // Gece
            gradient.addColorStop(0, `rgba(25, 25, 112, ${1 - brightness})`);
            gradient.addColorStop(0.5, `rgba(0, 0, 50, ${1 - brightness})`);
            gradient.addColorStop(1, `rgba(0, 50, 0, ${1 - brightness})`);
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Güneş/ay çiz
        this.renderCelestialBody(brightness);
    }
    
    renderCelestialBody(brightness) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.3;
        const radius = 40;
        
        this.ctx.save();
        
        if (brightness > 0.3) {
            // Güneş
            this.ctx.fillStyle = `rgba(255, 223, 0, ${brightness})`;
            this.ctx.shadowColor = 'rgba(255, 223, 0, 0.8)';
            this.ctx.shadowBlur = 30;
        } else {
            // Ay
            this.ctx.fillStyle = `rgba(240, 240, 240, ${1 - brightness})`;
            this.ctx.shadowColor = 'rgba(240, 240, 240, 0.5)';
            this.ctx.shadowBlur = 20;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
    }
    
    renderOverlay() {
        // Crosshair
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 10, centerY);
        this.ctx.lineTo(centerX + 10, centerY);
        this.ctx.moveTo(centerX, centerY - 10);
        this.ctx.lineTo(centerX, centerY + 10);
        this.ctx.stroke();
    }
    
    handleMouseClick(e) {
        if (!this.player || !this.world) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Dünya koordinatlarına dönüştür
        const worldX = x + this.camera.x;
        const worldY = y + this.camera.y;
        
        if (e.button === 0) {
            // Sol klik - blok kır
            this.world.breakBlock(worldX, worldY);
            this.playSound('break');
        } else if (e.button === 2) {
            // Sağ klik - blok yerleştir
            const selectedSlot = this.getSelectedInventorySlot();
            if (selectedSlot) {
                this.world.placeBlock(worldX, worldY, selectedSlot.blockType);
                this.playSound('place');
            }
        }
    }
    
    getSelectedInventorySlot() {
        // Seçili envanter slotunu al
        const selectedSlot = document.querySelector('.inventory-slot.selected');
        if (!selectedSlot) return null;
        
        const icon = selectedSlot.querySelector('.item-icon');
        if (!icon) return null;
        
        // Emoji'den blok tipine dönüştür
        const blockMap = {
            '🪵': 'wood',
            '🪨': 'stone',
            '🌾': 'wheat',
            '🌳': 'leaves',
            '🟫': 'dirt',
            '⬜': 'snow'
        };
        
        const blockType = blockMap[icon.textContent];
        return blockType ? { blockType } : null;
    }
    
    addParticle(x, y, type) {
        const particle = new Particle(x, y, type);
        this.particles.push(particle);
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = 0.5;
            sound.play().catch(e => console.log('Ses çalınamadı:', e));
        }
    }
    
    toggleMenu() {
        const menu = document.getElementById('gameMenu');
        if (menu.style.display === 'none') {
            this.showMenu();
        } else {
            this.hideMenu();
        }
    }
    
    showMenu() {
        document.getElementById('gameMenu').style.display = 'flex';
        this.isPaused = true;
    }
    
    hideMenu() {
        document.getElementById('gameMenu').style.display = 'none';
        this.isPaused = false;
    }
    
    toggleInventory() {
        const inventory = document.getElementById('inventory');
        inventory.classList.toggle('hidden');
    }
    
    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'flex';
        }, 3000);
    }
    
    saveGame() {
        const saveData = {
            gameState: this.gameState,
            player: {
                x: this.player.x,
                y: this.player.y,
                z: this.player.z
            },
            world: this.world.getSaveData(),
            inventory: this.getInventoryData(),
            timestamp: Date.now()
        };
        
        localStorage.setItem('minecraftProSave', JSON.stringify(saveData));
        alert('Oyun kaydedildi!');
    }
    
    loadGame() {
        const saveData = localStorage.getItem('minecraftProSave');
        if (!saveData) {
            alert('Kayıtlı oyun bulunamadı!');
            return;
        }
        
        try {
            const data = JSON.parse(saveData);
            this.gameState = data.gameState;
            this.player.x = data.player.x;
            this.player.y = data.player.y;
            this.player.z = data.player.z;
            this.world.loadSaveData(data.world);
            this.loadInventoryData(data.inventory);
            
            alert('Oyun yüklendi!');
        } catch (e) {
            alert('Oyun yüklenirken hata oluştu!');
            console.error(e);
        }
    }
    
    getInventoryData() {
        const slots = document.querySelectorAll('.inventory-slot');
        const inventory = [];
        
        slots.forEach(slot => {
            const icon = slot.querySelector('.item-icon');
            const count = slot.querySelector('.item-count');
            
            inventory.push({
                icon: icon ? icon.textContent : null,
                count: count ? parseInt(count.textContent) : 0
            });
        });
        
        return inventory;
    }
    
    loadInventoryData(data) {
        const slots = document.querySelectorAll('.inventory-slot');
        
        data.forEach((item, index) => {
            if (slots[index]) {
                const icon = slots[index].querySelector('.item-icon');
                const count = slots[index].querySelector('.item-count');
                
                if (icon) icon.textContent = item.icon || '';
                if (count) count.textContent = item.count || 0;
            }
        });
    }
    
    exitGame() {
        if (confirm('Oyundan çıkmak istediğinizden emin misiniz?')) {
            this.isRunning = false;
            if (this.sounds.background) {
                this.sounds.background.pause();
            }
            alert('Oyun kapatıldı. Arkadaşına iyi eğlenceler!');
        }
    }
}

// Partikel sınıfı
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 4 + 2;
        
        // Partikel rengi
        const colors = {
            'break': '#8B4513',
            'place': '#90EE90',
            'walk': '#D2691E',
            'explosion': '#FF4500'
        };
        
        this.color = colors[type] || '#FFFFFF';
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Yerçekimi
        this.life -= this.decay;
        
        // Yere çarpma
        if (this.y > 500) {
            this.y = 500;
            this.vy *= -0.5;
            this.vx *= 0.8;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// Oyunu başlat
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new MinecraftGame();
    setTimeout(() => game.start(), 1000);
});
