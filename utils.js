// ===== UTILITIES =====

/**
 * Yardımcı fonksiyonlar
 */

class Utils {
    // Rastgele sayı üret
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Element seç
    static select(selector) {
        return document.querySelector(selector);
    }

    // Elementleri seç
    static selectAll(selector) {
        return document.querySelectorAll(selector);
    }

    // Element oluştur
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    // Local storage
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Local storage save error:', error);
            return false;
        }
    }

    static loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Local storage load error:', error);
            return null;
        }
    }

    // Zaman formatla
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Gecikme
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.Utils = Utils;
