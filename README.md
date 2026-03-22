# 🎮 Efsanevi Mini Oyunlar
### *created by burakcskan ✰*

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Web-6366f1?style=for-the-badge)
![Language](https://img.shields.io/badge/Language-JavaScript-f0db4f?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Python-3776ab?style=for-the-badge)
![Multiplayer](https://img.shields.io/badge/Multiplayer-WebSocket-10b981?style=for-the-badge)

**Gerçek zamanlı 2 kişilik online oyun platformu.**
Arkadaşınla aynı odaya gir, oyna, kazan!

</div>

---

## 🕹️ Oyunlar

| Oyun | Açıklama | Oyuncu |
|------|----------|--------|
| ❌⭕ **XOX** | Klasik üçleme oyunu, sırayla oyna | 2 kişi |
| 🔴 **Dört Dörtlük** | Sütuna taş bırak, 4'ü birleştir | 2 kişi |
| 🚢 **Amiral Battı** | Gemileri yerleştir, düşmanı bat | 2 kişi |
| ✏️ **Adam Asmaca** | Kelimeyi tahmin et, asılmadan kaç | 2 kişi |
| ♟️ **Dama** | Taşları ye, kral ol | 2 kişi |
| 🎯 **Taş Kağıt Makas** | Aynı anda seç, en çok kazanan galip | 2 kişi |
| 🧠 **Bilgi Yarışması** | Soruları cevapla, puan topla | 2 kişi |
| 🎲 **Zar Oyunu** | Zar at, en yükseği kazan | 2 kişi |

---

## ✨ Özellikler

- 🌐 **Gerçek Zamanlı Multiplayer** — WebSocket ile anlık oyun deneyimi
- 💬 **Canlı Chat** — Her oyunda oda içi sohbet
- 🏠 **Oda Sistemi** — 3 farklı oda, istediğin odaya katıl
- 📱 **Mobil Uyumlu** — Telefon ve PC'de sorunsuz çalışır
- 🎨 **Modern Tasarım** — Koyu tema, mor/mavi gradient renkler
- ⚡ **Hızlı Bağlantı** — Serveo tunnel ile internet erişimi

---

## 🚀 Kurulum

### Gereksinimler
```bash
Python 3.7+
pip install aiohttp
```

### Çalıştırma
```bash
# Sunucuyu başlat
cd python
python3 integrated_server.py

# İnternet erişimi için (yeni terminalde)
ssh -o StrictHostKeyChecking=no -R 80:localhost:8001 serveo.net
```

### Kolay Başlatma
```bash
# Masaüstündeki script ile tek komutla başlat
bash ~/Masaüstü/burakprojestart.sh
```

### Erişim
- **Local:** `http://localhost:8001`
- **İnternet:** Serveo URL'si terminalde görünür

---

## 📁 Dosya Yapısı

```
mine-adventures/
├── html/
│   └── index.html          # Ana sayfa (tüm oyunlar burada)
├── css/
│   └── style.css           # Stiller
├── js/
│   ├── main.js             # Ana uygulama
│   ├── games.js            # Oyun motorları
│   ├── multiplayer.js      # WebSocket sistemi
│   └── audio.js            # Ses yönetimi
├── python/
│   ├── integrated_server.py # Ana sunucu (aiohttp)
│   └── ...
├── json/
│   └── config.json         # Sunucu ayarları
└── README.md
```

---

## 🛠️ Teknolojiler

| Alan | Teknoloji |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript ES6+ |
| Backend | Python 3 + aiohttp |
| Gerçek Zamanlı | WebSocket |
| Tünel | Serveo.net |
| Stil | CSS Grid, Flexbox, Animations |

---

## 🎯 Nasıl Oynanır?

1. **Siteyi aç** — Serveo URL'sini tarayıcıda açın
2. **Oyun seç** — Ana menüden istediğin oyuna tıkla
3. **İsim gir** — Oyuncu adını yaz
4. **Oda seç** — Oda 1, 2 veya 3'e katıl
5. **Arkadaşını bekle** — Aynı odaya girince oyun otomatik başlar
6. **Oyna!** — Sırayla hamle yap, chat'ten konuş, kazan 🏆

---

<div align="center">

**🎮 İyi eğlenceler!**

*burakcskan ✰*

</div>
