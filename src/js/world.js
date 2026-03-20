// Minecraft Pro - Dünya Sistemi
class World {
    constructor(game) {
        this.game = game;
        this.blocks = [];
        this.chunkSize = 16;
        this.worldHeight = 256;
        this.worldWidth = 100;
        this.seed = Math.random() * 10000;
        
        // Blok tipleri
        this.blockTypes = {
            air: { color: 'transparent', solid: false },
            grass: { color: '#7CB342', solid: true },
            dirt: { color: '#8D6E63', solid: true },
            stone: { color: '#757575', solid: true },
            wood: { color: '#8D6E63', solid: true },
            leaves: { color: '#4CAF50', solid: false },
            water: { color: '#2196F3', solid: false },
            sand: { color: '#FDD835', solid: true },
            snow: { color: '#FFFFFF', solid: true },
            coal: { color: '#424242', solid: true },
            iron: { color: '#BDBDBD', solid: true },
            gold: { color: '#FFD700', solid: true },
            diamond: { color: '#00BCD4', solid: true },
            wheat: { color: '#FDD835', solid: false }
        };
        
        this.generate();
    }
    
    generate() {
        console.log('Dünya生成iliyor...');
        
        // Basit procedural generation
        for (let x = 0; x < this.worldWidth; x++) {
            for (let y = 0; y < this.worldHeight; y++) {
                const blockType = this.generateBlockType(x, y);
                if (blockType !== 'air') {
                    this.blocks.push({
                        x: x * 32,
                        y: y * 32,
                        type: blockType,
                        health: 100
                    });
                }
            }
        }
        
        // Ağaçlar ekle
        this.generateTrees();
        
        // Mağaralar ekle
        this.generateCaves();
        
        console.log(`Dünya oluşturuldu: ${this.blocks.length} blok`);
    }
    
    generateBlockType(x, y) {
        // Yüzey yüksekliği hesapla (Perlin noise basitleştirilmiş)
        const surfaceHeight = Math.floor(
            64 + 
            Math.sin(x * 0.1) * 10 + 
            Math.cos(x * 0.05) * 5 +
            Math.sin(x * 0.2) * 3
        );
        
        if (y > surfaceHeight) {
            return 'air';
        }
        
        if (y === surfaceHeight) {
            return 'grass';
        }
        
        if (y > surfaceHeight - 3) {
            return 'dirt';
        }
        
        if (y > surfaceHeight - 10) {
            return 'stone';
        }
        
        // Derinliklere göre madenler
        const rand = Math.random();
        if (y < 30 && rand < 0.05) return 'diamond';
        if (y < 50 && rand < 0.08) return 'gold';
        if (y < 70 && rand < 0.12) return 'iron';
        if (y < 90 && rand < 0.15) return 'coal';
        
        return 'stone';
    }
    
    generateTrees() {
        // Rastgele ağaçlar oluştur
        const treeCount = Math.floor(Math.random() * 10) + 5;
        
        for (let i = 0; i < treeCount; i++) {
            const x = Math.floor(Math.random() * this.worldWidth) * 32;
            const surfaceY = this.getSurfaceHeight(x);
            
            if (surfaceY > 0) {
                this.generateTree(x, surfaceY - 32);
            }
        }
    }
    
    generateTree(x, y) {
        // Gövde
        const trunkHeight = Math.floor(Math.random() * 3) + 4;
        for (let i = 0; i < trunkHeight; i++) {
            this.blocks.push({
                x: x,
                y: y - (i * 32),
                type: 'wood',
                health: 100
            });
        }
        
        // Yapraklar
        const leafRadius = 3;
        for (let dx = -leafRadius; dx <= leafRadius; dx++) {
            for (let dy = -leafRadius; dy <= leafRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= leafRadius && Math.random() > 0.3) {
                    this.blocks.push({
                        x: x + (dx * 32),
                        y: y - (trunkHeight * 32) + (dy * 32),
                        type: 'leaves',
                        health: 100
                    });
                }
            }
        }
    }
    
    generateCaves() {
        // Basit mağara sistemi
        const caveCount = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < caveCount; i++) {
            const startX = Math.floor(Math.random() * this.worldWidth) * 32;
            const startY = Math.floor(Math.random() * 100) + 50;
            const caveLength = Math.floor(Math.random() * 50) + 20;
            
            let currentX = startX;
            let currentY = startY;
            let direction = Math.random() * Math.PI * 2;
            
            for (let j = 0; j < caveLength; j++) {
                // Mağara bloklarını temizle
                this.removeBlock(currentX, currentY, 64);
                
                // Rastgele yönde devam et
                direction += (Math.random() - 0.5) * 0.5;
                currentX += Math.cos(direction) * 32;
                currentY += Math.sin(direction) * 16;
                
                if (currentY < 20) currentY = 20;
                if (currentY > 200) currentY = 200;
            }
        }
    }
    
    getSurfaceHeight(x) {
        let highest = 0;
        for (const block of this.blocks) {
            if (Math.abs(block.x - x) < 16 && block.y > highest) {
                highest = block.y;
            }
        }
        return highest;
    }
    
    update(deltaTime) {
        // Dünya güncellemeleri (su akışı, bitki büyümesi vb.)
        this.updateWater(deltaTime);
        this.updatePlants(deltaTime);
    }
    
    updateWater(deltaTime) {
        // Basit su fiziği
        const waterBlocks = this.blocks.filter(b => b.type === 'water');
        
        waterBlocks.forEach(water => {
            // Aşağı akış
            const below = this.getBlockAt(water.x, water.y + 32);
            if (!below || !this.blockTypes[below.type].solid) {
                water.y += 2;
            } else {
                // Yanlara akış
                const left = this.getBlockAt(water.x - 32, water.y);
                const right = this.getBlockAt(water.x + 32, water.y);
                
                if (!left || !this.blockTypes[left.type].solid) {
                    water.x -= 1;
                } else if (!right || !this.blockTypes[right.type].solid) {
                    water.x += 1;
                }
            }
        });
    }
    
    updatePlants(deltaTime) {
        // Bitki büyümesi
        const plants = this.blocks.filter(b => b.type === 'wheat');
        
        plants.forEach(plant => {
            // Basit büyüme mekanikası
            if (Math.random() < 0.001) {
                plant.growth = (plant.growth || 0) + 1;
                if (plant.growth > 7) {
                    plant.growth = 7;
                }
            }
        });
    }
    
    render(ctx) {
        // Kamera pozisyonuna göre blokları çiz
        const viewLeft = this.game.camera.x;
        const viewRight = this.game.camera.x + ctx.canvas.width;
        const viewTop = this.game.camera.y;
        const viewBottom = this.game.camera.y + ctx.canvas.height;
        
        // Görünür blokları filtrele
        const visibleBlocks = this.blocks.filter(block => {
            return block.x + 32 >= viewLeft &&
                   block.x <= viewRight &&
                   block.y + 32 >= viewTop &&
                   block.y <= viewBottom;
        });
        
        // Blokları çiz (arkadan öne doğru)
        visibleBlocks.sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });
        
        visibleBlocks.forEach(block => {
            this.renderBlock(ctx, block);
        });
    }
    
    renderBlock(ctx, block) {
        const x = block.x - this.game.camera.x;
        const y = block.y - this.game.camera.y;
        const size = 32;
        
        const blockType = this.blockTypes[block.type];
        if (!blockType || block.type === 'air') return;
        
        ctx.save();
        
        // Gölgeler
        if (blockType.solid) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(x + 2, y + 2, size, size);
        }
        
        // Ana blok
        ctx.fillStyle = blockType.color;
        ctx.fillRect(x, y, size, size);
        
        // Blok detayları
        this.renderBlockDetails(ctx, block, x, y, size);
        
        // Hasar efekti
        if (block.health < 100) {
            ctx.fillStyle = `rgba(255, 0, 0, ${(100 - block.health) / 100 * 0.5})`;
            ctx.fillRect(x, y, size, size);
        }
        
        // Çerçeve
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
        
        ctx.restore();
    }
    
    renderBlockDetails(ctx, block, x, y, size) {
        switch (block.type) {
            case 'grass':
                // Çim detayı
                ctx.fillStyle = '#689F38';
                ctx.fillRect(x, y, size, size / 4);
                break;
                
            case 'wood':
                // Odun dokusu
                ctx.strokeStyle = '#6D4C41';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + size/4, y);
                ctx.lineTo(x + size/4, y + size);
                ctx.moveTo(x + size/2, y);
                ctx.lineTo(x + size/2, y + size);
                ctx.moveTo(x + size*3/4, y);
                ctx.lineTo(x + size*3/4, y + size);
                ctx.stroke();
                break;
                
            case 'leaves':
                // Yaprak detayı
                ctx.fillStyle = '#388E3C';
                for (let i = 0; i < 5; i++) {
                    const px = x + Math.random() * size;
                    const py = y + Math.random() * size;
                    ctx.fillRect(px, py, 4, 4);
                }
                break;
                
            case 'stone':
                // Taş dokusu
                ctx.fillStyle = '#616161';
                ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                break;
                
            case 'water':
                // Su animasyonu
                const wave = Math.sin(Date.now() * 0.001) * 2;
                ctx.fillStyle = 'rgba(33, 150, 243, 0.8)';
                ctx.fillRect(x, y + wave, size, size - wave);
                break;
                
            case 'wheat':
                // Buğday detayı
                const growth = block.growth || 0;
                const height = 8 + growth * 2;
                ctx.fillStyle = '#FDD835';
                ctx.fillRect(x + size/2 - 2, y + size - height, 4, height);
                break;
        }
    }
    
    getBlockAt(x, y) {
        return this.blocks.find(block => 
            Math.abs(block.x - x) < 16 && 
            Math.abs(block.y - y) < 16
        );
    }
    
    breakBlock(x, y) {
        const block = this.getBlockAt(x, y);
        if (block && this.blockTypes[block.type].solid) {
            // Partikül efekti
            for (let i = 0; i < 10; i++) {
                this.game.addParticle(
                    block.x + 16, 
                    block.y + 16, 
                    'break'
                );
            }
            
            // Bloğu kaldır
            const index = this.blocks.indexOf(block);
            this.blocks.splice(index, 1);
            
            // Envantere ekle
            this.addToInventory(block.type);
            
            return true;
        }
        return false;
    }
    
    placeBlock(x, y, blockType) {
        if (!blockType) return false;
        
        // Mevcut blok var mı kontrol et
        const existing = this.getBlockAt(x, y);
        if (existing) return false;
        
        // Yeni blok ekle
        this.blocks.push({
            x: Math.floor(x / 32) * 32,
            y: Math.floor(y / 32) * 32,
            type: blockType,
            health: 100
        });
        
        // Partikül efekti
        for (let i = 0; i < 5; i++) {
            this.game.addParticle(x, y, 'place');
        }
        
        // Envanterden çıkar
        this.removeFromInventory(blockType);
        
        return true;
    }
    
    removeBlock(x, y, radius) {
        const blocksToRemove = this.blocks.filter(block => {
            const distance = Math.sqrt(
                Math.pow(block.x - x, 2) + 
                Math.pow(block.y - y, 2)
            );
            return distance < radius;
        });
        
        blocksToRemove.forEach(block => {
            const index = this.blocks.indexOf(block);
            if (index > -1) {
                this.blocks.splice(index, 1);
            }
        });
    }
    
    addToInventory(blockType) {
        // Envantere blok ekle (basit sistem)
        const slots = document.querySelectorAll('.inventory-slot');
        
        for (const slot of slots) {
            const icon = slot.querySelector('.item-icon');
            const count = slot.querySelector('.item-count');
            
            if (!icon.textContent) {
                // Boş slot bul
                const blockIcons = {
                    'wood': '🪵',
                    'stone': '🪨',
                    'wheat': '🌾',
                    'grass': '🌱',
                    'dirt': '🟫',
                    'sand': '🏖️',
                    'leaves': '🍃'
                };
                
                icon.textContent = blockIcons[blockType] || '📦';
                count.textContent = '1';
                break;
            } else if (count.textContent && parseInt(count.textContent) < 64) {
                // Mevcut slotu artır
                count.textContent = parseInt(count.textContent) + 1;
                break;
            }
        }
    }
    
    removeFromInventory(blockType) {
        // Envanterden blok çıkar
        const slots = document.querySelectorAll('.inventory-slot');
        
        for (const slot of slots) {
            const icon = slot.querySelector('.item-icon');
            const count = slot.querySelector('.item-count');
            
            if (icon.textContent && count.textContent) {
                const currentCount = parseInt(count.textContent);
                if (currentCount > 1) {
                    count.textContent = currentCount - 1;
                } else {
                    icon.textContent = '';
                    count.textContent = '';
                }
                break;
            }
        }
    }
    
    getSaveData() {
        return {
            blocks: this.blocks,
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
            seed: this.seed
        };
    }
    
    loadSaveData(data) {
        this.blocks = data.blocks || [];
        this.worldWidth = data.worldWidth || 100;
        this.worldHeight = data.worldHeight || 256;
        this.seed = data.seed || Math.random() * 10000;
    }
}
