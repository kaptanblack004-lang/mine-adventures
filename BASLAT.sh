#!/bin/bash

# Minecraft Pro - Başlatma Scripti
# Oyunu ve sunucuyu başlatır

echo "🎮 Minecraft Pro Başlatılıyor..."
echo "================================"

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
echo -e "${BLUE}"
echo "================================"
echo "🎮 Minecraft Pro - Başlatma Menüsü"
echo "================================"
echo "1) Sadece Oyunu Başlat (Tek Oyuncu)"
echo "2) Sunucuyu Başlat (Çok Oyunculu)"
echo "3) Oyun + Sunucu (Tam Sürüm)"
echo "4) Tarayıcıda Aç"
echo "5) Çıkış"
echo -e "${NC}"

read -p "Seçiminiz (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}🎮 Oyun başlatılıyor...${NC}"
        
        # Tarayıcıda aç
        if command -v xdg-open &> /dev/null; then
            xdg-open "file://$PROJECT_DIR/index.html"
        elif command -v open &> /dev/null; then
            open "file://$PROJECT_DIR/index.html"
        elif command -v start &> /dev/null; then
            start "file://$PROJECT_DIR/index.html"
        else
            echo -e "${YELLOW}⚠️  Tarayıcı otomatik açılamadı. Lütfen şu adresi açın:${NC}"
            echo "file://$PROJECT_DIR/index.html"
        fi
        
        echo -e "${GREEN}✅ Oyun başlatıldı!${NC}"
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
            
            # Tarayıcıda oyunu aç
            echo -e "${YELLOW}🎮 Oyun tarayıcıda açılıyor...${NC}"
            if command -v xdg-open &> /dev/null; then
                xdg-open "file://$PROJECT_DIR/index.html"
            elif command -v open &> /dev/null; then
                open "file://$PROJECT_DIR/index.html"
            elif command -v start &> /dev/null; then
                start "file://$PROJECT_DIR/index.html"
            fi
            
            echo -e "${GREEN}✅ Tam sürüm başlatıldı!${NC}"
            echo -e "${BLUE}Sunucu PID: $SERVER_PID${NC}"
            echo -e "${YELLOW}Sunucuyu durdurmak için: kill $SERVER_PID${NC}"
        else
            echo -e "${RED}❌ Sunucu dosyası bulunamadı!${NC}"
        fi
        ;;
        
    4)
        echo -e "${GREEN}🌐 Tarayıcıda açılıyor...${NC}"
        
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
        ;;
        
    5)
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
echo "🎮 Minecraft Pro Hazır!"
echo "================================"
echo -e "${NC}"

# Bilgiler
echo -e "${BLUE}📋 Kısayollar:${NC}"
echo "• Oyun Kontrolleri: WASD + Boşluk + Mouse"
echo "• Envanter: E tuşu"
echo "• Crafting: C tuşu (masa yanındayken)"
echo "• Menü: ESC tuşu"
echo "• FPS: F3 tuşu"
echo "• Hızlı Kaydet: F5 tuşu"
echo "• Debug: Ctrl+G tuşu"

echo -e "${BLUE}📁 Dosyalar:${NC}"
echo "• Oyun Dosyası: $PROJECT_DIR/index.html"
echo "• Kayıtlar: Tarayıcı LocalStorage"
echo "• Sunucu Log: src/python/server.py"

echo ""
echo -e "${GREEN}🎯 Arkadaşına iyi oyunlar!${NC}"
