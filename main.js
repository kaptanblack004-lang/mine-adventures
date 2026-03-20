// Ana Oyun Kontrolörü
class GameEngine {
    constructor() {
        this.currentChapter = 1;
        this.currentScreen = 'intro-screen';
        this.playerData = {
            health: 100,
            score: 0,
            crystals: 0,
            inventory: [],
            unlockedChapters: [1],
            currentRegion: 'kale'
        };
        this.gameState = 'playing';
        this.musicEnabled = true;
        this.soundEnabled = true;
        
        this.init();
    }

    init() {
        this.loadGameData();
        this.setupEventListeners();
        this.initializeAudio();
        this.showScreen('intro-screen');
    }

    setupEventListeners() {
        // Klavye kontrolleri
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Ses kontrolleri
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseMusic();
            } else {
                this.resumeMusic();
            }
        });
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'Escape':
                this.closeAllModals();
                break;
            case 'i':
            case 'I':
                this.toggleInventory();
                break;
            case 'm':
            case 'M':
                this.toggleMap();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
        }
    }

    initializeAudio() {
        this.bgMusic = document.getElementById('bg-music');
        this.clickSound = document.getElementById('click-sound');
        this.successSound = document.getElementById('success-sound');
        
        if (this.musicEnabled && this.bgMusic) {
            this.bgMusic.volume = 0.3;
            this.bgMusic.play().catch(e => console.log('Müzik başlatılamadı:', e));
        }
    }

    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        const sound = document.getElementById(soundName);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Ses çalınamadı:', e));
        }
    }

    // Ekran Yönetimi
    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            this.playSound('click-sound');
        }
    }

    // Bölüm Yönetimi
    loadChapter(chapterNumber) {
        if (!this.playerData.unlockedChapters.includes(chapterNumber)) {
            this.showMessage('Bu bölüm henüz kilitli! Önce önceki bölümleri tamamla.');
            return;
        }

        this.currentChapter = chapterNumber;
        this.showScreen('game-screen');
        this.loadChapterContent(chapterNumber);
        this.updateUI();
        this.playSound('success-sound');
    }

    loadChapterContent(chapterNumber) {
        const chapterData = this.getChapterData(chapterNumber);
        if (chapterData) {
            this.displayStory(chapterData.story);
            this.displayChoices(chapterData.choices);
            this.updateProgressBar(chapterData.progress);
        }
    }

    getChapterData(chapterNumber) {
        const chapters = {
            1: {
                title: "Kristal Kale'nin Sırrı",
                story: "Prenses Mine, büyülü Kristal Kale'de uyanır. Kale'nin koruyucu kristalleri kaybolmuş ve krallık karanlığa gömülmüştür. Mine, kayıp kristalleri bulmak için tehlikeli bir maceraya atılmaya karar verir.",
                choices: [
                    { text: "Kale'nin kütüphanesini ara", action: "search_library" },
                    { text: "Bilge büyücüye git", action: "visit_wizard" },
                    { text: "Kale'nin zindine in", action: "explore_dungeon" }
                ],
                progress: 15
            },
            2: {
                title: "Gizemli Orman",
                story: "Mine, Kristal Kale'den ayrılıp Gizemli Orman'a ulaşır. Orman, kayıp kristallerden birinin burada olduğunu fısıldayan eski ruhlarla doludur. Yol ayrımında üç farklı patika belirir.",
                choices: [
                    { text: "Işık patikasını takip et", action: "light_path" },
                    { text: "Göl patikasından git", action: "lake_path" },
                    { text: "Karanlık mağaraya gir", action: "dark_cave" }
                ],
                progress: 30
            },
            3: {
                title: "Kaybolmuş Anahtarlar",
                story: "Ormanın derinliklerinde Mine, üç kayıp anahtar bulur. Bu anahtarlar, kristallerin saklandığı yerleri açabilir. Her anahtar farklı bir kapıya açılır.",
                choices: [
                    { text: "Altın anahtarı kullan", action: "golden_key" },
                    { text: "Gümüş anahtarı dene", action: "silver_key" },
                    { text: "Bronz anahtarı seç", action: "bronze_key" }
                ],
                progress: 45
            },
            4: {
                title: "Ejderhanın Yolu",
                story: "Mine, ejderhanın yaşadığı dağa ulaşır. Ejderha, kristallerden birini korumaktadır ama yardıma ihtiyacı vardır. Mine, ejderhanın sırrını çözmeli.",
                choices: [
                    { text: "Ejderhayla dost ol", action: "befriend_dragon" },
                    { text: "Ejderhayla savaş", action: "fight_dragon" },
                    { text: "Ejderhanın sırrını öğren", action: "learn_secret" }
                ],
                progress: 60
            },
            5: {
                title: "Sihirli Kristaller",
                story: "Son kristal, sihirli gölün dibindedir. Mine, gölün koruyucu ruhlarıyla yüzleşmeli ve kristali kazanmak için üç deneme geçmelidir.",
                choices: [
                    { text: "Cesaret denemesini yap", action: "courage_trial" },
                    { text: "Bilgelik denemesini seç", action: "wisdom_trial" },
                    { text: "Sevgi denemesini dene", action: "love_trial" }
                ],
                progress: 80
            },
            6: {
                title: "Final: Taç Giyme",
                story: "Mine tüm kristalleri topladı! Şimdi krallığa geri dönüp taç giymesi gerekiyor. Ama son bir sınav daha var: gerçek bir lider olup olamadığı test edilecek.",
                choices: [
                    { text: "Adaletle yönet", action: "rule_justice" },
                    { text: "Sevgiyle yönet", action: "rule_love" },
                    { text: "Bilgelikle yönet", action: "rule_wisdom" }
                ],
                progress: 100
            }
        };
        
        return chapters[chapterNumber];
    }

    displayStory(storyText) {
        const storyTitle = document.getElementById('story-title');
        const storyTextElement = document.getElementById('story-text');
        
        if (storyTitle) {
            const chapterData = this.getChapterData(this.currentChapter);
            storyTitle.textContent = chapterData.title;
        }
        
        if (storyTextElement) {
            storyTextElement.textContent = storyText;
            storyTextElement.classList.add('fade-in');
        }
    }

    displayChoices(choices) {
        const choicesArea = document.getElementById('choices-area');
        if (!choicesArea) return;
        
        choicesArea.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.onclick = () => this.makeChoice(choice.action);
            button.style.animationDelay = `${index * 0.1}s`;
            button.classList.add('slide-in');
            choicesArea.appendChild(button);
        });
    }

    makeChoice(choiceAction) {
        this.playSound('click-sound');
        
        // Seçim sonucunu işle
        const result = this.processChoice(choiceAction);
        
        if (result.success) {
            this.playerData.score += result.points;
            this.showMessage(result.message, 'success');
            
            if (result.unlocksNextChapter) {
                this.unlockNextChapter();
            }
            
            if (result.miniGame) {
                this.startMiniGame(result.miniGame);
            } else {
                this.continueStory(result.nextChapter);
            }
        } else {
            this.playerData.health -= result.damage;
            this.showMessage(result.message, 'error');
            
            if (this.playerData.health <= 0) {
                this.gameOver();
            }
        }
        
        this.updateUI();
    }

    processChoice(choiceAction) {
        const choices = {
            search_library: {
                success: true,
                points: 10,
                message: "Kütüphanede eski bir harita buldun! +10 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "map_fragment"
            },
            visit_wizard: {
                success: true,
                points: 15,
                message: "Büyücü sana sihirli bir gave verdi! +15 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "magic_potion"
            },
            explore_dungeon: {
                success: true,
                points: 20,
                message: "Zindende ilk kristali buldun! +20 puan, Bölüm 2 açıldı!",
                unlocksNextChapter: true,
                nextChapter: 2,
                reward: "crystal_fragment"
            },
            open_door: {
                success: true,
                points: 25,
                message: "Kapıyı açarken tuzağa rastladın ama kristal buldun! +25 puan",
                damage: 5,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "crystal_shard"
            },
            listen_door: {
                success: true,
                points: 18,
                message: "Kapının arkasındaki sırrı öğrendin! +18 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "secret_knowledge"
            },
            continue_forward: {
                success: true,
                points: 12,
                message: "Güvenli bir seçim yaptın! +12 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "safety_charm"
            },
            touch_orb: {
                success: true,
                points: 30,
                message: "Küreden geleceğe dair görüntüler gördün! +30 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "vision_crystal"
            },
            ask_help: {
                success: true,
                points: 22,
                message: "Büyücüden güçlü bir iksir aldın! +22 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "healing_potion"
            },
            go_alone: {
                success: true,
                points: 28,
                message: "Cesaretin büyücüden bereket aldı! +28 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "courage_blessing"
            },
            light_path: {
                success: true,
                points: 35,
                message: "Işık yolu seni parlak bir kristale götürdü! +35 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "light_crystal"
            },
            lake_path: {
                success: true,
                points: 40,
                message: "Göl yolu tehlikeliydi ama ödüllendiriciydi! +40 puan",
                damage: 8,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "water_crystal"
            },
            dark_cave: {
                success: true,
                points: 45,
                message: "Mağara korkutucuydu ama değerli bir şey buldun! +45 puan",
                damage: 12,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "shadow_crystal"
            },
            courage_trial: {
                success: true,
                points: 50,
                message: "Cesaret denemesini geçtin! +50 puan",
                damage: 15,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "courage_gem"
            },
            wisdom_trial: {
                success: true,
                points: 45,
                message: "Bilgelik denemesini kolaylıkla geçtin! +45 puan",
                damage: 0,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "wisdom_gem"
            },
            love_trial: {
                success: true,
                points: 48,
                message: "Sevgi denemesi kalbini güçlendirdi! +48 puan",
                damage: 0,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "love_gem"
            },
            golden_key: {
                success: true,
                points: 38,
                message: "Altın anahtar hazinenin kapısını açtı! +38 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "treasure_chest"
            },
            silver_key: {
                success: true,
                points: 42,
                message: "Gümüş anahtar saflık kristalini ortaya çıkardı! +42 puan",
                damage: 3,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "purity_crystal"
            },
            bronze_key: {
                success: true,
                points: 35,
                message: "Bronz anahtar eski bilgileri açığa çıkardı! +35 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "ancient_scroll"
            },
            befriend_dragon: {
                success: true,
                points: 60,
                message: "Ejderha senin dostun oldu! +60 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "dragon_friendship"
            },
            fight_dragon: {
                success: true,
                points: 55,
                message: "Ejderha ile savaşarak kristal kazandın! +55 puan",
                damage: 20,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "dragon_scale"
            },
            learn_secret: {
                success: true,
                points: 52,
                message: "Ejderhanın sırrını öğrendin! +52 puan",
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "dragon_secret"
            },
            choose_courage: {
                success: true,
                points: 65,
                message: "Cesaretin son kristali kazandırdı! +65 puan",
                damage: 18,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "final_crystal"
            },
            choose_wisdom: {
                success: true,
                points: 70,
                message: "Bilgelikle kristalı kolayca kazandın! +70 puan",
                damage: 0,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "final_crystal"
            },
            choose_love: {
                success: true,
                points: 68,
                message: "Sevgin kristalı sana hediye etti! +68 puan",
                damage: 0,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "final_crystal"
            },
            rule_justice: {
                success: true,
                points: 80,
                message: "Adaletle yöneteceksin! +80 puan, oyun tamamlandı!",
                damage: 0,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "justice_crown"
            },
            rule_love: {
                success: true,
                points: 85,
                message: "Sevgiyle yöneteceksin! +85 puan, oyun tamamlandı!",
                damage: 0,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "love_crown"
            },
            rule_wisdom: {
                success: true,
                points: 90,
                message: "Bilgelikle yöneteceksin! +90 puan, oyun tamamlandı!",
                damage: 0,
                unlocksNextChapter: false,
                nextChapter: null,
                reward: "wisdom_crown"
            }
        };
        
        const result = choices[choiceAction] || {
            success: true,
            points: 5,
            message: "Bu seçim ilginçti! +5 puan",
            damage: 0,
            unlocksNextChapter: false,
            nextChapter: null,
            reward: "small_gem"
        };
        
        // Ödülü envantere ekle
        if (result.reward && result.success) {
            this.playerData.inventory.push({
                name: result.reward,
                icon: this.getItemIcon(result.reward),
                description: this.getItemDescription(result.reward)
            });
        }
        
        return result;
    }

    getItemIcon(itemName) {
        const icons = {
            map_fragment: "🗺️",
            magic_potion: "🧪",
            crystal_fragment: "💎",
            crystal_shard: "💠",
            secret_knowledge: "📜",
            safety_charm: "🛡️",
            vision_crystal: "🔮",
            healing_potion: "💚",
            courage_blessing: "✨",
            light_crystal: "💡",
            water_crystal: "💧",
            shadow_crystal: "🌑",
            courage_gem: "💪",
            wisdom_gem: "🧠",
            love_gem: "❤️",
            treasure_chest: "📦",
            purity_crystal: "🤍",
            ancient_scroll: "📜",
            dragon_friendship: "🐉",
            dragon_scale: "🐲",
            dragon_secret: "🤫",
            final_crystal: "👑",
            justice_crown: "⚖️",
            love_crown: "👸",
            wisdom_crown: "👑",
            small_gem: "💎"
        };
        return icons[itemName] || "🎁";
    }

    getItemDescription(itemName) {
        const descriptions = {
            map_fragment: "Eski bir harita parçası",
            magic_potion: "Büyücüden gelen sihirli iksir",
            crystal_fragment: "Kristalin bir parçası",
            crystal_shard: "Kristal kırıntısı",
            secret_knowledge: "Gizli bilgi",
            safety_charm: "Koruyucu tılsım",
            vision_crystal: "Geleceği gösteren kristal",
            healing_potion: "İyileştirici iksir",
            courage_blessing: "Cesaret bereketi",
            light_crystal: "Işık kristali",
            water_crystal: "Su kristali",
            shadow_crystal: "Gölge kristali",
            courage_gem: "Cesaret taşı",
            wisdom_gem: "Bilgelik taşı",
            love_gem: "Sevgi taşı",
            treasure_chest: "Define sandığı",
            purity_crystal: "Saflık kristali",
            ancient_scroll: "Eski parşömen",
            dragon_friendship: "Ejderha dostluğu",
            dragon_scale: "Ejderha pulu",
            dragon_secret: "Ejderhanın sırrı",
            final_crystal: "Son kristal",
            justice_crown: "Adalet tacı",
            love_crown: "Sevgi tacı",
            wisdom_crown: "Bilgelik tacı",
            small_gem: "Küçük kristal"
        };
        return descriptions[itemName] || "Gizemli eşya";
    }

    startMiniGame(gameType) {
        this.showScreen('mini-game');
        // Mini oyun başlatma mantığı
        console.log(`Mini oyun başlatılıyor: ${gameType}`);
    }

    continueStory(nextChapter) {
        if (nextChapter) {
            this.loadChapter(nextChapter);
        } else {
            // Mevcut bölümü devam ettir
            this.showMessage("Hikaye devam ediyor...", 'info');
        }
    }

    unlockNextChapter() {
        const nextChapter = this.currentChapter + 1;
        if (nextChapter <= 6 && !this.playerData.unlockedChapters.includes(nextChapter)) {
            this.playerData.unlockedChapters.push(nextChapter);
            this.updateChapterCards();
            this.showMessage(`Bölüm ${nextChapter} açıldı!`, 'success');
            this.playSound('success-sound');
        }
    }

    updateChapterCards() {
        const chapterCards = document.querySelectorAll('.chapter-card');
        this.playerData.unlockedChapters.forEach(chapterNum => {
            if (chapterCards[chapterNum - 1]) {
                const status = chapterCards[chapterNum - 1].querySelector('.chapter-status');
                if (status) {
                    status.textContent = '✅ Açık';
                    status.className = 'chapter-status unlocked';
                }
            }
        });
    }

    // UI Güncelleme
    updateUI() {
        this.updatePlayerStats();
        this.updateProgressBar();
        this.updateChapterCards();
    }

    updatePlayerStats() {
        const healthElement = document.getElementById('health');
        const scoreElement = document.getElementById('score');
        const crystalsElement = document.getElementById('crystals');
        
        if (healthElement) healthElement.textContent = this.playerData.health;
        if (scoreElement) scoreElement.textContent = this.playerData.score;
        if (crystalsElement) crystalsElement.textContent = this.playerData.crystals;
    }

    updateProgressBar(progressPercent) {
        const progressBar = document.getElementById('progress');
        if (progressBar) {
            progressBar.style.width = `${progressPercent}%`;
        }
    }

    // Modal Yönetimi
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.playSound('click-sound');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            this.playSound('click-sound');
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.remove('active'));
    }

    toggleInventory() {
        const inventory = document.getElementById('inventory');
        if (inventory) {
            if (inventory.classList.contains('active')) {
                this.closeModal('inventory');
            } else {
                this.showModal('inventory');
                this.updateInventoryDisplay();
            }
        }
    }

    toggleMap() {
        const map = document.getElementById('map');
        if (map) {
            if (map.classList.contains('active')) {
                this.closeModal('map');
            } else {
                this.showModal('map');
                this.updateMapDisplay();
            }
        }
    }

    updateInventoryDisplay() {
        const inventoryGrid = document.getElementById('inventory-grid');
        if (!inventoryGrid) return;
        
        inventoryGrid.innerHTML = '';
        
        // Varsayılan item'lar
        const defaultItems = [
            { icon: '🗡️', name: 'Kılıç' },
            { icon: '🛡️', name: 'Kalkan' },
            { icon: '🧪', name: 'İksir' }
        ];
        
        [...defaultItems, ...this.playerData.inventory].forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
            `;
            inventoryGrid.appendChild(itemElement);
        });
    }

    updateMapDisplay() {
        const regions = document.querySelectorAll('.map-region');
        regions.forEach(region => {
            const regionName = region.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (this.playerData.unlockedRegions && this.playerData.unlockedRegions.includes(regionName)) {
                region.classList.remove('locked');
            }
        });
    }

    // Oyun Durumu Yönetimi
    pauseGame() {
        this.gameState = 'paused';
        this.pauseMusic();
        this.showMessage('Oyun durduruldu', 'info');
    }

    resumeGame() {
        this.gameState = 'playing';
        this.resumeMusic();
        this.showMessage('Oyun devam ediyor', 'info');
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    }

    gameOver() {
        this.gameState = 'gameover';
        this.showMessage('Oyun bitti! Tekrar denemek ister misin?', 'error');
        setTimeout(() => {
            this.resetGame();
        }, 3000);
    }

    resetGame() {
        this.playerData = {
            health: 100,
            score: 0,
            crystals: 0,
            inventory: [],
            unlockedChapters: [1],
            currentRegion: 'kale'
        };
        this.currentChapter = 1;
        this.showScreen('intro-screen');
        this.updateUI();
    }

    // Mesaj Sistemi
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `game-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 25px;
            z-index: 10000;
            animation: slideDown 0.5s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Müzik Yönetimi
    pauseMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    }

    resumeMusic() {
        if (this.bgMusic && this.musicEnabled) {
            this.bgMusic.play().catch(e => console.log('Müzik devam ettirilemedi:', e));
        }
    }

    // Veri Yönetimi
    saveGameData() {
        const gameData = {
            playerData: this.playerData,
            currentChapter: this.currentChapter,
            settings: {
                musicEnabled: this.musicEnabled,
                soundEnabled: this.soundEnabled
            }
        };
        localStorage.setItem('mine_hikaye_save', JSON.stringify(gameData));
    }

    loadGameData() {
        const savedData = localStorage.getItem('mine_hikaye_save');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.playerData = gameData.playerData || this.playerData;
            this.currentChapter = gameData.currentChapter || 1;
            
            if (gameData.settings) {
                this.musicEnabled = gameData.settings.musicEnabled;
                this.soundEnabled = gameData.settings.soundEnabled;
            }
        }
    }
}

// Global fonksiyonlar
let gameEngine;

function startAdventure() {
    gameEngine.showScreen('chapter-select');
}

function loadChapter(chapterNumber) {
    gameEngine.loadChapter(chapterNumber);
}

function makeChoice(choiceAction) {
    gameEngine.makeChoice(choiceAction);
}

function pauseGame() {
    gameEngine.pauseGame();
}

function showInventory() {
    gameEngine.toggleInventory();
}

function showMap() {
    gameEngine.toggleMap();
}

function showScreen(screenId) {
    gameEngine.showScreen(screenId);
}

function closeMiniGame() {
    gameEngine.showScreen('game-screen');
}

function closeModal(modalId) {
    gameEngine.closeModal(modalId);
}

function travelToRegion(region) {
    gameEngine.playerData.currentRegion = region;
    gameEngine.showMessage(`${region} bölgesine seyahat ediliyor...`, 'info');
    gameEngine.closeModal('map');
}

// Oyun başlatma
document.addEventListener('DOMContentLoaded', () => {
    gameEngine = new GameEngine();
});

// CSS animasyonu ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
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
