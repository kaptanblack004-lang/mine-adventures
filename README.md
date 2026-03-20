# 🧠 Kelime Savaşı - Online Bilgi Yarışması

Mynet tarzı modern, interaktif ve eğlenceli kelime yarışması oyunu! Zekini test et, arkadaşlarınla yarış ve liderlik tablosunda zirveye tırman!

## ✨ Özellikler

### 🎮 Oyun Modları
- **Hızli Oyun** - Anında eşleşme ve hızlı oyun
- **Oda Oluştur** - Kendi odanı oluştur, ayarları belirle
- **Odaya Katıl** - Arkadaşlarının odasına katıl
- **Farklı Kategoriler** - Genel Kültür, Bilim, Spor, Müzik ve daha fazlası

### 🏆 Yarışma Sistemi
- **Real-time PvP** - Gerçek zamanlı çok oyunculu mücadele
- **Liderlik Tablosu** - Günlük, haftalık, aylık ve tüm zamanlar
- **Seviye Sistemi** - XP kazan ve seviye atla
- **Başırmlar** - Özel başarımlar kilitle
- **İstatistikler** - Detaylı oyun istatistikleri

### 💬 Sosyal Özellikler
- **Canlı Sohbet** - Oyun içi sohbet ve emoji desteği
- **Profil Sistemi** - Kişisel profil ve istatistikler
- **Arkadaş Listesi** - Arkadaş ekle ve takip et
- **Oyun Geçmişi** - Geçmiş oyunlarını görüntüle

### 🎯 Oyun Mekanikleri
- **Harf Tabanlı** - Verilen harflerle kelime oluştur
- **Zaman Sınırlı** - Hızını test et
- **Güçlendirmeler** - Stratejik avantajlar
- **İpuçları** - Zorlandığında yardım al
- **Puan Sistemi** - Adil ve rekabetçi puanlama

### 🎨 Modern Arayüz
- **Responsive Tasarım** - Mobil, tablet ve desktop uyumlu
- **Dark/Light Tema** - Göz yormayan modern tasarım
- **Animasyonlar** - Akıcı ve etkileyici animasyonlar
- **PWA Desteği** - Kurulum gerektirmeyen web uygulaması

## 🚀 Hızlı Başlangıç

### Kurulum
```bash
# Projeyi klonla
git clone https://github.com/kullanici/mine-adventures.git
cd mine-adventures

# Sunucuyu başlat (isteğe bağlı)
python3 src/python/server.py

# Tarayıcıda aç
# Sadece index.html dosyasını tarayıcıda aç
```

### Oyun Nasıl Oynanır?
1. **Ana Menü** - Hızlı Başla veya Oda Oluştur seçeneklerinden birini seç
2. **Oyun Odası** - Bekle veya arkadaşlarını davet et
3. **Kelime Oluştur** - Verilen harflerle kelime bul
4. **Yarış** - Süre dolmadan en çok skoru elde et
5. **Kazan** - Liderlik tablosunda zirveye çık!

## 🎮 Kontroller

### Klavye
- **Enter** - Kelimeyi gönder
- **ESC** - Ana menüye dön
- **F11** - Tam ekran modu
- **Ctrl+S** - Hızlı kaydet
- **Ctrl+H** - Yardım menüsü

### Mouse/Touch
- **Harflere Tıkla** - Kelime oluştur
- **Butonlar** - Oyun aksiyonları
- **Sohbet** - Mesajlaşma

## 🏗️ Teknik Altyapı

### Frontend
- **HTML5** - Modern web standartları
- **CSS3** - Responsive tasarım ve animasyonlar
- **JavaScript ES6+** - Modern JavaScript özellikleri
- **PWA** - Progressive Web App desteği

### Backend (İsteğe Bağlı)
- **Python Flask** - Hafif ve hızlı sunucu
- **WebSocket** - Real-time iletişim
- **SQLite** - Veritabanı yönetimi
- **REST API** - Modern API yapısı

### Özellikler
- **Real-time Sync** - Anlık veri senkronizasyonu
- **Auto-save** - Otomatik kaydetme
- **Offline Support** - Çevrimdışı mod desteği
- **Performance Optimized** - Hızlı ve optimize edilmiş

## 📁 Proje Yapısı

```
mine-adventures/
├── index.html              # Ana oyun sayfası
├── src/
│   ├── css/
│   │   └── style.css       # Ana stil dosyası
│   ├── js/
│   │   ├── main.js         # Ana başlatıcı
│   │   ├── game.js         # Oyun motoru
│   │   ├── ui.js           # UI yöneticisi
│   │   └── network.js      # Ağ yöneticisi
│   └── python/
│       └── server.py       # Backend sunucusu
├── assets/
│   ├── images/             # Görseller
│   └── sounds/             # Ses efektleri
├── data/                   # Oyun verileri
├── requirements.txt        # Python bağımlılıkları
└── README.md              # Dokümantasyon
```

## 🎯 Oyun Stratejileri

### Başlangıç Seviyesi
- **Kısa Kelimeler** - 3-4 harfli kelimelerle başla
- **Hız** - Süre önemli, hızlı düşün
- **Güçlendirmeler** - Stratejik kullan

### İleri Seviye
- **Uzun Kelimeler** - Bonus puanlar kazan
- **Kategori Bilgisi** - Kategorilere hakim ol
- **Rakip Analizi** - Rakiplerini tanı

### Usta Seviye
- **Kombinezonlar** - Harf kombinasyonlarını keşfet
- **Zaman Yönetimi** - Zamanı verimli kullan
- **Psikoloji** - Rakiplerini oku

## 🏆 Puanlama Sistemi

### Temel Puanlama
- **Her Harf** - 10 puan
- **3-4 Harfli** - 10-40 puan
- **5-6 Harfli** - 50-60 puan + 20 bonus
- **7+ Harfli** - 70+ puan + 50 bonus

### Bonuslar
- **Seri Bonus** - 5+ kelime +100 puan
- **Hız Bonus** - 10 saniye altı +50 puan
- **Mükemmel** - Tüm harfleri kullan +200 puan
- **Kategori Ustası** - Kategori rekoru +150 puan

## 🌱 Geliştirme

### Katkıda Bulunma
1. Fork yap
2. Feature branch oluştur
3. Değişiklikleri yap
4. Pull request gönder

### Geliştirme Ortamı
```bash
# Geliştirme sunucusunu başlat
python3 -m http.server 8000

# Live reload için
npm install -g live-server
live-server

# Python backend için
pip install -r requirements.txt
python3 src/python/server.py
```

### TODO Listesi
- [ ] Mobil uygulama (React Native)
- [ ] AI rakip sistemi
- [ ] Turnuva modu
- [ ] Sesli sohbet
- [ ] Video konferans
- [ ] Özel avatarlar
- [ ] Kozmetik itemler
- [ ] Season pass sistemi

## 🐛 Hata Bildirimi

Hata bulduysanız veya öneriniz varsa:
- **GitHub Issues** - Hata bildirimi
- **Discord** - Canlı destek
- **E-posta** - İletişim

## 📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır.

## 🎉 Teşekkürler

- Tüm katkıda bulunan geliştiricilere
- Beta testçilerimize
- Oyuncu topluluğumuza

---

**🧠 Kelime Savaşı - Zeka bir yarıştır!**

**Oyunu oyna, zekini test et, zirveye tırman!** 🏆

**Web Sitesi**: [kelimesavasi.com](https://kelimesavasi.com)  
**Discord**: [Sunucumuza katılın](https://discord.gg/kelimesavasi)  
**GitHub**: [Projeyi fork'layın](https://github.com/kullanici/mine-adventures)
