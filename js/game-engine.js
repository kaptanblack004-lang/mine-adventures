// ===== GAME ENGINE =====

/**
 * Oyun motoru
 */

class GameEngine {
    constructor() {
        this.isRunning = false;
        this.fps = 60;
        this.lastTime = 0;
        this.deltaTime = 0;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log('🎮 Game engine started');
    }

    stop() {
        this.isRunning = false;
        console.log('⏹️ Game engine stopped');
    }

    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Oyun mantığını buraya ekle
        this.update(this.deltaTime);
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // Delta time ile güncelleme mantığı
        // Buraya oyun güncellemeleri eklenebilir
    }
}

window.GameEngine = GameEngine;
