// ===== SAVE SYSTEM =====

/**
 * Kayıt sistemi
 */

class SaveManager {
    constructor() {
        this.saveKey = 'mine_adventure_save';
        this.highScoreKey = 'mine_adventure_high_score';
    }

    saveGame(gameState) {
        try {
            const saveData = {
                ...gameState,
                savedAt: Date.now(),
                version: '1.0.0'
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('💾 Game saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Save failed:', error);
            return false;
        }
    }

    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) return null;
            
            const parsed = JSON.parse(saveData);
            
            // Versiyon kontrolü
            if (parsed.version !== '1.0.0') {
                console.log('🔄 Save data version mismatch, starting new game');
                return null;
            }
            
            console.log('💾 Game loaded successfully');
            return parsed;
        } catch (error) {
            console.error('❌ Load failed:', error);
            return null;
        }
    }

    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('🗑️ Save deleted');
            return true;
        } catch (error) {
            console.error('❌ Delete failed:', error);
            return false;
        }
    }

    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    getSaveInfo() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) return null;
            
            const parsed = JSON.parse(saveData);
            return {
                savedAt: parsed.savedAt,
                currentChapter: parsed.currentChapter,
                score: parsed.score,
                crystals: parsed.crystals,
                gameStarted: parsed.gameStarted,
                gameCompleted: parsed.gameCompleted
            };
        } catch (error) {
            console.error('❌ Get save info failed:', error);
            return null;
        }
    }

    saveHighScore(score) {
        try {
            const currentHighScore = this.getHighScore();
            if (score > currentHighScore) {
                localStorage.setItem(this.highScoreKey, score.toString());
                console.log(`🏆 New high score: ${score}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ High score save failed:', error);
            return false;
        }
    }

    getHighScore() {
        try {
            const highScore = localStorage.getItem(this.highScoreKey);
            return highScore ? parseInt(highScore) : 0;
        } catch (error) {
            console.error('❌ Get high score failed:', error);
            return 0;
        }
    }

    clearAllData() {
        try {
            localStorage.removeItem(this.saveKey);
            localStorage.removeItem(this.highScoreKey);
            console.log('🗑️ All data cleared');
            return true;
        } catch (error) {
            console.error('❌ Clear data failed:', error);
            return false;
        }
    }
}

window.SaveManager = SaveManager;
