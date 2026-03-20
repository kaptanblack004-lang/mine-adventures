// Minecraft Pro - Oyuncu Sistemi
class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.z = 0; // 3D derinlik
        
        // Fizik özellikleri
        this.width = 24;
        this.height = 48;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 12;
        this.gravity = 0.5;
        this.onGround = false;
        
        // Animasyon
        this.animationFrame = 0;
        this.facing = 'right'; // 'left' veya 'right'
        this.isWalking = false;
        this.isJumping = false;
        
        // Oyuncu durumu
        this.health = 100;
        this.hunger = 100;
        this.experience = 0;
        this.level = 1;
        
        // Ekipman
        this.selectedSlot = 0;
        this.inventory = [];
        
        // Yetenekler
        this.abilities = {
            doubleJump: false,
            speed: false,
            nightVision: false
        };
        
        // Efektler
        this.effects = [];
        this.particleTimer = 0;
        
        this.init();
    }
    
    init() {
        // Başlangıç envanteri
        this.inventory = [
            { type: 'wood', count: 64 },
            { type: 'stone', count: 32 },
            { type: 'wheat', count: 16 }
        ];
        
        // Event listener'ları ayarla
        this.setupInventoryControls();
    }
    
    setupInventoryControls() {
        // Sayı tuşları ile envanter slot seçimi
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.selectedSlot = parseInt(e.key) - 1;
                this.updateInventorySelection();
            }
        });
        
        // Mouse scroll ile envanter değiştirme
        this.game.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.selectedSlot = (this.selectedSlot + 1) % 9;
            } else {
                this.selectedSlot = (this.selectedSlot - 1 + 9) % 9;
            }
            this.updateInventorySelection();
        });
        
        // Envanter slot tıklama
        document.querySelectorAll('.inventory-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectedSlot = index;
                this.updateInventorySelection();
            });
        });
    }
    
    updateInventorySelection() {
        // Tüm slotlardan seçimi kaldır
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Seçili slotu işaretle
        const selectedSlot = document.querySelector(`.inventory-slot[data-slot="${this.selectedSlot}"]`);
        if (selectedSlot) {
            selectedSlot.classList.add('selected');
        }
    }
    
    update(deltaTime) {
        // Input işle
        this.handleInput();
        
        // Fiziği uygula
        this.applyPhysics(deltaTime);
        
        // Çarpışmaları kontrol et
        this.checkCollisions();
        
        // Animasyonları güncelle
        this.updateAnimations(deltaTime);
        
        // Efektleri güncelle
        this.updateEffects(deltaTime);
        
        // Partikülleri güncelle
        this.updateParticles(deltaTime);
        
        // Kamerayı güncelle
        this.updateCamera();
        
        // Oyuncu durumunu güncelle
        this.updatePlayerStats(deltaTime);
    }
    
    handleInput() {
        // Hareket
        let moveX = 0;
        
        if (this.game.keys['a'] || this.game.keys['arrowleft']) {
            moveX -= this.speed;
            this.facing = 'left';
        }
        if (this.game.keys['d'] || this.game.keys['arrowright']) {
            moveX += this.speed;
            this.facing = 'right';
        }
        
        // Zıplama
        if ((this.game.keys[' '] || this.game.keys['w'] || this.game.keys['arrowup']) && this.onGround) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
            this.isJumping = true;
            this.game.playSound('jump');
            
            // Çift zıplama yeteneği
            if (this.abilities.doubleJump && !this.hasDoubleJumped) {
                this.hasDoubleJumped = true;
            }
        } else if ((this.game.keys[' '] || this.game.keys['w']) && !this.onGround && this.abilities.doubleJump && !this.hasDoubleJumped) {
            this.velocityY = -this.jumpPower * 0.8;
            this.hasDoubleJumped = true;
            this.game.addParticle(this.x + this.width/2, this.y + this.height, 'jump');
        }
        
        // Koşma
        if (this.game.keys['shift']) {
            moveX *= 1.5;
        }
        
        // Hız yeteneği
        if (this.abilities.speed) {
            moveX *= 1.3;
        }
        
        this.velocityX = moveX;
        
        // Yürüme durumu
        this.isWalking = Math.abs(moveX) > 0;
    }
    
    applyPhysics(deltaTime) {
        // Yerçekimi
        if (!this.onGround) {
            this.velocityY += this.gravity;
        }
        
        // Hız sınırları
        this.velocityX = Math.max(-this.speed * 2, Math.min(this.speed * 2, this.velocityX));
        this.velocityY = Math.max(-this.jumpPower * 2, Math.min(this.jumpPower * 2, this.velocityY));
        
        // Pozisyonu güncelle
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Sürtünme
        this.velocityX *= 0.8;
        
        // Zemin kontrolü
        if (this.velocityY > 0) {
            this.onGround = false;
        }
    }
    
    checkCollisions() {
        // Dünya blokları ile çarpışma
        const playerBounds = {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
        
        // Yatay çarpışma
        const horizontalBlocks = this.game.world.blocks.filter(block => {
            const blockBounds = {
                left: block.x,
                right: block.x + 32,
                top: block.y,
                bottom: block.y + 32
            };
            
            return this.game.world.blockTypes[block.type].solid &&
                   playerBounds.right > blockBounds.left &&
                   playerBounds.left < blockBounds.right &&
                   playerBounds.bottom > blockBounds.top &&
                   playerBounds.top < blockBounds.bottom;
        });
        
        horizontalBlocks.forEach(block => {
            const blockBounds = {
                left: block.x,
                right: block.x + 32,
                top: block.y,
                bottom: block.y + 32
            };
            
            // Yatay çarpışma çözümü
            if (this.velocityX > 0 && playerBounds.right <= blockBounds.left + this.velocityX) {
                this.x = blockBounds.left - this.width;
                this.velocityX = 0;
            } else if (this.velocityX < 0 && playerBounds.left >= blockBounds.right + this.velocityX) {
                this.x = blockBounds.right;
                this.velocityX = 0;
            }
        });
        
        // Dikey çarpışma
        const verticalBlocks = this.game.world.blocks.filter(block => {
            const blockBounds = {
                left: block.x,
                right: block.x + 32,
                top: block.y,
                bottom: block.y + 32
            };
            
            return this.game.world.blockTypes[block.type].solid &&
                   playerBounds.right > blockBounds.left &&
                   playerBounds.left < blockBounds.right &&
                   playerBounds.bottom > blockBounds.top &&
                   playerBounds.top < blockBounds.bottom;
        });
        
        verticalBlocks.forEach(block => {
            const blockBounds = {
                left: block.x,
                right: block.x + 32,
                top: block.y,
                bottom: block.y + 32
            };
            
            // Dikey çarpışma çözümü
            if (this.velocityY > 0 && playerBounds.bottom <= blockBounds.top + this.velocityY) {
                this.y = blockBounds.top - this.height;
                this.velocityY = 0;
                this.onGround = true;
                this.isJumping = false;
                this.hasDoubleJumped = false;
            } else if (this.velocityY < 0 && playerBounds.top >= blockBounds.bottom + this.velocityY) {
                this.y = blockBounds.bottom;
                this.velocityY = 0;
            }
        });
        
        // Dünya sınırları
        this.x = Math.max(0, Math.min(this.game.world.worldWidth * 32 - this.width, this.x));
        
        // Alt sınır (düşme ölümü)
        if (this.y > this.game.world.worldHeight * 32) {
            this.respawn();
        }
    }
    
    updateAnimations(deltaTime) {
        // Yürüme animasyonu
        if (this.isWalking && this.onGround) {
            this.animationFrame += deltaTime * 0.01;
            if (this.animationFrame > 1) {
                this.animationFrame = 0;
                // Adım partikülleri
                if (Math.random() < 0.3) {
                    this.game.addParticle(
                        this.x + this.width/2,
                        this.y + this.height,
                        'walk'
                    );
                }
            }
        } else {
            this.animationFrame = 0;
        }
        
        // Zıplama animasyonu
        if (this.isJumping) {
            this.animationFrame = 0.5;
        }
    }
    
    updateEffects(deltaTime) {
        // Efekt sürelerini güncelle
        this.effects = this.effects.filter(effect => {
            effect.duration -= deltaTime;
            return effect.duration > 0;
        });
        
        // Efektleri uygula
        this.effects.forEach(effect => {
            switch (effect.type) {
                case 'speed':
                    this.abilities.speed = true;
                    break;
                case 'nightVision':
                    this.abilities.nightVision = true;
                    break;
                case 'doubleJump':
                    this.abilities.doubleJump = true;
                    break;
            }
        });
        
        // Efekt kalmadıysa yetenekleri sıfırla
        if (this.effects.length === 0) {
            this.abilities.speed = false;
            this.abilities.nightVision = false;
            this.abilities.doubleJump = false;
        }
    }
    
    updateParticles(deltaTime) {
        this.particleTimer += deltaTime;
        
        // Yürüme partikülleri
        if (this.isWalking && this.onGround && this.particleTimer > 100) {
            this.game.addParticle(
                this.x + this.width/2,
                this.y + this.height,
                'walk'
            );
            this.particleTimer = 0;
        }
    }
    
    updateCamera() {
        // Kamerayı oyuncuyu takip edecek şekilde ayarla
        this.game.camera.x = this.x - this.game.canvas.width / 2 + this.width / 2;
        this.game.camera.y = this.y - this.game.canvas.height / 2 + this.height / 2;
        
        // Kamera sınırları
        this.game.camera.x = Math.max(0, Math.min(
            this.game.world.worldWidth * 32 - this.game.canvas.width,
            this.game.camera.x
        ));
        this.game.camera.y = Math.max(0, Math.min(
            this.game.world.worldHeight * 32 - this.game.canvas.height,
            this.game.camera.y
        ));
    }
    
    updatePlayerStats(deltaTime) {
        // Açlık azaltma
        this.hunger -= deltaTime * 0.0001;
        this.hunger = Math.max(0, this.hunger);
        
        // Açlık hasarı
        if (this.hunger === 0) {
            this.health -= deltaTime * 0.0005;
            this.health = Math.max(0, this.health);
        }
        
        // Can yenileme (açlık doluysa)
        if (this.hunger > 80 && this.health < 100) {
            this.health += deltaTime * 0.0002;
            this.health = Math.min(100, this.health);
        }
        
        // Deneyim ve seviye
        if (this.experience >= this.getExperienceForNextLevel()) {
            this.levelUp();
        }
        
        // Oyun durumunu güncelle
        this.game.gameState.health = Math.floor(this.health);
        this.game.gameState.hunger = Math.floor(this.hunger);
        this.game.gameState.level = this.level;
    }
    
    getExperienceForNextLevel() {
        return this.level * 100;
    }
    
    levelUp() {
        this.level++;
        this.experience = 0;
        this.health = 100;
        this.hunger = 100;
        
        // Seviye atlama efekti
        for (let i = 0; i < 20; i++) {
            this.game.addParticle(
                this.x + this.width/2,
                this.y + this.height/2,
                'levelup'
            );
        }
        
        console.log(`Seviye atlandı! Yeni seviye: ${this.level}`);
    }
    
    addExperience(amount) {
        this.experience += amount;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health);
        
        // Hasar efekti
        for (let i = 0; i < 10; i++) {
            this.game.addParticle(
                this.x + this.width/2,
                this.y + this.height/2,
                'damage'
            );
        }
        
        if (this.health === 0) {
            this.respawn();
        }
    }
    
    heal(amount) {
        this.health += amount;
        this.health = Math.min(100, this.health);
    }
    
    eat(amount) {
        this.hunger += amount;
        this.hunger = Math.min(100, this.hunger);
    }
    
    respawn() {
        // Başlangıç noktasına dön
        this.x = 0;
        this.y = 100;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = 100;
        this.hunger = 100;
        
        console.log('Oyuncu yeniden doğdu!');
    }
    
    render(ctx) {
        const x = this.x - this.game.camera.x;
        const y = this.y - this.game.camera.y;
        
        ctx.save();
        
        // Gölge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.ellipse(x + this.width/2, y + this.height + 5, this.width/2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Oyuncu vücudu
        const gradient = ctx.createLinearGradient(x, y, x, y + this.height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#2E7D32');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, this.width, this.height);
        
        // Baş
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(x + 4, y - 8, this.width - 8, 16);
        
        // Gözler
        ctx.fillStyle = '#000';
        if (this.facing === 'right') {
            ctx.fillRect(x + 14, y - 4, 3, 3);
        } else {
            ctx.fillRect(x + 7, y - 4, 3, 3);
        }
        
        // Saç
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 2, y - 10, this.width - 4, 6);
        
        // Kollar (animasyonlu)
        const armSwing = Math.sin(this.animationFrame * Math.PI * 2) * 10;
        
        ctx.fillStyle = '#FFDBAC';
        // Sol kol
        ctx.fillRect(x - 4, y + 8 + armSwing, 4, 16);
        // Sağ kol
        ctx.fillRect(x + this.width, y + 8 - armSwing, 4, 16);
        
        // Bacaklar (animasyonlu)
        const legSwing = Math.sin(this.animationFrame * Math.PI * 2) * 5;
        
        ctx.fillStyle = '#1976D2';
        // Sol bacak
        ctx.fillRect(x + 4, y + this.height - 8 + legSwing, 6, 12);
        // Sağ bacak
        ctx.fillRect(x + 14, y + this.height - 8 - legSwing, 6, 12);
        
        // Seçili eşya
        this.renderHeldItem(ctx, x, y);
        
        // Efektler
        this.renderEffects(ctx, x, y);
        
        ctx.restore();
    }
    
    renderHeldItem(ctx, x, y) {
        const selectedItem = this.inventory[this.selectedSlot];
        if (!selectedItem) return;
        
        ctx.save();
        
        // Eşya pozisyonu
        const itemX = this.facing === 'right' ? x + this.width : x - 16;
        const itemY = y + 12;
        
        // Eşya çizimi
        const itemColors = {
            'wood': '#8D6E63',
            'stone': '#757575',
            'wheat': '#FDD835'
        };
        
        ctx.fillStyle = itemColors[selectedItem.type] || '#CCCCCC';
        ctx.fillRect(itemX, itemY, 16, 16);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(itemX, itemY, 16, 16);
        
        ctx.restore();
    }
    
    renderEffects(ctx, x, y) {
        // Aktif efektleri göster
        this.effects.forEach((effect, index) => {
            ctx.save();
            
            const effectY = y - 20 - (index * 25);
            
            // Efekt ikonu
            ctx.fillStyle = this.getEffectColor(effect.type);
            ctx.fillRect(x - 10, effectY, 8, 8);
            
            // Efekt süresi
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.fillText(Math.ceil(effect.duration / 1000) + 's', x + 2, effectY + 7);
            
            ctx.restore();
        });
    }
    
    getEffectColor(effectType) {
        const colors = {
            'speed': '#4CAF50',
            'nightVision': '#2196F3',
            'doubleJump': '#FF9800',
            'regeneration': '#E91E63',
            'strength': '#F44336'
        };
        
        return colors[effectType] || '#FFFFFF';
    }
    
    addEffect(type, duration) {
        // Mevcut efekti güncelle veya yeni ekle
        const existingEffect = this.effects.find(e => e.type === type);
        if (existingEffect) {
            existingEffect.duration = Math.max(existingEffect.duration, duration);
        } else {
            this.effects.push({ type, duration });
        }
    }
}
