// ===== STORY DATA =====

/**
 * Hikaye verileri
 */

window.STORY_DATA = {
    1: {
        title: "Kristal Kale'nin Sırrı",
        icon: "🏰",
        scenes: [
            {
                id: 0,
                title: "Uyanış",
                text: "Prenses Mine, Kristal Kale'nin en yüksek kulesinde uyanır. Pencerelerden sızan ay ışığı, duvarlardaki kristallerin söndüğünü gösterir. Kale sessizliğe gömülmüş ve koruyucu kristaller kaybolmuştur.",
                image: "🏰",
                choices: [
                    {
                        text: "Kaleyi araştır",
                        points: 15,
                        health: 0,
                        crystals: 1,
                        reward: { name: "Antika Harita", icon: "🗺️", description: "Eski bir harita parçası" }
                    },
                    {
                        text: "Büyücüye git",
                        points: 20,
                        health: 5,
                        crystals: 2,
                        reward: { name: "Sihirli İksir", icon: "🧪", description: "Güçlü bir iksir" }
                    },
                    {
                        text: "Kütüphaneye git",
                        points: 18,
                        health: 0,
                        crystals: 1,
                        reward: { name: "Bilgi Parşömeni", icon: "📜", description: "Gizli bilgiler" }
                    }
                ]
            },
            {
                id: 1,
                title: "Koridorlarda",
                text: "Mine koridorlarda yürürken duvarlardaki kristallerin söndüğünü fark eder. Ruhların fısıltıları duyulur ve karanlık köşelerde hareketlenir.",
                image: "🌙",
                choices: [
                    {
                        text: "Gizemli kapıyı aç",
                        points: 25,
                        health: -5,
                        crystals: 3,
                        reward: { name: "Kristal Parçası", icon: "💎", description: "Parlak bir kristal" }
                    },
                    {
                        text: "Kapıyı dinle",
                        points: 22,
                        health: 0,
                        crystals: 2,
                        reward: { name: "Gizli Bilgi", icon: "🤫", description: "Önemli bir sır" }
                    },
                    {
                        text: "İleri devam et",
                        points: 20,
                        health: 0,
                        crystals: 1,
                        reward: { name: "Koruyucu Tılsım", icon: "🛡️", description: "Koruyucu bir tılsım" }
                    }
                ]
            },
            {
                id: 2,
                title: "Zindan Keşfi",
                text: "Mine kale zindanına iner. Burası kaybolmuş kristallerin saklandığı yerdir. Zeminde eski semboller ve duvarlarda parıldayan yazılar vardır.",
                image: "⚔️",
                choices: [
                    {
                        text: "Sembolleri çöz",
                        points: 30,
                        health: 0,
                        crystals: 4,
                        reward: { name: "Bilgelik Taşı", icon: "🧠", description: "Zeka veren taş" }
                    },
                    {
                        text: "Doğrudan ilerle",
                        points: 25,
                        health: -10,
                        crystals: 5,
                        reward: { name: "Cesaret Nişanı", icon: "💪", description: "Cesaret sembolü" }
                    },
                    {
                        text: "Dikkatlice araştır",
                        points: 28,
                        health: 5,
                        crystals: 3,
                        reward: { name: "Gözlemci Gözlüğü", icon: "👓", description: "Her şeyi gösteren gözlük" }
                    }
                ]
            }
        ]
    },
    2: {
        title: "Gizemli Orman",
        icon: "🌲",
        scenes: [
            {
                id: 0,
                title: "Orman Girişi",
                text: "Mine, Gizemli Orman'a ulaşır. Binlerce yıldır yaşayan ağaçlar dallarını gökyüzüne uzatır ve rüzgar yapraklarda gizli sırlar fısıldar.",
                image: "🌲",
                choices: [
                    {
                        text: "Işık patikası",
                        points: 35,
                        health: 0,
                        crystals: 3,
                        reward: { name: "Işık Kristali", icon: "💡", description: "Aydınlatan kristal" }
                    },
                    {
                        text: "Göl patikası",
                        points: 40,
                        health: -8,
                        crystals: 6,
                        reward: { name: "Su Kristali", icon: "💧", description: "Berrak su kristali" }
                    },
                    {
                        text: "Mağara patikası",
                        points: 45,
                        health: -12,
                        crystals: 8,
                        reward: { name: "Gölge Kristali", icon: "🌑", description: "Karanlık güç veren kristal" }
                    }
                ]
            },
            {
                id: 1,
                title: "Orman Kalbi",
                text: "Ormanın kalbinde antik bir mezar bulunur. Burası orman ruhlarının yaşadığı kutsal bir yerdir. Hava sihirle parıldar.",
                image: "🌳",
                choices: [
                    {
                        text: "Ruhlarla konuş",
                        points: 38,
                        health: 10,
                        crystals: 4,
                        reward: { name: "Ruh Dostluğu", icon: "👻", description: "Ruhlarla bağlantı" }
                    },
                    {
                        text: "Mezarı araştır",
                        points: 42,
                        health: -5,
                        crystals: 7,
                        reward: { name: "Antik Hazine", icon: "📦", description: "Değerli hazine" }
                    },
                    {
                        text: "Doğayı dinle",
                        points: 36,
                        health: 15,
                        crystals: 3,
                        reward: { name: "Doğa Bereketi", icon: "🌿", description: "Doğanın gücü" }
                    }
                ]
            },
            {
                id: 2,
                title: "Orman Sırrı",
                text: "Mine ormanın derinliklerinde ilerlerken, ağaçların arasında gizlenmiş antik bir tapınak bulur. Burası doğanın en güçlü büyülerinin saklandığı yerdir.",
                image: "🏛️",
                choices: [
                    {
                        text: "Tapınağa gir",
                        points: 50,
                        health: -15,
                        crystals: 10,
                        reward: { name: "Doğa Büyüsü", icon: "🌿", description: "Doğanın gücü" }
                    },
                    {
                        text: "Tapınak etrafını araştır",
                        points: 45,
                        health: 0,
                        crystals: 8,
                        reward: { name: "Gizli Yol", icon: "🛤️", description: "Gizli bir yol" }
                    },
                    {
                        text: "Ruhları çağır",
                        points: 48,
                        health: 5,
                        crystals: 9,
                        reward: { name: "Ruh Koruması", icon: "🛡️", description: "Ruh koruması" }
                    }
                ]
            }
        ]
    },
    3: {
        title: "Kaybolmuş Anahtarlar",
        icon: "🗝️",
        scenes: [
            {
                id: 0,
                title: "Anahtar Arayışı",
                text: "Mine üç kayıp anahtarı bulmalıdır. Her anahtar farklı bir gücü temsil eder ve kale'nin sırlarını açar.",
                image: "🗝️",
                choices: [
                    {
                        text: "Altın anahtarı ara",
                        points: 40,
                        health: 0,
                        crystals: 5,
                        reward: { name: "Altın Anahtar", icon: "🔑", description: "Zenginlik anahtarı" }
                    },
                    {
                        text: "Gümüş anahtarı ara",
                        points: 42,
                        health: -3,
                        crystals: 6,
                        reward: { name: "Gümüş Anahtar", icon: "🗝️", description: "Saflık anahtarı" }
                    },
                    {
                        text: "Bronz anahtarı ara",
                        points: 38,
                        health: 0,
                        crystals: 4,
                        reward: { name: "Bronz Anahtar", icon: "🔓", description: "Güç anahtarı" }
                    }
                ]
            },
            {
                id: 1,
                title: "Anahtarların Sırrı",
                text: "Üç anahtar birleştiğinde, Mine kale'nin en büyük sırrını keşfeder. Bu sırrın krallığın geleceğini değiştirebileceğini anlar.",
                image: "🔮",
                choices: [
                    {
                        text: "Sırrı hemen aç",
                        points: 50,
                        health: -15,
                        crystals: 10,
                        reward: { name: "Büyük Sır", icon: "🔮", description: "Geleceği gösteren küre" }
                    },
                    {
                        text: "Dikkatli hazırlık",
                        points: 45,
                        health: 5,
                        crystals: 8,
                        reward: { name: "Bilgelik Kitabı", icon: "📚", description: "Her şeyi anlatan kitap" }
                    },
                    {
                        text: "Yardım çağır",
                        points: 48,
                        health: 10,
                        crystals: 7,
                        reward: { name: "Müttefiklik", icon: "🤝", description: "Güçlü dostluk" }
                    }
                ]
            },
            {
                id: 2,
                title: "Anahtar Birleşimi",
                text: "Mine üç anahtarı birleştirdiğinde, kale'nin gizli odası ortaya çıkar. Burası krallığın en değerli hazinelerinin saklandığı yerdir.",
                image: "💰",
                choices: [
                    {
                        text: "Hazineyi al",
                        points: 55,
                        health: -20,
                        crystals: 15,
                        reward: { name: "Kraliyet Hazinesi", icon: "💰", description: "Değerli hazine" }
                    },
                    {
                        text: "Hazineyi koru",
                        points: 52,
                        health: 10,
                        crystals: 12,
                        reward: { name: "Koruyucu Mühür", icon: "🔱", description: "Koruyucu mühür" }
                    },
                    {
                        text: "Hazineyi paylaş",
                        points: 58,
                        health: 15,
                        crystals: 13,
                        reward: { name: "Cömertlik Nişanı", icon: "💝", description: "Cömertlik sembolü" }
                    }
                ]
            }
        ]
    },
    4: {
        title: "Ejderhanın Yolu",
        icon: "🐉",
        scenes: [
            {
                id: 0,
                title: "Ejderha Buluşması",
                text: "Mine ejderha Ignis ile karşılaşır. Bu ejderha yüzyıllardır kale'yi korumaktadır ve Mine'in niyetini test edecektir.",
                image: "🐉",
                choices: [
                    {
                        text: "Ejderha ile dost ol",
                        points: 60,
                        health: 20,
                        crystals: 8,
                        reward: { name: "Ejderha Dostluğu", icon: "🐉", description: "Ejderha dostluğu" }
                    },
                    {
                        text: "Ejderha ile savaş",
                        points: 55,
                        health: -20,
                        crystals: 12,
                        reward: { name: "Ejderha Pulları", icon: "🐲", description: "Güçlü pullar" }
                    },
                    {
                        text: "Ejderhanın sırrını öğren",
                        points: 52,
                        health: 0,
                        crystals: 10,
                        reward: { name: "Ejderha Bilgisi", icon: "🎓", description: "Eski bilgiler" }
                    }
                ]
            },
            {
                id: 1,
                title: "Ejderha Testi",
                text: "Ignis, Mine'e üç test sunar: cesaret, bilgelik ve sevgi. Mine bu testlerden geçerek kristallere hak kazanmalıdır.",
                image: "⚔️",
                choices: [
                    {
                        text: "Cesaret testini seç",
                        points: 50,
                        health: -15,
                        crystals: 10,
                        reward: { name: "Cesaret Kristali", icon: "💪", description: "Cesaret veren kristal" }
                    },
                    {
                        text: "Bilgelik testini seç",
                        points: 55,
                        health: 0,
                        crystals: 8,
                        reward: { name: "Bilgelik Kristali", icon: "🧠", description: "Zeka veren kristal" }
                    },
                    {
                        text: "Sevgi testini seç",
                        points: 58,
                        health: 10,
                        crystals: 9,
                        reward: { name: "Sevgi Kristali", icon: "❤️", description: "Sevgi veren kristal" }
                    }
                ]
            },
            {
                id: 2,
                title: "Ejderha Gücü",
                text: "Testleri geçen Mine, ejderhanın gücünü kazanır. Ignis ona kale'nin en büyük sırrını açıklar ve ona özel bir güç verir.",
                image: "🔥",
                choices: [
                    {
                        text: "Ejderha gücünü al",
                        points: 65,
                        health: -25,
                        crystals: 15,
                        reward: { name: "Ejderha Gücü", icon: "🔥", description: "Ateş gücü" }
                    },
                    {
                        text: "Ejderha bilgeliğini al",
                        points: 62,
                        health: 5,
                        crystals: 13,
                        reward: { name: "Ejderha Bilgeliği", icon: "📖", description: "Eski bilgeler" }
                    },
                    {
                        text: "Ejderha korumasını al",
                        points: 68,
                        health: 15,
                        crystals: 14,
                        reward: { name: "Ejderha Kalkanı", icon: "🛡️", description: "Güçlü kalkan" }
                    }
                ]
            }
        ]
    },
    5: {
        title: "Sihirli Kristaller",
        icon: "💎",
        scenes: [
            {
                id: 0,
                title: "Kristal Odası",
                text: "Mine kristal odasına girer. Burada yedi sihirli kristal durur ve her biri farklı bir elementi temsil eder.",
                image: "💎",
                choices: [
                    {
                        text: "Ateş kristalini al",
                        points: 45,
                        health: -5,
                        crystals: 6,
                        reward: { name: "Ateş Kristali", icon: "🔥", description: "Ateş gücü" }
                    },
                    {
                        text: "Su kristalini al",
                        points: 48,
                        health: 5,
                        crystals: 7,
                        reward: { name: "Su Kristali", icon: "💧", description: "Su gücü" }
                    },
                    {
                        text: "Toprak kristalini al",
                        points: 46,
                        health: 0,
                        crystals: 6,
                        reward: { name: "Toprak Kristali", icon: "🏔️", description: "Toprak gücü" }
                    }
                ]
            },
            {
                id: 1,
                title: "Kristal Birleşimi",
                text: "Mine tüm kristalleri birleştirdiğinde, kale'nin gerçek gücü ortaya çıkar. Artık krallığı kurtarma zamanı gelmiştir.",
                image: "✨",
                choices: [
                    {
                        text: "Kristalleri birleştir",
                        points: 70,
                        health: -18,
                        crystals: 15,
                        reward: { name: "Birleşik Güç", icon: "⚡", description: "Tüm elementlerin gücü" }
                    },
                    {
                        text: "Güç paylaşımı yap",
                        points: 65,
                        health: 10,
                        crystals: 12,
                        reward: { name: "Paylaşım Bereketi", icon: "🤗", description: "Paylaşmanın gücü" }
                    },
                    {
                        text: "Kristalleri koru",
                        points: 68,
                        health: 5,
                        crystals: 13,
                        reward: { name: "Koruyucu Güç", icon: "🛡️", description: "Koruma gücü" }
                    }
                ]
            },
            {
                id: 2,
                title: "Kristal Gücü",
                text: "Mine kristallerin gücünü tam olarak kontrol etmeyi öğrenir. Artık krallığı korumak için gereken tüm güce sahiptir.",
                image: "👑",
                choices: [
                    {
                        text: "Kristal gücünü kullan",
                        points: 75,
                        health: -30,
                        crystals: 20,
                        reward: { name: "Kristal Tacı", icon: "👑", description: "Güçlü taç" }
                    },
                    {
                        text: "Kristal gücünü paylaş",
                        points: 72,
                        health: 15,
                        crystals: 18,
                        reward: { name: "Kristal Bereketi", icon: "💫", description: "Bereket gücü" }
                    },
                    {
                        text: "Kristal gücünü koru",
                        points: 78,
                        health: 10,
                        crystals: 19,
                        reward: { name: "Kristal Mührü", icon: "🔮", description: "Koruyucu mühür" }
                    }
                ]
            }
        ]
    },
    6: {
        title: "Final: Taç Giyme",
        icon: "👑",
        scenes: [
            {
                id: 0,
                title: "Son Test",
                text: "Mine son testle karşı karşıyadır. Krallığı nasıl yöneteceği seçimi, geleceğini belirleyecektir.",
                image: "👑",
                choices: [
                    {
                        text: "Adaletle yönet",
                        points: 80,
                        health: 0,
                        crystals: 20,
                        reward: { name: "Adalet Tacı", icon: "⚖️", description: "Adaletin tacı" }
                    },
                    {
                        text: "Sevgiyle yönet",
                        points: 85,
                        health: 10,
                        crystals: 18,
                        reward: { name: "Sevgi Tacı", icon: "❤️", description: "Sevginin tacı" }
                    },
                    {
                        text: "Bilgelikle yönet",
                        points: 90,
                        health: 5,
                        crystals: 19,
                        reward: { name: "Bilgelik Tacı", icon: "👑", description: "Bilgelik tacı" }
                    }
                ]
            },
            {
                id: 1,
                title: "Yeni Kraliçe",
                text: "Mine kraliçe olarak taç giyer. Krallık onun liderliğinde parlamaya başlar ve halk yeni kraliçesini sevgiyle karşılar.",
                image: "👸",
                choices: [
                    {
                        text: "Halka hitap et",
                        points: 100,
                        health: 20,
                        crystals: 25,
                        reward: { name: "Halk Sevgisi", icon: "👥", description: "Halkın sevgisi" }
                    },
                    {
                        text: "Krallığı güvence altına al",
                        points: 95,
                        health: 10,
                        crystals: 22,
                        reward: { name: "Krallık Barışı", icon: "🕊️", description: "Sürekli barış" }
                    },
                    {
                        text: "Geleceği planla",
                        points: 98,
                        health: 15,
                        crystals: 24,
                        reward: { name: "Gelecek Vizyonu", icon: "🔮", description: "Parlak gelecek" }
                    }
                ]
            },
            {
                id: 2,
                title: "Efsanevi Kraliçe",
                text: "Mine kraliçe olarak krallığı yeni bir çağa taşır. Onun liderliğinde krallık altın çağını yaşar ve halk mutluluğa ulaşır.",
                image: "🏆",
                choices: [
                    {
                        text: "Altın çağını başlat",
                        points: 120,
                        health: 25,
                        crystals: 30,
                        reward: { name: "Altın Çağ", icon: "🏆", description: "Altın çağın başlangıcı" }
                    },
                    {
                        text: "Efsanevi miras bırak",
                        points: 115,
                        health: 15,
                        crystals: 28,
                        reward: { name: "Efsane", icon: "📖", description: "Efsanevi hikaye" }
                    },
                    {
                        text: "Sonsuz mutluluk getir",
                        points: 125,
                        health: 20,
                        crystals: 32,
                        reward: { name: "Sonsuz Mutluluk", icon: "✨", description: "Sonsuz mutluluk" }
                    }
                ]
            }
        ]
    }
};

console.log('📖 Story data loaded');
