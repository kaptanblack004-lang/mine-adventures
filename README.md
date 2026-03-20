# Mine'in Maceraları - Interaktif Web Hikaye Oyunu

🎮 Mine için özel olarak tasarlanmış, interaktif hikaye tabanlı web oyunu!

## 🌟 Özellikler

### 📚 Hikaye Modu
- **6 Bölümlük Epik Macera**: Kristal Kale'den Taç Giyme'ye kadar
- **Interaktif Seçimler**: Her seçim hikayeyi etkiler
- **Karakter Gelişimi**: Cesaret, bilgelik ve sevgi özellikleri
- **Farklı Sonlar**: Yaptığın seçimlere göre 5 farklı sonu

### 🎮 Mini Oyunlar
- **Hafıza Oyunu**: Kart eşleştirme
- **Refleks Oyunu**: Hedefe hızlı tıklama
- **Bulmaca Oyunu**: 3x3 sliding puzzle
- **Bilgi Yarışması**: Mine hikayesi soruları
- **Ritim Oyunu**: Müzikal ritim takibi
- **Kristal Toplama**: Zamanlı toplama oyunu

### 🎨 Tasarım
- **Modern ve Eğlenceli UI**: Gradient arka planlar, animasyonlar
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Partikül Efektleri**: Yıldızlar ve parıltılar
- **Smooth Animasyonlar**: Geçişler ve hover efektleri

### 🔧 Teknik Özellikler
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python Flask
- **Veri Yönetimi**: RESTful API
- **Local Storage**: Oyun kaydetme
- **Ses Efektleri**: Arka plan müziği ve efektler

## 🚀 Kurulum

### Gereksinimler
- Python 3.7+
- Modern web tarayıcısı

### Adımlar
1. **Projeyi indir/kopyala**
2. **Python bağımlılıklarını kur:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Flask sunucusunu başlat:**
   ```bash
   python backend/app.py
   ```
4. **Tarayıcıda aç:**
   ```
   http://localhost:5000
   ```

## 🎮 Oynanış

### Başlangıç
1. Giriş ekranında "Maceraya Başla" butonuna tıkla
2. Bölüm seçim ekranından Bölüm 1'i seç
3. Hikaye oku ve seçimlerini yap

### Kontroller
- **Mouse**: Tüm interaktif elementler
- **Klavye Kısayolları:**
  - `I`: Envanteri aç/kapat
  - `M`: Haritayı aç/kapat
  - `P`: Oyunu duraklat
  - `ESC`: Tüm pencereleri kapat

### Bölümler
1. **Kristal Kale'nin Sırrı**: Başlangıç macerası
2. **Gizemli Orman**: Doğa sırları
3. **Kaybolmuş Anahtarlar**: Bulmaca çözme
4. **Ejderhanın Yolu**: Dostluk veya savaş
5. **Sihirli Kristaller**: Final denemeleri
6. **Taç Giyme**: Liderlik testi

### Mini Oyunlar
- Her bölümde farklı mini oyunlar
- Skorlar ana oyuna eklenir
- Zorluk seviyeleri artar

## 📊 API Endpoint'leri

### Oyun Verileri
- `GET /api/game-data` - Tüm oyun verileri
- `GET /api/player-stats` - Oyuncu istatistikleri
- `GET /api/chapters` - Bölüm bilgileri
- `POST /api/update-stats` - İstatistik güncelleme

### Hikaye
- `GET /api/story/<chapter_id>` - Bölüm hikayesi
- `POST /api/make-choice` - Seçim yapma

### Mini Oyunlar
- `GET /api/mini-game/<game_type>` - Oyun verisi
- `POST /api/save-game` - Oyun kaydetme
- `GET /api/load-game` - Oyun yükleme

## 🎯 Hedefler

### Oyuncu Hedefleri
- Tüm 6 bölümü tamamlamak
- Tüm kristalleri toplamak
- Tüm mini oyunları oynamak
- Tüm başarımları kilitlemek
- Farklı sonları keşfetmek

### Teknik Hedefler
- Smooth kullanıcı deneyimi
- Hızlı yükleme süreleri
- Mobil uyumluluk
- Erişilebilirlik
- Performans optimizasyonu

## 🛠️ Geliştirme

### Proje Yapısı
```
mine_hikaye/
├── index.html              # Ana sayfa
├── static/
│   ├── css/
│   │   └── style.css       # Ana stil dosyası
│   ├── js/
│   │   ├── main.js         # Ana oyun motoru
│   │   ├── story.js        # Hikaye yönetimi
│   │   └── mini-games.js   # Mini oyunlar
│   ├── images/             # Görseller
│   └── sounds/             # Ses dosyaları
├── templates/              # HTML şablonları
├── backend/
│   └── app.py              # Flask backend
├── requirements.txt        # Python bağımlılıkları
└── README.md               # Bu dosya
```

### Özelleştirme
- **Hikaye**: `story.js` dosyasından düzenlenebilir
- **Oyun Mekanikleri**: `main.js` dosyasından özelleştirilebilir
- **Tasarım**: `style.css` dosyasından değiştirilebilir
- **API**: `backend/app.py` dosyasından genişletilebilir

## 🎨 Tasarım Kararları

### Renk Paleti
- Ana gradient: `#ff6b6b` → `#4ecdc4` → `#45b7d1` → `#96ceb4` → `#ffeaa7`
- Oyun ekranı: `#1e3c72` → `#2a5298`
- Modal arka plan: `#667eea` → `#764ba2`

### Tipografi
- Ana font: 'Comfortaa' (Google Fonts)
- Boyutlar: Mobile-first yaklaşım
- Ağırlıklar: 300, 400, 600, 700

### Animasyonlar
- Giriş: `fadeInUp` 1.5s
- Parıltı: `glow` 2s infinite
- Yüzen elementler: `float` 6s infinite
- Geçişler: 0.3s ease

## 🚀 Gelecek Planları

### V1.1 Özellikler
- [ ] Çoklu oyuncu desteği
- [ ] Daha fazla mini oyun
- [ ] Seslendirme
- [ ] Başarımlar sistemi
- [ ] Liderlik tablosu

### V2.0 Özellikler
- [ ] Mobil uygulama
- [ ] VR desteği
- [ ] Yapay zeka karakterler
- [ ] Gerçek zamanlı olaylar
- [ ] Sosyal özellikler

## 🐞 Hata Raporlama

Bugs ve öneriler için:
- GitHub Issues
- E-posta: mine@hikaye.com
- Discord: Mine'in Maceraları

## 📄 Lisans

Bu proje MIT Lisansı altında dağıtılmaktadır.

## 🙏 Teşekkürler

- Mine'e özel olarak tasarlandı ❤️
- Tüm test eden arkadaşlara
- Açık kaynak topluluğuna

---

**Made with ❤️ for Mine**

*Unutma, her seçimin bir anlamı var!* ✨
