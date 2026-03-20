// Minecraft Pro - Envanter Sistemi
class Inventory {
    constructor(game) {
        this.game = game;
        this.slots = [];
        this.maxSlots = 36;
        this.hotbarSlots = 9;
        this.selectedSlot = 0;
        this.isOpen = false;
        
        // Envanter slotlarını oluştur
        this.initializeSlots();
        
        // UI elementlerini bağla
        this.setupUI();
        
        // Event listener'ları ayarla
        this.setupEventListeners();
    }
    
    initializeSlots() {
        for (let i = 0; i < this.maxSlots; i++) {
            this.slots.push({
                id: i,
                item: null,
                count: 0,
                durability: null,
                enchantments: []
            });
        }
    }
    
    setupUI() {
        // Hotbar slotlarını oluştur
        const hotbarContainer = document.createElement('div');
        hotbarContainer.className = 'hotbar';
        hotbarContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 5px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #4CAF50;
            z-index: 100;
        `;
        
        for (let i = 0; i < this.hotbarSlots; i++) {
            const slot = this.createSlotElement(i, true);
            hotbarContainer.appendChild(slot);
        }
        
        document.body.appendChild(hotbarContainer);
        
        // Tam envanter penceresi
        this.createInventoryWindow();
    }
    
    createSlotElement(slotId, isHotbar = false) {
        const slot = document.createElement('div');
        slot.className = `inventory-slot ${isHotbar ? 'hotbar-slot' : ''}`;
        slot.dataset.slotId = slotId;
        
        slot.style.cssText = `
            width: ${isHotbar ? '50px' : '40px'};
            height: ${isHotbar ? '50px' : '40px'};
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            transition: all 0.3s ease;
        `;
        
        // İkon alanı
        const icon = document.createElement('div');
        icon.className = 'slot-icon';
        icon.style.cssText = `
            font-size: ${isHotbar ? '24px' : '18px'};
            margin-bottom: 2px;
        `;
        
        // Sayı alanı
        const count = document.createElement('div');
        count.className = 'slot-count';
        count.style.cssText = `
            position: absolute;
            bottom: 2px;
            right: 2px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: ${isHotbar ? '10px' : '8px'};
            font-weight: bold;
        `;
        
        slot.appendChild(icon);
        slot.appendChild(count);
        
        // Hover efekti
        slot.addEventListener('mouseenter', () => {
            slot.style.borderColor = '#4CAF50';
            slot.style.transform = 'scale(1.1)';
            this.showSlotTooltip(slotId, slot);
        });
        
        slot.addEventListener('mouseleave', () => {
            slot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            slot.style.transform = 'scale(1)';
            this.hideTooltip();
        });
        
        // Tıklama eventi
        slot.addEventListener('click', () => {
            if (isHotbar) {
                this.selectSlot(slotId);
            } else {
                this.handleSlotClick(slotId);
            }
        });
        
        return slot;
    }
    
    createInventoryWindow() {
        const inventoryWindow = document.createElement('div');
        inventoryWindow.id = 'inventoryWindow';
        inventoryWindow.className = 'inventory-window';
        inventoryWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(13, 13, 13, 0.95));
            border: 3px solid #4CAF50;
            border-radius: 15px;
            padding: 20px;
            display: none;
            z-index: 1000;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        `;
        
        // Başlık
        const title = document.createElement('h2');
        title.textContent = '🎒 Envanter';
        title.style.cssText = `
            font-family: 'Orbitron', monospace;
            color: #4CAF50;
            margin-bottom: 20px;
            text-align: center;
        `;
        
        // Envanter grid'i
        const inventoryGrid = document.createElement('div');
        inventoryGrid.className = 'inventory-grid';
        inventoryGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            gap: 5px;
            margin-bottom: 20px;
        `;
        
        // Slotları oluştur
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = this.createSlotElement(i, false);
            inventoryGrid.appendChild(slot);
        }
        
        // Kapatma butonu
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕ Kapat';
        closeButton.style.cssText = `
            background: linear-gradient(45deg, #F44336, #E91E63);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
        `;
        
        closeButton.addEventListener('click', () => {
            this.toggle();
        });
        
        inventoryWindow.appendChild(title);
        inventoryWindow.appendChild(inventoryGrid);
        inventoryWindow.appendChild(closeButton);
        
        document.body.appendChild(inventoryWindow);
    }
    
    setupEventListeners() {
        // Klavye kontrolleri
        document.addEventListener('keydown', (e) => {
            // Sayı tuşları ile hotbar seçimi
            if (e.key >= '1' && e.key <= '9') {
                this.selectSlot(parseInt(e.key) - 1);
            }
            
            // E tuşu ile envanter aç/kapat
            if (e.key.toLowerCase() === 'e') {
                this.toggle();
            }
            
            // ESC tuşu ile envanteri kapat
            if (e.key === 'Escape' && this.isOpen) {
                this.toggle();
            }
        });
        
        // Mouse scroll ile hotbar değiştirme
        document.addEventListener('wheel', (e) => {
            if (!this.isOpen) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    this.selectedSlot = (this.selectedSlot + 1) % this.hotbarSlots;
                } else {
                    this.selectedSlot = (this.selectedSlot - 1 + this.hotbarSlots) % this.hotbarSlots;
                }
                this.updateSlotSelection();
            }
        });
        
        // Sürükle-bırak için
        this.setupDragAndDrop();
    }
    
    setupDragAndDrop() {
        let draggedSlot = null;
        let draggedFromHotbar = false;
        
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('inventory-slot')) {
                const slotId = parseInt(e.target.dataset.slotId);
                draggedSlot = this.slots[slotId];
                draggedFromHotbar = e.target.classList.contains('hotbar-slot');
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        document.addEventListener('dragover', (e) => {
            if (e.target.classList.contains('inventory-slot')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });
        
        document.addEventListener('drop', (e) => {
            if (e.target.classList.contains('inventory-slot') && draggedSlot) {
                e.preventDefault();
                const targetSlotId = parseInt(e.target.dataset.slotId);
                const targetFromHotbar = e.target.classList.contains('hotbar-slot');
                
                // Hotbar ve envanter arasında taşıma kısıtlamaları
                if (draggedFromHotbar && !targetFromHotbar && targetSlotId >= this.hotbarSlots) {
                    return; // Hotbar'dan normal envantere taşıma izin yok
                }
                
                this.swapSlots(draggedSlot.id, targetSlotId);
                this.updateUI();
            }
        });
    }
    
    selectSlot(slotId) {
        if (slotId >= 0 && slotId < this.hotbarSlots) {
            this.selectedSlot = slotId;
            this.updateSlotSelection();
        }
    }
    
    updateSlotSelection() {
        // Tüm hotbar slotlarından seçimi kaldır
        document.querySelectorAll('.hotbar-slot').forEach(slot => {
            slot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            slot.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        // Seçili slotu işaretle
        const selectedSlot = document.querySelector(`.hotbar-slot[data-slot-id="${this.selectedSlot}"]`);
        if (selectedSlot) {
            selectedSlot.style.borderColor = '#FFD700';
            selectedSlot.style.background = 'rgba(255, 215, 0, 0.2)';
        }
    }
    
    addItem(itemType, count = 1, durability = null) {
        // Önce mevcut yığınları kontrol et
        for (let slot of this.slots) {
            if (slot.item === itemType && slot.count < this.getMaxStackSize(itemType)) {
                const canAdd = Math.min(count, this.getMaxStackSize(itemType) - slot.count);
                slot.count += canAdd;
                count -= canAdd;
                
                if (count === 0) {
                    this.updateUI();
                    return true;
                }
            }
        }
        
        // Boş slot bul
        for (let slot of this.slots) {
            if (slot.item === null) {
                slot.item = itemType;
                slot.count = count;
                slot.durability = durability;
                this.updateUI();
                return true;
            }
        }
        
        return false; // Envanter dolu
    }
    
    removeItem(itemType, count = 1) {
        let removed = 0;
        
        for (let slot of this.slots) {
            if (slot.item === itemType && slot.count > 0) {
                const canRemove = Math.min(count - removed, slot.count);
                slot.count -= canRemove;
                removed += canRemove;
                
                if (slot.count === 0) {
                    slot.item = null;
                    slot.durability = null;
                    slot.enchantments = [];
                }
                
                if (removed >= count) {
                    break;
                }
            }
        }
        
        this.updateUI();
        return removed;
    }
    
    hasItem(itemType, count = 1) {
        let total = 0;
        
        for (let slot of this.slots) {
            if (slot.item === itemType) {
                total += slot.count;
                if (total >= count) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    getItemCount(itemType) {
        let total = 0;
        
        for (let slot of this.slots) {
            if (slot.item === itemType) {
                total += slot.count;
            }
        }
        
        return total;
    }
    
    swapSlots(slotId1, slotId2) {
        const temp = this.slots[slotId1];
        this.slots[slotId1] = this.slots[slotId2];
        this.slots[slotId2] = temp;
    }
    
    getMaxStackSize(itemType) {
        const stackSizes = {
            'wood': 64,
            'stone': 64,
            'dirt': 64,
            'grass': 64,
            'sand': 64,
            'wheat': 64,
            'diamond': 64,
            'gold': 64,
            'iron': 64,
            'coal': 64,
            'sword': 1,
            'pickaxe': 1,
            'axe': 1,
            'shovel': 1
        };
        
        return stackSizes[itemType] || 64;
    }
    
    getItemIcon(itemType) {
        const icons = {
            'wood': '🪵',
            'stone': '🪨',
            'dirt': '🟫',
            'grass': '🌱',
            'sand': '🏖️',
            'wheat': '🌾',
            'diamond': '💎',
            'gold': '🪙',
            'iron': '⚙️',
            'coal': '⚫',
            'sword': '⚔️',
            'pickaxe': '⛏️',
            'axe': '🪓',
            'shovel': '🔨',
            'apple': '🍎',
            'bread': '🍞',
            'meat': '🥩'
        };
        
        return icons[itemType] || '📦';
    }
    
    getItemName(itemType) {
        const names = {
            'wood': 'Odun',
            'stone': 'Taş',
            'dirt': 'Toprak',
            'grass': 'Çim',
            'sand': 'Kum',
            'wheat': 'Buğday',
            'diamond': 'Elmas',
            'gold': 'Altın',
            'iron': 'Demir',
            'coal': 'Kömür',
            'sword': 'Kılıç',
            'pickaxe': 'Kazma',
            'axe': 'Balta',
            'shovel': 'Kürek',
            'apple': 'Elma',
            'bread': 'Ekmek',
            'meat': 'Et'
        };
        
        return names[itemType] || 'Bilinmeyen Eşya';
    }
    
    handleSlotClick(slotId) {
        if (!this.isOpen) return;
        
        const slot = this.slots[slotId];
        const player = this.game.player;
        
        if (slot.item) {
            // Eşya kullan
            if (this.isConsumable(slot.item)) {
                this.consumeItem(slotId);
            } else if (this.isEquipment(slot.item)) {
                this.equipItem(slotId);
            }
        }
    }
    
    isConsumable(itemType) {
        return ['apple', 'bread', 'meat'].includes(itemType);
    }
    
    isEquipment(itemType) {
        return ['sword', 'pickaxe', 'axe', 'shovel'].includes(itemType);
    }
    
    consumeItem(slotId) {
        const slot = this.slots[slotId];
        const player = this.game.player;
        
        switch (slot.item) {
            case 'apple':
                player.heal(20);
                player.eat(30);
                break;
            case 'bread':
                player.eat(50);
                break;
            case 'meat':
                player.heal(30);
                player.eat(60);
                break;
        }
        
        this.removeItem(slot.item, 1);
        
        // Efekt
        this.game.addParticle(
            player.x + player.width/2,
            player.y + player.height/2,
            'consume'
        );
    }
    
    equipItem(slotId) {
        const slot = this.slots[slotId];
        
        // Ekipman sistemini burada genişletebilirsiniz
        console.log(`${slot.item} eklendi.`);
    }
    
    showSlotTooltip(slotId, slotElement) {
        const slot = this.slots[slotId];
        if (!slot.item) return;
        
        const tooltip = document.createElement('div');
        tooltip.id = 'slotTooltip';
        tooltip.className = 'slot-tooltip';
        
        const itemName = this.getItemName(slot.item);
        const itemCount = slot.count;
        const maxStack = this.getMaxStackSize(slot.item);
        
        tooltip.innerHTML = `
            <div class="tooltip-title">${itemName}</div>
            <div class="tooltip-count">Miktar: ${itemCount}/${maxStack}</div>
            ${slot.durability ? `<div class="tooltip-durability">Dayanıklılık: ${slot.durability}</div>` : ''}
            ${slot.enchantments.length > 0 ? `<div class="tooltip-enchantments">Büyü: ${slot.enchantments.join(', ')}</div>` : ''}
        `;
        
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            border: 1px solid #4CAF50;
            font-size: 12px;
            z-index: 1001;
            pointer-events: none;
            white-space: nowrap;
        `;
        
        // Pozisyonlandır
        const rect = slotElement.getBoundingClientRect();
        tooltip.style.left = rect.right + 10 + 'px';
        tooltip.style.top = rect.top + 'px';
        
        document.body.appendChild(tooltip);
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('slotTooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        const inventoryWindow = document.getElementById('inventoryWindow');
        
        if (this.isOpen) {
            inventoryWindow.style.display = 'block';
            this.game.isPaused = true;
        } else {
            inventoryWindow.style.display = 'none';
            this.game.isPaused = false;
        }
    }
    
    updateUI() {
        // Tüm slotları güncelle
        this.slots.forEach((slot, index) => {
            const slotElement = document.querySelector(`[data-slot-id="${index}"]`);
            if (slotElement) {
                const icon = slotElement.querySelector('.slot-icon');
                const count = slotElement.querySelector('.slot-count');
                
                if (slot.item) {
                    icon.textContent = this.getItemIcon(slot.item);
                    count.textContent = slot.count > 1 ? slot.count : '';
                    
                    // Dayanıklılık göstergesi
                    if (slot.durability !== null) {
                        const durabilityPercent = (slot.durability / 100) * 100;
                        slotElement.style.background = `linear-gradient(to top, 
                            rgba(255, 0, 0, 0.3) 0%, 
                            rgba(255, 0, 0, 0.3) ${100 - durabilityPercent}%, 
                            rgba(255, 255, 255, 0.1) ${100 - durabilityPercent}%, 
                            rgba(255, 255, 255, 0.1) 100%)`;
                    }
                } else {
                    icon.textContent = '';
                    count.textContent = '';
                    slotElement.style.background = 'rgba(255, 255, 255, 0.1)';
                }
            }
        });
        
        this.updateSlotSelection();
    }
    
    getSaveData() {
        return {
            slots: this.slots,
            selectedSlot: this.selectedSlot
        };
    }
    
    loadSaveData(data) {
        this.slots = data.slots || this.slots;
        this.selectedSlot = data.selectedSlot || 0;
        this.updateUI();
    }
}
