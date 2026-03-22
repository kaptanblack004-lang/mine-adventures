# 🎮 Efsanevi Mini Oyunlar - Online Oyun Platformu

## 🌟 Özellikler

### Tasarım
- 🎨 **Modern Dark Theme**: Kelime Savaşı projesi temalı koyu tasarım
- 🌈 **Gradient Animasyonları**: Dinamik renk geçişleri
- 📱 **Responsive Design**: Mobil uyumlu
- 🎯 **İnteraktif UI**: Hover efektleri ve animasyonlar

### Renk Paleti
- **Primary**: Indigo (#6366f1)
- **Secondary**: Purple (#8b5cf6)
- **Accent**: Pink (#ec4899)
- **Background**: Dark slate (#0f172a)
- **Text**: Light gray (#f1f5f9)

### Oyunlar
- ❌⭕ **XOX (Tic-Tac-Toe)** - Klasik üçleme oyunu
- 🐍 **Yılan (Snake)** - Yılanı büyüt, puan topla
- 🧩 **Tetris** - Küp yerleştirme oyunu
- 🧠 **Hafıza Oyunu** - Eşleştirme oyunu
- 🏓 **Pong** - Klasik raket oyunu
- 🚀 **Uzay Savunması** - Asteroidleri yok et

### Profesyonel Özellikler
- 🎨 Modern ve responsive tasarım
- 🎵 Ses efektleri ve müzik
- 🏆 Yüksek skor sistemi
- ✨ Parçacık efektleri ve animasyonlar
- 🔒 Güvenlik önlemleri
- 📱 Mobil uyumlu
- 👥 **Multiplayer Modu** - Gerçek zamanlı çok oyunculu oyunlar

### Multiplayer Özellikleri
- 💬 **Gerçek Zamanlı Chat** - Oda içi sohbet
- 🎯 **Multiplayer XOX** - Turn-based oyun
- 🏠 **Oda Sistemi** - Room1, Room2, Room3
- 🌐 **İnternet Erişimi** - Ngrok ile global erişim

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Python 3.7+
- Modern web tarayıcısı
- Ngrok (internet erişimi için)

### Kurulum
```bash
# Bağımlılıkları yükle
pip install websockets

# Veya sistem paket yöneticisi ile
sudo apt install python3-websockets
```

### Çalıştırma
```bash
# Basit ve hızlı server (önerilen)
cd python
python3 simple_server.py --host 0.0.0.0 --port 8000

# Alternatif: Eski server
python3 main.py server --host 0.0.0.0 --port 8000

# İnternet erişimi için ngrok'u ayrı terminalde başlat
ngrok http 8000
```

### Erişim
- **Local:** http://localhost:8000
- **İnternet:** ngrok URL'si (örnek: https://xxxxx.ngrok-free.dev)

## 🎮 Nasıl Oynanır

### Tek Oyunculu
1. Ana sayfadan oyun seç
2. Klavye/ok tuşları ile kontrol et
3. Skorunu kaydet

### Çok Oyunculu
1. "👥 Multiplayer" butonuna tıkla
2. Oda seç (Room1, Room2, Room3)
3. Chat ile arkadaşlarını davet et
4. XOX oyununu başlat

## 🛠️ Teknik Detaylar

### Performans Optimizasyonları
- ⚡ **ThreadingHTTPServer**: Çoklu bağlantı desteği
- 🚀 **Buffer Optimizasyonu**: 64KB buffer size
- 📝 **Azaltılmış Logging**: Sadece hatalar loglanır
- 💾 **Cache Headers**: 1 saat browser cache
- 🏠 **Oda Bazlı WebSocket**: Verimli mesaj yönlendirme

### Teknolojiler
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Backend:** Python 3 + WebSockets
- **Real-time:** WebSocket protokolü
- **Styling:** Modern CSS Grid/Flexbox
- **Security:** CSP, XSS protection, HTTPS

### Dosya Yapısı
```
/
├── html/           # HTML sayfaları
├── css/            # Stil dosyaları
├── js/             # JavaScript oyunları
├── python/         # Backend sunucusu
├── json/           # Veri dosyaları
└── README.md       # Bu dosya
```

### Teknolojiler
- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Backend:** Python 3 + WebSockets
- **Real-time:** WebSocket protokolü
- **Styling:** Modern CSS Grid/Flexbox
- **Security:** CSP, XSS protection, HTTPS

### API Endpoints
- `GET /` - Ana sayfa
- `WS /ws` - WebSocket bağlantısı (port 8765)

## 🔧 Gelişmiş Konfigürasyon

### Sunucu Ayarları
`json/config.json` dosyasını düzenleyin:
```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 8000,
    "ssl": false
  }
}
```

### Güvenlik
- Content Security Policy aktif
- XSS koruması
- HTTPS redirect
- Güvenli header'lar

## 📊 İstatistikler

Sunucu istatistiklerini görüntüle:
```bash
python3 main.py stats
```

## 🗂️ Yedekleme

Verileri yedekle:
```bash
python3 main.py backup
```

## 🎯 Gelecek Özellikler

- [ ] Daha fazla multiplayer oyunu
- [ ] Kullanıcı hesapları
- [ ] Turnuva sistemi
- [ ] Özel oda oluşturma
- [ ] Sesli chat
- [ ] Mobil uygulama

## 📞 İletişim

Bu proje Burak tarafından geliştirilmiştir.
Herhangi bir sorun yaşarsanız lütfen bildirin!

---

**🎮 İyi eğlenceler!**