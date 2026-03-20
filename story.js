// Hikaye Yönetimi
class StoryManager {
    constructor() {
        this.currentScene = 0;
        this.storyProgress = [];
        this.choices = [];
        this.narrator = new Narrator();
    }

    // Bölüm hikayeleri
    getChapterStories() {
        return {
            1: {
                title: "Kristal Kale'nin Sırrı",
                scenes: [
                    {
                        text: "Prenses Mine, uyanırken kendini Kristal Kale'nin en yüksek kulesinde bulur. Pencerelerden sızan ay ışığı, duvarlardaki eski freskoları aydınlatır. Ama bir şeyler yanlıştır - kale normalden çok daha karanlıktır.",
                        choices: [
                            { text: "Hemen kaleyi ara", action: "explore_castle", requirement: null },
                            { text: "Bilge büyücünün yanına git", action: "visit_wizard", requirement: null },
                            { text: "Kütüphanede araştırma yap", action: "research_library", requirement: null }
                        ],
                        consequences: {
                            explore_castle: { nextScene: 1, reward: "knowledge", damage: 0 },
                            visit_wizard: { nextScene: 2, reward: "magic_item", damage: 0 },
                            research_library: { nextScene: 3, reward: "clue", damage: 0 }
                        }
                    },
                    {
                        text: "Mine kale koridorlarında yürürken duvarlardaki kristallerin söndüğünü fark eder. Her adımında, kale'nin eski ruhlarının fısıltılarını duyar. Aniden karşısına gizemli bir kapı çıkar.",
                        choices: [
                            { text: "Kapıyı aç", action: "open_door", requirement: "courage" },
                            { text: "Kapıyı dinle", action: "listen_door", requirement: "wisdom" },
                            { text: "Kapıyı atla", action: "skip_door", requirement: null }
                        ],
                        consequences: {
                            open_door: { nextScene: 4, reward: "crystal_fragment", damage: 5 },
                            listen_door: { nextScene: 5, reward: "information", damage: 0 },
                            skip_door: { nextScene: 6, reward: "nothing", damage: 0 }
                        }
                    },
                    {
                        text: "Bilge büyücü Elara, Mine'i kuledeki çalışma odasında bekler. 'Prensesim,' der, 'Kristallerin gücü azalıyor. Sadece sen geri getirebilirsin onları.' Masadaki sihirli küre parlar.",
                        choices: [
                            { text: "Sihirli küreye dokun", action: "touch_orb", requirement: "magic" },
                            { text: "Büyücüden yardım iste", action: "ask_help", requirement: null },
                            { text: "Tek başına gitmeye karar ver", action: "go_alone", requirement: "courage" }
                        ],
                        consequences: {
                            touch_orb: { nextScene: 7, reward: "vision", damage: 0 },
                            ask_help: { nextScene: 8, reward: "potion", damage: 0 },
                            go_alone: { nextScene: 9, reward: "blessing", damage: 0 }
                        }
                    }
                ]
            },
            2: {
                title: "Gizemli Orman",
                scenes: [
                    {
                        text: "Mine, Kristal Kale'den ayrılıp Gizemli Orman'a ulaşır. Orman, binlerce yıldır yaşayan ağaçlarla doludur. Her yaprak, kayıp kristallerden birinin nerede olduğunu fısıldar gibi görünmektedir.",
                        choices: [
                            { text: "Işık patikasını takip et", action: "light_path", requirement: "hope" },
                            { text: "Göl patikasından git", action: "lake_path", requirement: "curiosity" },
                            { text: "Karanlık mağaraya gir", action: "dark_cave", requirement: "bravery" }
                        ],
                        consequences: {
                            light_path: { nextScene: 1, reward: "light_crystal", damage: 0 },
                            lake_path: { nextScene: 2, reward: "water_crystal", damage: 10 },
                            dark_cave: { nextScene: 3, reward: "shadow_crystal", damage: 15 }
                        }
                    },
                    {
                        text: "Ormanın derinliklerinde Mine, konuşan bir ağaçla karşılaşır. 'Genç prenses,' der ağaç, 'Kristalleri geri getirmek için üç deneme geçmelisin. Cesaret, bilgelik ve sevgi.'",
                        choices: [
                            { text: "Cesaret denemesini kabul et", action: "courage_trial", requirement: null },
                            { text: "Bilgelik denemesini seç", action: "wisdom_trial", requirement: null },
                            { text: "Sevgi denemesini dene", action: "love_trial", requirement: null }
                        ],
                        consequences: {
                            courage_trial: { nextScene: 4, reward: "courage_gem", damage: 20 },
                            wisdom_trial: { nextScene: 5, reward: "wisdom_gem", damage: 0 },
                            love_trial: { nextScene: 6, reward: "love_gem", damage: 0 }
                        }
                    }
                ]
            },
            3: {
                title: "Kaybolmuş Anahtarlar",
                scenes: [
                    {
                        text: "Üç farklı anahtar Mine'in önünde durur. Altın anahtar parlar, gümüş anahtar soğuk bir ışık yayar, bronz anahtar ise eski ve gizemlidir. Her biri farklı bir kapıyı açabilir.",
                        choices: [
                            { text: "Altın anahtarı kullan", action: "golden_key", requirement: "wealth" },
                            { text: "Gümüş anahtarı dene", action: "silver_key", requirement: "purity" },
                            { text: "Bronz anahtarı seç", action: "bronze_key", requirement: "wisdom" }
                        ],
                        consequences: {
                            golden_key: { nextScene: 1, reward: "treasure", damage: 0 },
                            silver_key: { nextScene: 2, reward: "purity_crystal", damage: 5 },
                            bronze_key: { nextScene: 3, reward: "ancient_knowledge", damage: 0 }
                        }
                    }
                ]
            },
            4: {
                title: "Ejderhanın Yolu",
                scenes: [
                    {
                        text: "Dağın zirvesinde, yaşlı ejderha Ignis uyuklamaktadır. Vücudu, kristal parçalarla kaplıdır. Mine, ejderhanın yardımına ihtiyacı olduğunu bilir, ama nasıl yaklaşacağına karar vermelidir.",
                        choices: [
                            { text: "Ejderhayla dost olmaya çalış", action: "befriend_dragon", requirement: "kindness" },
                            { text: "Ejderhayla savaş", action: "fight_dragon", requirement: "strength" },
                            { text: "Ejderhanın sırrını öğren", action: "learn_secret", requirement: "curiosity" }
                        ],
                        consequences: {
                            befriend_dragon: { nextScene: 1, reward: "dragon_friendship", damage: 0 },
                            fight_dragon: { nextScene: 2, reward: "dragon_crystal", damage: 30 },
                            learn_secret: { nextScene: 3, reward: "secret_knowledge", damage: 0 }
                        }
                    }
                ]
            },
            5: {
                title: "Sihirli Kristaller",
                scenes: [
                    {
                        text: "Sihirli gölün kenarında Mine, üç ruhla karşılaşır. Cesaret Ruhu, Bilgelik Ruhu ve Sevgi Ruhu. 'Son kristali kazanmak için kalbini test etmelisin,' derler.",
                        choices: [
                            { text: "Cesaret ruhunu seç", action: "choose_courage", requirement: null },
                            { text: "Bilgelik ruhunu dinle", action: "choose_wisdom", requirement: null },
                            { text: "Sevgi ruhunu takip et", action: "choose_love", requirement: null }
                        ],
                        consequences: {
                            choose_courage: { nextScene: 1, reward: "final_crystal", damage: 25 },
                            choose_wisdom: { nextScene: 2, reward: "final_crystal", damage: 0 },
                            choose_love: { nextScene: 3, reward: "final_crystal", damage: 0 }
                        }
                    }
                ]
            },
            6: {
                title: "Final: Taç Giyme",
                scenes: [
                    {
                        text: "Mine tüm kristalleri topladı ve Kristal Kale'ye döndü. Halk onu bekliyor, ama gerçek liderlik testi şimdi başlıyor. Taçtan önce son bir seçim yapmalı.",
                        choices: [
                            { text: "Adaletle yönetmeyi seç", action: "rule_justice", requirement: "fairness" },
                            { text: "Sevgiyle yönetmeyi tercih et", action: "rule_love", requirement: "compassion" },
                            { text: "Bilgelikle yönetmeyi kabul et", action: "rule_wisdom", requirement: "knowledge" }
                        ],
                        consequences: {
                            rule_justice: { nextScene: 1, reward: "just_crown", damage: 0 },
                            rule_love: { nextScene: 2, reward: "loving_crown", damage: 0 },
                            rule_wisdom: { nextScene: 3, reward: "wise_crown", damage: 0 }
                        }
                    }
                ]
            }
        };
    }

    // Hikaye ilerleme
    advanceStory(chapter, sceneIndex, choice) {
        const stories = this.getChapterStories();
        const chapterStory = stories[chapter];
        
        if (!chapterStory || !chapterStory.scenes[sceneIndex]) {
            return null;
        }
        
        const currentScene = chapterStory.scenes[sceneIndex];
        const consequence = currentScene.consequences[choice];
        
        if (consequence) {
            this.storyProgress.push({
                chapter,
                scene: sceneIndex,
                choice,
                consequence: consequence
            });
            
            return {
                nextScene: consequence.nextScene,
                reward: consequence.reward,
                damage: consequence.damage,
                message: this.getChoiceMessage(choice, consequence)
            };
        }
        
        return null;
    }

    getChoiceMessage(choice, consequence) {
        const messages = {
            explore_castle: "Kale'de ilginç şeyler keşfettin!",
            visit_wizard: "Büyücüden sihirli bir hediye aldın!",
            research_library: "Kütüphanede önemli ipuçları buldun!",
            open_door: "Kapıyı açarken tehlikeli bir tuzağa rastladın!",
            listen_door: "Kapının arkasındaki sırrı öğrendin!",
            skip_door: "Güvenli bir seçim yaptın.",
            touch_orb: "Küreden geleceğe dair görüntüler gördün!",
            ask_help: "Büyücüden güçlü bir iksir aldın!",
            go_alone: "Cesaretin büyücüden bereket aldı!",
            light_path: "Işık yolu seni parlak bir kristale götürdü!",
            lake_path: "Göl yolu tehlikeliydi ama ödüllendi!",
            dark_cave: "Karanlık mağara korkutucuydu ama değerli bir şey buldun!",
            courage_trial: "Cesaret denemesini geçtin, ama yoruldun!",
            wisdom_trial: "Bilgelik denemesini kolaylıkla geçtin!",
            love_trial: "Sevgi denemesi kalbini güçlendirdi!",
            golden_key: "Altın anahtar hazinenin kapısını açtı!",
            silver_key: "Gümüş anahtar saflık kristalini ortaya çıkardı!",
            bronze_key: "Bronz anahtar eski bilgileri açığa çıkardı!",
            befriend_dragon: "Ejderha senin dostun oldu!",
            fight_dragon: "Ejderha ile savaşarak kristal kazandın, ama yaralandın!",
            learn_secret: "Ejderhanın sırrını öğrendin!",
            choose_courage: "Cesaretin son kristali kazandırdı, ama bedeli ağır oldu!",
            choose_wisdom: "Bilgelikle kristalı kolayca kazandın!",
            choose_love: "Sevgin kristalı sana hediye etti!",
            rule_justice: "Adaletli bir lider olacağın taçlandı!",
            rule_love: "Sevgi dolu bir lider olacağın taçlandı!",
            rule_wisdom: "Bilge bir lider olacağın taçlandı!"
        };
        
        return messages[choice] || "Seçimini yaptın ve sonuçlarını yaşadın.";
    }

    // Karakter gelişimi
    updateCharacterStats(choice, consequence) {
        const stats = {
            courage: 0,
            wisdom: 0,
            love: 0,
            strength: 0,
            magic: 0,
            hope: 0,
            kindness: 0,
            curiosity: 0,
            purity: 0,
            fairness: 0,
            compassion: 0,
            knowledge: 0,
            wealth: 0,
            bravery: 0
        };

        // Seçimlere göre karakter özelliklerini güncelle
        const choiceStats = {
            explore_castle: { courage: 5, curiosity: 3 },
            visit_wizard: { wisdom: 5, magic: 3 },
            research_library: { wisdom: 3, knowledge: 5 },
            open_door: { courage: 10, bravery: 5 },
            listen_door: { wisdom: 5, curiosity: 5 },
            skip_door: { wisdom: 3, caution: 3 },
            touch_orb: { magic: 10, curiosity: 5 },
            ask_help: { wisdom: 5, kindness: 3 },
            go_alone: { courage: 8, independence: 5 },
            light_path: { hope: 10, purity: 5 },
            lake_path: { curiosity: 8, bravery: 5 },
            dark_cave: { bravery: 10, courage: 8 },
            courage_trial: { courage: 15, strength: 5 },
            wisdom_trial: { wisdom: 15, knowledge: 5 },
            love_trial: { love: 15, compassion: 5 },
            golden_key: { wealth: 10, courage: 3 },
            silver_key: { purity: 10, wisdom: 5 },
            bronze_key: { wisdom: 10, knowledge: 8 },
            befriend_dragon: { kindness: 15, love: 8 },
            fight_dragon: { strength: 15, courage: 10 },
            learn_secret: { knowledge: 15, wisdom: 8 },
            choose_courage: { courage: 20, strength: 10 },
            choose_wisdom: { wisdom: 20, knowledge: 10 },
            choose_love: { love: 20, compassion: 10 },
            rule_justice: { fairness: 20, wisdom: 10 },
            rule_love: { compassion: 20, love: 10 },
            rule_wisdom: { knowledge: 20, wisdom: 10 }
        };

        if (choiceStats[choice]) {
            Object.assign(stats, choiceStats[choice]);
        }

        return stats;
    }

    // Hikaye sonu
    getEnding(playerStats) {
        const endings = {
            courage_hero: {
                title: "Cesur Kahraman",
                description: "Mine, cesaretiyle krallığı kurtardı. Halk onu bir kahraman olarak selamladı ve Kristal Kale yeniden parladı.",
                requirements: { courage: 50, strength: 30 }
            },
            wise_queen: {
                title: "Bilge Kraliçe",
                description: "Mine, bilgelikle yönetti ve krallık altın çağını yaşadı. Kristallerin gücü bilgisinden geldi.",
                requirements: { wisdom: 50, knowledge: 30 }
            },
            loving_ruler: {
                title: "Sevgi Dolu Hükümdar",
                description: "Mine, sevgisiyle herkesin kalbini kazandı. Krallık barış ve huzur içinde yaşadı.",
                requirements: { love: 50, compassion: 30 }
            },
            balanced_leader: {
                title: "Dengeli Lider",
                description: "Mine, tüm özellikleriyle dengeli bir lider oldu. Krallık refah içinde.",
                requirements: { courage: 30, wisdom: 30, love: 30 }
            },
            tragic_hero: {
                title: "Trajik Kahraman",
                description: "Mine, kristalleri kurtardı ama kendini feda etti. Krallık onu asla unutmayacak.",
                requirements: { courage: 60, health: 0 }
            }
        };

        // En uygun sonu bul
        for (const [key, ending] of Object.entries(endings)) {
            let matches = true;
            for (const [stat, value] of Object.entries(ending.requirements)) {
                if (playerStats[stat] < value) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                return ending;
            }
        }

        // Varsayılan son
        return {
            title: "Yeni Başlangıç",
            description: "Mine'in macerası devam ediyor. Kristaller kurtarıldı, ama yeni zorluklar bekliyor."
        };
    }
}

// Anlatıcı Sınıfı
class Narrator {
    constructor() {
        this.voice = 'female';
        this.speed = 'normal';
        this.tone = 'storytelling';
    }

    // Metni seslendirme (isteğe bağlı)
    narrate(text, callback) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            utterance.rate = this.speed === 'slow' ? 0.8 : this.speed === 'fast' ? 1.2 : 1.0;
            
            utterance.onend = callback;
            speechSynthesis.speak(utterance);
        } else {
            // Seslendirme不支持，直接回调
            if (callback) callback();
        }
    }

    // Metni animasyonla göster
    animateText(element, text, speed = 50) {
        element.textContent = '';
        let index = 0;
        
        const typeWriter = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, speed);
            }
        };
        
        typeWriter();
    }

    // Atmosferik efektler
    createAtmosphere(scene) {
        const effects = {
            castle: 'rain',
            forest: 'wind',
            mountain: 'thunder',
            lake: 'water',
            cave: 'echo',
            throne: 'choir'
        };

        const effect = effects[scene] || 'silence';
        this.playAmbientSound(effect);
    }

    playAmbientSound(effect) {
        // Ambient sesleri çal (opsiyonel)
        console.log(`Playing ambient sound: ${effect}`);
    }
}

// Global hikaye yöneticisi
const storyManager = new StoryManager();
