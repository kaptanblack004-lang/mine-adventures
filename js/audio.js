// ===== AUDIO MANAGER =====

/**
 * Ses yöneticisi
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.currentMusic = null;
        this.isMuted = false;
    }

    async init(settings = {}) {
        this.musicVolume = settings.musicVolume || 0.7;
        this.sfxVolume = settings.sfxVolume || 0.8;
        
        // Sesleri oluştur
        this.createSounds();
        
        console.log('🔊 Audio manager initialized');
    }

    createSounds() {
        // Buton sesi
        this.sounds.buttonClick = this.createOscillator(800, 0.1, 'square');
        
        // Seçim sesi
        this.sounds.choiceMade = this.createOscillator(600, 0.2, 'sine');
        
        // Başarı sesi
        this.sounds.success = this.createOscillator(1000, 0.3, 'sine');
        
        // Hata sesi
        this.sounds.error = this.createOscillator(300, 0.3, 'sawtooth');
        
        // Bölüm tamamlama
        this.sounds.chapterComplete = this.createOscillator(1200, 0.5, 'sine');
        
        // Oyun bitişi
        this.sounds.gameOver = this.createOscillator(200, 1.0, 'square');
    }

    createOscillator(frequency, duration, type = 'sine') {
        return () => {
            if (this.isMuted) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = type;
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.log('Audio not supported:', error);
            }
        };
    }

    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound();
        }
    }

    playMusic(trackName) {
        // Müzik çalma (basit implementasyon)
        this.currentMusic = trackName;
        console.log(`🎵 Playing music: ${trackName}`);
    }

    stopMusic() {
        this.currentMusic = null;
        console.log('🔇 Music stopped');
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}

window.AudioManager = AudioManager;
