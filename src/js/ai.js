// Kelime Savaşı - AI Sistemi
class WordBattleAI {
    constructor(game) {
        this.game = game;
        this.difficulty = 'medium'; // easy, medium, hard, expert
        this.personality = 'balanced'; // aggressive, defensive, balanced, creative
        this.responseTime = { min: 2000, max: 5000 };
        this.vocabulary = this.initializeVocabulary();
        this.patterns = this.initializePatterns();
        this.memory = {
            playerWords: [],
            usedWords: [],
            playerBehavior: {
                speed: 'medium',
                wordLength: 'medium',
                strategy: 'balanced'
            }
        };
        this.currentMood = 'focused'; // focused, relaxed, competitive, frustrated
        
        this.init();
    }
    
    init() {
        console.log('🤖 AI Sistemi başlatıldı');
        this.analyzePlayer();
    }
    
    initializeVocabulary() {
        return {
            easy: [
                'KEDI', 'KÖPEK', 'ARABA', 'EV', 'AĞAÇ', 'GÜNEŞ', 'AY', 'YILDIZ', 
                'SU', 'TOP', 'OYUN', 'KİTAP', 'KALEM', 'SANDALYE', 'MASA',
                'KAPI', 'PENCERE', 'ÇİÇEK', 'KUŞ', 'BALIK', 'MEYVE', 'SEBZE'
            ],
            medium: [
                'BİLGİSAYAR', 'TELEFON', 'TELEVİZYON', 'BUZDOLABI', 'ÇAMAŞIR MAKİNESİ',
                'ÜTÜ', 'SÜPÜRGE', 'LAMBADA', 'SAAK', 'DOLAP', 'YATAK', 'YASTIK',
                'BATTANİYE', 'HALI', 'PERDE', 'SİNHİYE', 'ANAHTAR', 'CÜZDAN'
            ],
            hard: [
                'FOTOĞRAF MAKİNESİ', 'KLİMATİZASYON', 'ISITICI', 'SOĞUTUCU', 'VENTİLATÖR',
                'ELEKTRONİK', 'MEKANİK', 'OTOMASYON', 'TEKNOLOJİ', 'BİLİŞSEL',
                'YAPAY ZEKA', 'MAKİNE ÖĞRENMESİ', 'DERİN ÖĞRENME', 'NÖRAL AĞ'
            ],
            expert: [
                'KUANTUM FİZİĞİ', 'GÖRELİLİK TEORİSİ', 'KARADİNALİTE', 'ENTROPİ',
                'TERMODİNAMİK', 'ELEKTROMANYETİZMA', 'PLAZMA FİZİĞİ', 'ASTROFİZİK',
                'KOZMOLOJİ', 'PARÇAK FİZİĞİ', 'SÜPER İLETKENLİK', 'NANO TEKNOLOJİ'
            ]
        };
    }
    
    initializePatterns() {
        return {
            prefixes: ['ÖN', 'ARA', 'SON', 'İLK', 'ORTA', 'ÜST', 'ALT'],
            suffixes: ['CIK', 'CI', 'MAK', 'LİK', 'SİZ', 'Lİ'],
            compounds: ['SÖZLÜK', 'KİTAPLIK', 'DEFTER', 'KALEMLİK', 'ÇANTASI'],
            categories: {
                teknoloji: ['YAZILIM', 'DONANIM', 'AĞ', 'VERİ', 'ALGORİTMA'],
                doğa: ['ORMAN', 'DENİZ', 'DAĞ', 'NEHR', 'GÖL'],
                sanat: ['RESİM', 'HEYKEL', 'MÜZİK', 'TİYATRO', 'FİLM'],
                bilim: ['DENey', 'TEORİ', 'FORMÜL', 'KANUN', 'İLKE']
            }
        };
    }
    
    // AI rakip oluştur
    createAIOpponent(name = 'AI Rakip', difficulty = 'medium') {
        const personalities = ['aggressive', 'defensive', 'balanced', 'creative'];
        const personality = personalities[Math.floor(Math.random() * personalities.length)];
        
        return {
            id: 'ai_' + Date.now(),
            name: name,
            difficulty: difficulty,
            personality: personality,
            avatar: this.getRandomAvatar(),
            stats: {
                wordsFound: 0,
                averageTime: 0,
                longestWord: 0,
                score: 0
            },
            mood: 'focused',
            responseTime: this.calculateResponseTime(difficulty)
        };
    }
    
    getRandomAvatar() {
        const avatars = ['🤖', '👾', '🎯', '🧠', '⚡', '🔥', '💎', '🌟'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }
    
    // Oyuncu davranışını analiz et
    analyzePlayer() {
        if (this.game.userData.stats.gamesPlayed > 0) {
            const avgWordsPerGame = this.game.userData.stats.wordsFound / this.game.userData.stats.gamesPlayed;
            
            if (avgWordsPerGame < 5) {
                this.memory.playerBehavior.speed = 'slow';
            } else if (avgWordsPerGame > 15) {
                this.memory.playerBehavior.speed = 'fast';
            } else {
                this.memory.playerBehavior.speed = 'medium';
            }
            
            // Kelime uzunluğu analizi
            if (this.memory.playerWords.length > 0) {
                const avgLength = this.memory.playerWords.reduce((sum, word) => sum + word.length, 0) / this.memory.playerWords.length;
                
                if (avgLength < 5) {
                    this.memory.playerBehavior.wordLength = 'short';
                } else if (avgLength > 8) {
                    this.memory.playerBehavior.wordLength = 'long';
                } else {
                    this.memory.playerBehavior.wordLength = 'medium';
                }
            }
            
            console.log('🧠 Oyuncu analizi:', this.memory.playerBehavior);
        }
    }
    
    // AI hamlesi hesapla
    calculateMove(availableLetters, timeLeft, currentScore) {
        const startTime = performance.now();
        
        // Zorluk seviyesine göre kelime bulma stratejisi
        let possibleWords = this.findPossibleWords(availableLetters);
        
        // Zorluk ayarı
        possibleWords = this.filterByDifficulty(possibleWords);
        
        // Kişilik tipine göre sıralama
        possibleWords = this.sortByPersonality(possibleWords);
        
        // Stratejik düşünme
        const move = this.strategicThinking(possibleWords, timeLeft, currentScore);
        
        // Hesaplama süresini logla
        const calculationTime = performance.now() - startTime;
        console.log(`🤖 AI hamlesi hesaplandı: ${move.word} (${calculationTime.toFixed(2)}ms)`);
        
        return move;
    }
    
    findPossibleWords(availableLetters) {
        const letterCount = {};
        availableLetters.forEach(letter => {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        });
        
        const possibleWords = [];
        
        // Tüm kelimeleri kontrol et
        Object.values(this.vocabulary).flat().forEach(word => {
            if (this.canFormWord(word, letterCount)) {
                possibleWords.push({
                    word: word,
                    length: word.length,
                    score: this.calculateWordScore(word),
                    difficulty: this.getWordDifficulty(word)
                });
            }
        });
        
        // Ek kelime kombinasyonları oluştur
        const combinations = this.generateWordCombinations(availableLetters);
        possibleWords.push(...combinations);
        
        return possibleWords;
    }
    
    canFormWord(word, availableLetters) {
        const requiredLetters = {};
        
        word.split('').forEach(letter => {
            requiredLetters[letter] = (requiredLetters[letter] || 0) + 1;
        });
        
        for (const [letter, count] of Object.entries(requiredLetters)) {
            if ((availableLetters[letter] || 0) < count) {
                return false;
            }
        }
        
        return true;
    }
    
    generateWordCombinations(letters) {
        const combinations = [];
        const letterSet = [...new Set(letters)];
        
        // 2-3 harfli kombinasyonlar
        for (let i = 0; i < letterSet.length; i++) {
            for (let j = i + 1; j < letterSet.length; j++) {
                const word2 = letterSet[i] + letterSet[j];
                if (this.isValidWord(word2)) {
                    combinations.push({
                        word: word2,
                        length: 2,
                        score: 20,
                        difficulty: 'easy'
                    });
                }
                
                for (let k = j + 1; k < letterSet.length; k++) {
                    const word3 = letterSet[i] + letterSet[j] + letterSet[k];
                    if (this.isValidWord(word3)) {
                        combinations.push({
                            word: word3,
                            length: 3,
                            score: 30,
                            difficulty: 'easy'
                        });
                    }
                }
            }
        }
        
        return combinations;
    }
    
    isValidWord(word) {
        // Basit kelime kontrolü (gerçek uygulamada sözlük API kullanılır)
        const commonWords = ['OYUN', 'TOP', 'GÜL', 'GÖZ', 'KOL', 'AYAK', 'EL', 'YÜZ', 'SÜT', 'EKMEK'];
        return commonWords.includes(word) || word.length >= 3;
    }
    
    filterByDifficulty(words) {
        const difficultyMultiplier = {
            easy: 1.0,
            medium: 0.7,
            hard: 0.4,
            expert: 0.2
        };
        
        const multiplier = difficultyMultiplier[this.difficulty];
        const filtered = [];
        
        words.forEach(word => {
            const random = Math.random();
            if (random < multiplier) {
                filtered.push(word);
            }
        });
        
        return filtered.length > 0 ? filtered : words.slice(0, 1);
    }
    
    sortByPersonality(words) {
        switch (this.personality) {
            case 'aggressive':
                // Daha uzun ve yüksek puanlı kelimeler tercih et
                return words.sort((a, b) => (b.score * b.length) - (a.score * a.length));
                
            case 'defensive':
                // Kısa ve hızlı kelimeler tercih et
                return words.sort((a, b) => a.length - b.length);
                
            case 'creative':
                // Nadir ve ilginç kelimeler tercih et
                return words.sort((a, b) => b.difficulty.localeCompare(a.difficulty));
                
            case 'balanced':
            default:
                // Dengeli yaklaşım
                return words.sort((a, b) => b.score - a.score);
        }
    }
    
    strategicThinking(words, timeLeft, currentScore) {
        // Durumsal strateji
        let selectedWord;
        
        if (timeLeft < 10) {
            // Son 10 saniye - hızlı kelime seç
            selectedWord = words.find(w => w.length <= 4) || words[0];
            this.currentMood = 'competitive';
        } else if (currentScore > this.getEstimatedAIScore()) {
            // Önde ol - risk al
            selectedWord = words[Math.floor(words.length * 0.7)];
            this.currentMood = 'relaxed';
        } else {
            // Geride ol - agresif ol
            selectedWord = words[0];
            this.currentMood = 'focused';
        }
        
        // AI'ın "düşünme" zamanı
        const thinkingTime = this.calculateThinkingTime(selectedWord);
        
        return {
            word: selectedWord.word,
            score: selectedWord.score,
            thinkingTime: thinkingTime,
            confidence: this.calculateConfidence(selectedWord),
            mood: this.currentMood
        };
    }
    
    calculateThinkingTime(word) {
        const baseTime = this.responseTime.min + Math.random() * (this.responseTime.max - this.responseTime.min);
        const difficultyMultiplier = word.length / 5;
        const moodMultiplier = this.currentMood === 'competitive' ? 0.7 : 1.0;
        
        return Math.floor(baseTime * difficultyMultiplier * moodMultiplier);
    }
    
    calculateConfidence(word) {
        let confidence = 0.5;
        
        // Kelime uzunluğuna göre güven
        if (word.length >= 5) confidence += 0.2;
        if (word.length >= 7) confidence += 0.2;
        
        // Puanına göre güven
        if (word.score >= 50) confidence += 0.1;
        
        // Zorluğuna göre güven
        if (word.difficulty === 'hard') confidence += 0.1;
        if (word.difficulty === 'expert') confidence += 0.2;
        
        return Math.min(confidence, 1.0);
    }
    
    getEstimatedAIScore() {
        // AI'ın tahmini skoru
        return this.game.gameState.score * (0.8 + Math.random() * 0.4);
    }
    
    // AI tepkileri
    generateReaction(wordFound, isCorrect) {
        const reactions = {
            correct: [
                'Harika kelime!', 'Bravo!', 'Mükemmel!', 'Aferin!', 'Süper!',
                'Zekice!', 'Harika!', 'Devam et!', 'İyi gidiyorsun!'
            ],
            incorrect: [
                'Denemeye devam!', 'Yakındır!', 'Tekrar dene!', 'Daha iyisi!',
                'Sabırlı ol!', 'Düşün!', 'Farklı bir şey dene!'
            ],
            thinking: [
                '🤔 Düşünüyorum...', '💡 Akıl yürütüyorum...', '🧠 Hesaplıyorum...',
                '⚡ Analiz ediyorum...', '🎯 Odaklanıyorum...'
            ]
        };
        
        let reaction;
        if (isCorrect) {
            reaction = reactions.correct[Math.floor(Math.random() * reactions.correct.length)];
        } else {
            reaction = reactions.incorrect[Math.floor(Math.random() * reactions.incorrect.length)];
        }
        
        return {
            text: reaction,
            emoji: this.getMoodEmoji(),
            timestamp: Date.now()
        };
    }
    
    getMoodEmoji() {
        const moodEmojis = {
            focused: '🎯',
            relaxed: '😌',
            competitive: '🔥',
            frustrated: '😤',
            thinking: '🤔'
        };
        
        return moodEmojis[this.currentMood] || '🤖';
    }
    
    // AI ipucu sistemi
    generateHint(availableLetters, difficulty = 'medium') {
        const hints = [];
        
        // Harf kombinasyonu ipuçları
        const commonPairs = this.findCommonPairs(availableLetters);
        hints.push(...commonPairs);
        
        // Kategori bazlı ipuçları
        const categoryHints = this.generateCategoryHints(availableLetters);
        hints.push(...categoryHints);
        
        // Zorluk seviyesine göre filtrele
        return hints.filter(hint => {
            if (difficulty === 'easy') return hint.difficulty === 'easy';
            if (difficulty === 'medium') return hint.difficulty !== 'expert';
            return true;
        });
    }
    
    findCommonPairs(letters) {
        const pairs = [];
        const letterSet = [...new Set(letters)];
        
        // Yaygın harf ikilileri
        const commonPairs = [
            { letters: ['A', 'R'], hint: 'AR kelimesiyle başlayabilirsiniz', difficulty: 'easy' },
            { letters: ['E', 'V'], hint: 'EV kelimesi deneyebilirsiniz', difficulty: 'easy' },
            { letters: ['K', 'İ'], hint: 'Kİ ile başlayan kelimeler var', difficulty: 'easy' },
            { letters: ['M', 'A'], hint: 'MA ile başlamayı deneyin', difficulty: 'easy' }
        ];
        
        commonPairs.forEach(pair => {
            if (letterSet.includes(pair.letters[0]) && letterSet.includes(pair.letters[1])) {
                pairs.push(pair);
            }
        });
        
        return pairs;
    }
    
    generateCategoryHints(letters) {
        const hints = [];
        
        Object.entries(this.patterns.categories).forEach(([category, words]) => {
            const matchingWords = words.filter(word => 
                word.split('').every(letter => letters.includes(letter))
            );
            
            if (matchingWords.length > 0) {
                hints.push({
                    category: category,
                    hint: `${category} kategorisinde ${matchingWords.length} kelime bulabilirsiniz`,
                    difficulty: 'medium',
                    examples: matchingWords.slice(0, 2)
                });
            }
        });
        
        return hints;
    }
    
    // AI öğrenme sistemi
    learnFromGame(gameData) {
        // Oyuncu stratejilerini öğren
        this.memory.playerWords.push(...gameData.playerWords);
        this.analyzePlayer();
        
        // AI zorluğunu ayarla
        this.adjustDifficulty(gameData);
        
        // Yeni kelimeler öğren
        this.expandVocabulary(gameData.foundWords);
        
        console.log('🧠 AI yeni stratejiler öğrendi');
    }
    
    adjustDifficulty(gameData) {
        const playerPerformance = gameData.playerScore / gameData.aiScore;
        
        if (playerPerformance > 1.5) {
            // Oyuncu çok iyi, zorluğu artır
            this.difficulty = Math.min(this.getNextDifficulty(this.difficulty), 'expert');
        } else if (playerPerformance < 0.7) {
            // Oyuncu zorlanıyor, zorluğu azalt
            this.difficulty = Math.max(this.getPreviousDifficulty(this.difficulty), 'easy');
        }
        
        console.log(`🎯 AI zorluğu ayarlandı: ${this.difficulty}`);
    }
    
    getNextDifficulty(current) {
        const difficulties = ['easy', 'medium', 'hard', 'expert'];
        const currentIndex = difficulties.indexOf(current);
        return difficulties[Math.min(currentIndex + 1, difficulties.length - 1)];
    }
    
    getPreviousDifficulty(current) {
        const difficulties = ['easy', 'medium', 'hard', 'expert'];
        const currentIndex = difficulties.indexOf(current);
        return difficulties[Math.max(currentIndex - 1, 0)];
    }
    
    expandVocabulary(newWords) {
        // Yeni kelimeleri vocab'e ekle
        newWords.forEach(word => {
            if (!this.vocabulary.medium.includes(word)) {
                this.vocabulary.medium.push(word);
            }
        });
    }
    
    // AI sohbet sistemi
    generateChatMessage(context) {
        const messages = {
            greeting: [
                'Oyun başladı, iyi şanslar! 🎯',
                'Hazırım, hadi başlayalım! ⚡',
                'Bugün kim kazanacak bakalım? 🤔',
                'İyi oyunlar! 🎮'
            ],
            goodMove: [
                'Zekice hamle! 🧠',
                'Harika kelime! 👏',
                'Devam et böyle! 🔥',
                'İyi gidiyorsun! 💯'
            ],
            behind: [
                'Hızlanmam gerek... ⚡',
                'Sıra bende! 🎯',
                'Yaklaşıyorum... 📈',
                'Dikkat etmeye başladım! 👀'
            ],
            ahead: [
                'Öndeyim, devam! 🏆',
                'Bu akış iyi gidiyor! 🌟',
                'Zirveye doğru! 🚀',
                'Harika strateji! 💡'
            ],
            gameOver: [
                'Harika oyun oldu! 🎮',
                'Tekrar oynayalım! 🔄',
                'Bir dahaki sefere! 👋',
                'İyi oyunlardı! 🎯'
            ]
        };
        
        const contextMessages = messages[context] || messages.greeting;
        return contextMessages[Math.floor(Math.random() * contextMessages.length)];
    }
    
    // AI performans metrikleri
    getPerformanceMetrics() {
        return {
            difficulty: this.difficulty,
            personality: this.personality,
            mood: this.currentMood,
            vocabularySize: Object.values(this.vocabulary).flat().length,
            gamesPlayed: this.memory.usedWords.length,
            averageResponseTime: (this.responseTime.min + this.responseTime.max) / 2,
            accuracy: this.calculateAccuracy(),
            adaptationLevel: this.getAdaptationLevel()
        };
    }
    
    calculateAccuracy() {
        // AI'ın kelime bulma doğruluğu
        const totalAttempts = this.memory.usedWords.length;
        const successfulAttempts = this.memory.usedWords.filter(word => 
            this.isValidWord(word)
        ).length;
        
        return totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
    }
    
    getAdaptationLevel() {
        // AI'ın oyuncuya adaptasyon seviyesi
        const behaviorScore = Object.values(this.memory.playerBehavior).filter(v => v !== 'medium').length;
        return Math.min(behaviorScore * 25, 100);
    }
    
    // AI ayarları
    updateSettings(settings) {
        if (settings.difficulty) this.difficulty = settings.difficulty;
        if (settings.personality) this.personality = settings.personality;
        if (settings.responseTime) {
            this.responseTime = { ...this.responseTime, ...settings.responseTime };
        }
        
        console.log('⚙️ AI ayarları güncellendi:', settings);
    }
    
    // AI reset
    reset() {
        this.memory.playerWords = [];
        this.memory.usedWords = [];
        this.currentMood = 'focused';
        console.log('🔄 AI sıfırlandı');
    }
}

// AI Yöneticisi
class AIManager {
    constructor(game) {
        this.game = game;
        this.ai = null;
        this.isAIEnabled = false;
        this.aiOpponents = [];
        this.currentAIGame = null;
        
        this.init();
    }
    
    init() {
        // AI sistemini başlat
        this.ai = new WordBattleAI(this.game);
        console.log('🤖 AI Yöneticisi başlatıldı');
    }
    
    // AI rakip ekle
    addAIOpponent(name = 'AI Rakip', difficulty = 'medium') {
        const opponent = this.ai.createAIOpponent(name, difficulty);
        this.aiOpponents.push(opponent);
        
        // Odaya ekle
        this.addAIToRoom(opponent);
        
        return opponent;
    }
    
    addAIToRoom(opponent) {
        // Odaya AI oyuncu ekle
        const playerSlots = document.querySelectorAll('.player-slot');
        const emptySlot = Array.from(playerSlots).find(slot => 
            slot.querySelector('.player-name').textContent === 'Bekleniyor...'
        );
        
        if (emptySlot) {
            emptySlot.querySelector('.player-name').textContent = opponent.name;
            emptySlot.querySelector('.player-avatar').textContent = opponent.avatar;
            emptySlot.classList.add('active', 'ai-player');
            
            // AI oyuncu verisi ekle
            emptySlot.dataset.aiId = opponent.id;
        }
    }
    
    // AI oyunu başlat
    startAIGame(difficulty = 'medium') {
        this.isAIEnabled = true;
        
        // AI rakipleri oluştur
        const aiCount = Math.floor(Math.random() * 2) + 1; // 1-2 AI
        
        for (let i = 0; i < aiCount; i++) {
            const aiNames = ['ZekaBot', 'KelimeUstası', 'HızlıGöz', 'BilgeAdam'];
            const aiName = aiNames[i] || `AI_${i + 1}`;
            this.addAIOpponent(aiName, difficulty);
        }
        
        // AI oyununu başlat
        this.currentAIGame = {
            id: 'ai_game_' + Date.now(),
            difficulty: difficulty,
            participants: this.aiOpponents.length + 1, // +1 oyuncu
            startTime: Date.now()
        };
        
        // AI hamlelerini başlat
        this.startAIMoves();
        
        console.log('🤖 AI oyunu başlatıldı:', this.currentAIGame);
    }
    
    startAIMoves() {
        if (!this.isAIEnabled) return;
        
        // Tüm AI oyuncular için hamle döngüsü
        this.aiOpponents.forEach(opponent => {
            this.scheduleAIMove(opponent);
        });
    }
    
    scheduleAIMove(opponent) {
        if (!this.game.gameState.isPlaying) return;
        
        // AI hamle zamanını hesapla
        const move = this.ai.calculateMove(
            this.game.gameState.availableLetters,
            this.game.gameState.timeLeft,
            opponent.stats.score
        );
        
        // Hamleyi planla
        setTimeout(() => {
            this.executeAIMove(opponent, move);
        }, move.thinkingTime);
    }
    
    executeAIMove(opponent, move) {
        if (!this.game.gameState.isPlaying) return;
        
        // AI hamlesini gerçekleştir
        console.log(`🤖 ${opponent.name} kelime buldu: ${move.word}`);
        
        // Kelimeyi ekle
        this.game.addFoundWord(move.word);
        
        // Skoru güncelle
        opponent.stats.score += move.score;
        opponent.stats.wordsFound++;
        opponent.stats.averageTime = move.thinkingTime;
        
        if (move.word.length > opponent.stats.longestWord) {
            opponent.stats.longestWord = move.word.length;
        }
        
        // AI tepkisi göster
        const reaction = this.ai.generateReaction(move.word, true);
        this.showAIReaction(opponent, reaction);
        
        // Sohbet mesajı gönder
        const chatMessage = this.ai.generateChatMessage('goodMove');
        this.game.addChatMessage(opponent.name, chatMessage);
        
        // Skor güncelle
        this.updateAIScore(opponent);
        
        // Sonraki hamleyi planla
        if (this.game.gameState.isPlaying) {
            this.scheduleAIMove(opponent);
        }
    }
    
    showAIReaction(opponent, reaction) {
        // AI tepkisini göster
        const notification = document.createElement('div');
        notification.className = 'ai-reaction';
        notification.innerHTML = `
            <div class="ai-avatar">${opponent.avatar}</div>
            <div class="ai-message">${reaction.text}</div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 2000;
            animation: aiReactionAnim 2s ease-out forwards;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    updateAIScore(opponent) {
        // AI skorunu güncelle
        const aiElements = document.querySelectorAll('.ai-player');
        aiElements.forEach(element => {
            if (element.dataset.aiId === opponent.id) {
                const scoreElement = element.querySelector('.player-score');
                if (scoreElement) {
                    scoreElement.textContent = opponent.stats.score;
                }
            }
        });
    }
    
    // AI ipucu sistemi
    requestAIHint() {
        if (!this.isAIEnabled) return null;
        
        const hints = this.ai.generateHint(
            this.game.gameState.availableLetters,
            this.ai.difficulty
        );
        
        if (hints.length > 0) {
            const hint = hints[0];
            this.showAIHint(hint);
            return hint;
        }
        
        return null;
    }
    
    showAIHint(hint) {
        const hintElement = document.createElement('div');
        hintElement.className = 'ai-hint';
        hintElement.innerHTML = `
            <div class="hint-header">💡 AI İpucu</div>
            <div class="hint-content">${hint.hint}</div>
            ${hint.examples ? `<div class="hint-examples">Örnek: ${hint.examples.join(', ')}</div>` : ''}
        `;
        
        hintElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            max-width: 400px;
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 15px 40px rgba(16, 185, 129, 0.3);
        `;
        
        document.body.appendChild(hintElement);
        
        // Otomatik kapanma
        setTimeout(() => {
            hintElement.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                hintElement.remove();
            }, 300);
        }, 5000);
        
        // Manuel kapanma
        hintElement.addEventListener('click', () => {
            hintElement.remove();
        });
    }
    
    // AI oyununu bitir
    endAIGame() {
        this.isAIEnabled = false;
        
        if (this.currentAIGame) {
            // AI performansını analiz et
            this.ai.learnFromGame({
                playerWords: this.game.gameState.foundWords,
                playerScore: this.game.gameState.score,
                aiScore: this.getHighestAIScore(),
                foundWords: this.game.gameState.foundWords
            });
            
            console.log('🤖 AI oyunu bitti');
        }
        
        // AI oyuncularını temizle
        this.cleanupAIOpponents();
    }
    
    getHighestAIScore() {
        return Math.max(...this.aiOpponents.map(ai => ai.stats.score), 0);
    }
    
    cleanupAIOpponents() {
        // AI oyuncularını odadan kaldır
        const aiElements = document.querySelectorAll('.ai-player');
        aiElements.forEach(element => {
            element.querySelector('.player-name').textContent = 'Bekleniyor...';
            element.querySelector('.player-avatar').textContent = '👤';
            element.classList.remove('active', 'ai-player');
            delete element.dataset.aiId;
        });
        
        this.aiOpponents = [];
        this.currentAIGame = null;
    }
    
    // AI ayarları
    updateAISettings(settings) {
        this.ai.updateSettings(settings);
        
        // Mevcut AI oyununu güncelle
        if (this.isAIEnabled) {
            this.aiOpponents.forEach(opponent => {
                if (settings.difficulty) {
                    opponent.difficulty = settings.difficulty;
                }
            });
        }
    }
    
    // AI istatistikleri
    getAIStats() {
        return {
            isEnabled: this.isAIEnabled,
            opponents: this.aiOpponents.length,
            currentGame: this.currentAIGame,
            performance: this.ai.getPerformanceMetrics()
        };
    }
}

// CSS animasyonları ekle
const aiStyles = document.createElement('style');
aiStyles.textContent = `
    @keyframes aiReactionAnim {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.8);
        }
        50% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1.1);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.9);
        }
    }
    
    .ai-reaction {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .ai-avatar {
        font-size: 1.5rem;
    }
    
    .ai-message {
        font-weight: 600;
    }
    
    .ai-hint {
        text-align: center;
    }
    
    .hint-header {
        font-weight: 700;
        margin-bottom: 10px;
        font-size: 1.1rem;
    }
    
    .hint-content {
        margin-bottom: 10px;
        line-height: 1.4;
    }
    
    .hint-examples {
        font-size: 0.9rem;
        opacity: 0.9;
        font-style: italic;
    }
    
    .ai-player {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
        border-color: #6366f1;
    }
    
    .ai-player .player-avatar {
        animation: aiPulse 2s infinite;
    }
    
    @keyframes aiPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(aiStyles);

// Global erişim
window.WordBattleAI = WordBattleAI;
window.AIManager = AIManager;
