// Efsanevi Mini Oyunlar - Ses Yönetimi
// Ses efektleri ve müzik sistemi

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        this.volume = parseFloat(localStorage.getItem('volume')) || 0.5;
        this.currentMusic = null;
        this.sounds = {};

        this.initAudio();
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            this.loadSounds();
        } catch (error) {
            console.warn('Web Audio API desteklenmiyor:', error);
        }
    }

    async loadSounds() {
        if (!this.isInitialized) return;

        // Basit ses efektleri oluştur (gerçek ses dosyaları yerine)
        this.sounds = {
            click: this.createTone(800, 0.1, 'square'),
            success: this.createTone(600, 0.3, 'sine'),
            fail: this.createTone(200, 0.5, 'sawtooth'),
            gameOver: this.createMelody([400, 300, 200], 0.5),
            levelUp: this.createMelody([500, 600, 700, 800], 0.3),
            shoot: this.createTone(1000, 0.05, 'square'),
            explosion: this.createNoise(0.2)
        };
    }

    createTone(frequency, duration, waveType = 'sine') {
        return { frequency, duration, waveType, type: 'tone' };
    }

    createMelody(frequencies, duration) {
        return { frequencies, duration, type: 'melody' };
    }

    createNoise(duration) {
        return { duration, type: 'noise' };
    }

    async playSound(soundName) {
        if (!this.isInitialized || !this.soundEnabled) return;

        const sound = this.sounds[soundName];
        if (!sound) return;

        try {
            if (sound.type === 'tone') {
                await this.playTone(sound.frequency, sound.duration, sound.waveType);
            } else if (sound.type === 'melody') {
                await this.playMelody(sound.frequencies, sound.duration);
            } else if (sound.type === 'noise') {
                await this.playNoise(sound.duration);
            }
        } catch (error) {
            console.warn('Ses çalınamadı:', error);
        }
    }

    async playTone(frequency, duration, waveType) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = waveType;

        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    async playMelody(frequencies, noteDuration) {
        for (let i = 0; i < frequencies.length; i++) {
            await this.playTone(frequencies[i], noteDuration * 0.8, 'sine');
            await this.delay(noteDuration * 0.2);
        }
    }

    async playNoise(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        source.start();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    playMusic() {
        if (!this.musicEnabled || this.currentMusic) return;

        // Basit müzik döngüsü oluştur
        this.currentMusic = setInterval(() => {
            if (this.musicEnabled) {
                this.playBackgroundMusic();
            }
        }, 4000); // Her 4 saniyede bir tekrar et
    }

    stopMusic() {
        if (this.currentMusic) {
            clearInterval(this.currentMusic);
            this.currentMusic = null;
        }
    }

    async playBackgroundMusic() {
        if (!this.isInitialized || !this.musicEnabled) return;

        const melody = [523, 587, 659, 698, 784, 880, 988, 1047]; // Do majör gamı
        const rhythm = [0.3, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.9];

        for (let i = 0; i < melody.length; i++) {
            if (!this.musicEnabled) break;
            await this.playTone(melody[i], rhythm[i] * 0.5, 'triangle');
            await this.delay(rhythm[i] * 500);
        }
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('soundEnabled', enabled);
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        localStorage.setItem('musicEnabled', enabled);

        if (enabled) {
            this.playMusic();
        } else {
            this.stopMusic();
        }
    }

    setVolume(volume) {
        this.volume = volume / 100;
        localStorage.setItem('volume', this.volume);
    }

    // Oyun ses efektleri
    playClick() { this.playSound('click'); }
    playSuccess() { this.playSound('success'); }
    playFail() { this.playSound('fail'); }
    playGameOver() { this.playSound('gameOver'); }
    playLevelUp() { this.playSound('levelUp'); }
    playShoot() { this.playSound('shoot'); }
    playExplosion() { this.playSound('explosion'); }
}

// Global ses yöneticisi
const audioManager = new AudioManager();

// Sayfa yüklendiğinde ses ayarlarını yükle
document.addEventListener('DOMContentLoaded', function() {
    // Ses ayarlarını UI'ya yansıt
    const soundCheckbox = document.getElementById('sound-enabled');
    const musicCheckbox = document.getElementById('music-enabled');
    const volumeSlider = document.getElementById('volume');
    const volumeValue = document.getElementById('volume-value');

    if (soundCheckbox) soundCheckbox.checked = audioManager.soundEnabled;
    if (musicCheckbox) musicCheckbox.checked = audioManager.musicEnabled;
    if (volumeSlider) volumeSlider.value = audioManager.volume * 100;
    if (volumeValue) volumeValue.textContent = Math.round(audioManager.volume * 100);

    // Müzik çalmaya başla (eğer etkinse)
    if (audioManager.musicEnabled) {
        audioManager.playMusic();
    }
});

// Ayarlar fonksiyonları
function saveSettings() {
    const soundEnabled = document.getElementById('sound-enabled').checked;
    const musicEnabled = document.getElementById('music-enabled').checked;
    const volume = document.getElementById('volume').value;

    audioManager.setSoundEnabled(soundEnabled);
    audioManager.setMusicEnabled(musicEnabled);
    audioManager.setVolume(volume);

    document.getElementById('volume-value').textContent = volume;

    // Başarı sesi çal
    audioManager.playSuccess();

    alert('Ayarlar kaydedildi!');
}

// Ses efektlerini oyunlara bağla
function addSoundEffects() {
    // Buton tıklamaları için ses efekti
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => audioManager.playClick());
    });

    // Oyun kartları için ses efekti
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => audioManager.playClick());
    });
}

// Sayfa yüklendiğinde ses efektlerini ekle
document.addEventListener('DOMContentLoaded', addSoundEffects);