#!/bin/bash

# Kelime Savaşı - Başlatma Scripti
# Oyunu ve sunucuyu başlatır

echo "🧠 Kelime Savaşı Başlatılıyor..."
echo "================================"

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Proje dizini
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${BLUE}📁 Proje Dizini: $PROJECT_DIR${NC}"

# Python kontrolü
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Python3 bulundu${NC}"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    echo -e "${GREEN}✅ Python bulundu${NC}"
    PYTHON_CMD="python"
else
    echo -e "${RED}❌ Python bulunamadı! Lütfen Python 3.7+ kurun.${NC}"
    exit 1
fi

# Node.js kontrolü (isteğe bağlı)
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js bulundu${NC}"
    NODE_CMD="node"
else
    echo -e "${YELLOW}⚠️  Node.js bulunamadı (isteğe bağlı)${NC}"
fi

# Bağımlılıkları kontrol et
echo -e "${BLUE}📦 Bağımlılıklar kontrol ediliyor...${NC}"

# Python bağımlılıkları
if [ -f "requirements.txt" ]; then
    echo -e "${YELLOW}🐍 Python bağımlılıkları kuruluyor...${NC}"
    $PYTHON_CMD -m pip install -r requirements.txt --user
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Python bağımlılıkları kuruldu${NC}"
    else
        echo -e "${RED}❌ Python bağımlılıkları kurulamadı${NC}"
    fi
fi

# Menü
echo -e "${PURPLE}"
echo "================================"
echo "🧠 Kelime Savaşı - Başlatma Menüsü"
echo "================================"
echo "1) Sadece Oyunu Başlat (Tek Oyuncu)"
echo "2) Sunucuyu Başlat (Çok Oyunculu)"
echo "3) Oyun + Sunucu (Tam Sürüm)"
echo "4) Geliştirici Modu"
echo "5) Tarayıcıda Aç"
echo "6) Çıkış"
echo -e "${NC}"

read -p "Seçiminiz (1-6): " choice

case $choice in
    1)
        echo -e "${GREEN}🎮 Oyun başlatılıyor...${NC}"
        
        # Basit HTTP sunucu başlat
        echo -e "${CYAN}📡 HTTP sunucusu başlatılıyor...${NC}"
        $PYTHON_CMD -m http.server 8000 &
        HTTP_PID=$!
        
        # Tarayıcıda aç
        echo -e "${YELLOW}🌐 Tarayıcıda açılıyor...${NC}"
        sleep 2
        
        if command -v xdg-open &> /dev/null; then
            xdg-open "http://localhost:8000"
        elif command -v open &> /dev/null; then
            open "http://localhost:8000"
        elif command -v start &> /dev/null; then
            start "http://localhost:8000"
        else
            echo -e "${YELLOW}⚠️  Tarayıcı otomatik açılamadı. Lütfen şu adresi açın:${NC}"
            echo "http://localhost:8000"
        fi
        
        echo -e "${GREEN}✅ Oyun başlatıldı!${NC}"
        echo -e "${BLUE}📡 Sunucu PID: $HTTP_PID${NC}"
        echo -e "${YELLOW}Sunucuyu durdurmak için: kill $HTTP_PID${NC}"
        
        # Kullanıcı çıkış yapana kadar bekle
        echo -e "${CYAN}Çıkmak için Ctrl+C tuşlarına basın...${NC}"
        wait $HTTP_PID
        ;;
        
    2)
        echo -e "${GREEN}🌐 Sunucu başlatılıyor...${NC}"
        
        if [ -f "src/python/server.py" ]; then
            cd src/python
            $PYTHON_CMD server.py
        else
            echo -e "${RED}❌ Sunucu dosyası bulunamadı!${NC}"
        fi
        ;;
        
    3)
        echo -e "${GREEN}🚀 Tam sürüm başlatılıyor...${NC}"
        
        # Sunucuyu arka planda başlat
        if [ -f "src/python/server.py" ]; then
            echo -e "${YELLOW}🌐 Sunucu arka planda başlatılıyor...${NC}"
            cd src/python
            $PYTHON_CMD server.py &
            SERVER_PID=$!
            cd ../..
            
            # Sunucunun başlamasını bekle
            sleep 3
            
            # HTTP sunucusu başlat
            echo -e "${YELLOW}📡 HTTP sunucusu başlatılıyor...${NC}"
            $PYTHON_CMD -m http.server 8000 &
            HTTP_PID=$!
            
            # Tarayıcıda oyunu aç
            echo -e "${YELLOW}🎮 Oyun tarayıcıda açılıyor...${NC}"
            sleep 2
            
            if command -v xdg-open &> /dev/null; then
                xdg-open "http://localhost:8000"
            elif command -v open &> /dev/null; then
                open "http://localhost:8000"
            elif command -v start &> /dev/null; then
                start "http://localhost:8000"
            fi
            
            echo -e "${GREEN}✅ Tam sürüm başlatıldı!${NC}"
            echo -e "${BLUE}🌐 Sunucu PID: $SERVER_PID${NC}"
            echo -e "${BLUE}📡 HTTP PID: $HTTP_PID${NC}"
            echo -e "${YELLOW}Sunucuları durdurmak için: kill $SERVER_PID $HTTP_PID${NC}"
            
            # Kullanıcı çıkış yapana kadar bekle
            echo -e "${CYAN}Çıkmak için Ctrl+C tuşlarına basın...${NC}"
            wait $HTTP_PID
            
            # Temizlik
            kill $SERVER_PID 2>/dev/null
        else
            echo -e "${RED}❌ Sunucu dosyası bulunamadı!${NC}"
        fi
        ;;
        
    4)
        echo -e "${GREEN}🛠️  Geliştirici modu başlatılıyor...${NC}"
        
        # Live server (varsa)
        if command -v live-server &> /dev/null; then
            echo -e "${YELLOW}🔄 Live server başlatılıyor...${NC}"
            live-server --port=8080 --open=/index.html
        else
            # Python HTTP sunucusu
            echo -e "${YELLOW}📡 Geliştirici sunucusu başlatılıyor...${NC}"
            $PYTHON_CMD -m http.server 8080
            
            if command -v xdg-open &> /dev/null; then
                xdg-open "http://localhost:8080"
            elif command -v open &> /dev/null; then
                open "http://localhost:8080"
            fi
        fi
        ;;
        
    5)
        echo -e "${GREEN}🌐 Tarayıcıda açılıyor...${NC}"
        
        if [ -f "index.html" ]; then
            if command -v xdg-open &> /dev/null; then
                xdg-open "file://$PROJECT_DIR/index.html"
            elif command -v open &> /dev/null; then
                open "file://$PROJECT_DIR/index.html"
            elif command -v start &> /dev/null; then
                start "file://$PROJECT_DIR/index.html"
            else
                echo -e "${YELLOW}⚠️  Tarayıcı otomatik açılamadı.${NC}"
                echo "Lütfen şu adresi manuel olarak açın:"
                echo "file://$PROJECT_DIR/index.html"
            fi
        else
            echo -e "${RED}❌ index.html dosyası bulunamadı!${NC}"
        fi
        ;;
        
    6)
        echo -e "${YELLOW}👋 Çıkış yapılıyor...${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Geçersiz seçim!${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}"
echo "================================"
echo "🧠 Kelime Savaşı Hazır!"
echo "================================"
echo -e "${NC}"

# Bilgiler
echo -e "${BLUE}📋 Kısayollar:${NC}"
echo "• Oyun Kontrolleri: Mouse + Klavye"
echo "• Kelime Gönder: Enter tuşu"
echo "• Ana Menü: ESC tuşu"
echo "• Tam Ekran: F11 tuşu"
echo "• Hızlı Kaydet: Ctrl+S"

echo -e "${BLUE}📁 Dosyalar:${NC}"
echo "• Oyun Dosyası: $PROJECT_DIR/index.html"
echo "• Sunucu Dosyası: $PROJECT_DIR/src/python/server.py"
echo "• Kayıtlar: Tarayıcı LocalStorage"

echo ""
echo -e "${PURPLE}🎯 İyi oyunlar ve bol puanlar!${NC}"
