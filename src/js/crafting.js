// Minecraft Pro - Crafting Sistemi
class CraftingSystem {
    constructor(game) {
        this.game = game;
        this.recipes = [];
        this.craftingTable = null;
        this.isCraftingTableOpen = false;
        
        // Crafting tariflerini yükle
        this.loadRecipes();
        
        // UI oluştur
        this.createCraftingUI();
        
        // Event listener'ları ayarla
        this.setupEventListeners();
    }
    
    loadRecipes() {
        // Temel crafting tarifleri
        this.recipes = [
            // Taş aletler
            {
                id: 'stone_pickaxe',
                name: 'Taş Kazma',
                result: { item: 'stone_pickaxe', count: 1 },
                ingredients: [
                    { item: 'stone', count: 3, positions: [[0, 0], [1, 0], [2, 0]] },
                    { item: 'wood', count: 2, positions: [[1, 1], [1, 2]] }
                ],
                requiresTable: false
            },
            {
                id: 'stone_axe',
                name: 'Taş Balta',
                result: { item: 'stone_axe', count: 1 },
                ingredients: [
                    { item: 'stone', count: 2, positions: [[0, 0], [1, 0]] },
                    { item: 'wood', count: 2, positions: [[2, 0], [1, 1]] }
                ],
                requiresTable: false
            },
            {
                id: 'stone_sword',
                name: 'Taş Kılıç',
                result: { item: 'stone_sword', count: 1 },
                ingredients: [
                    { item: 'stone', count: 1, positions: [[1, 0]] },
                    { item: 'wood', count: 1, positions: [[1, 1]] }
                ],
                requiresTable: false
            },
            
            // Demir aletler
            {
                id: 'iron_pickaxe',
                name: 'Demir Kazma',
                result: { item: 'iron_pickaxe', count: 1 },
                ingredients: [
                    { item: 'iron', count: 3, positions: [[0, 0], [1, 0], [2, 0]] },
                    { item: 'wood', count: 2, positions: [[1, 1], [1, 2]] }
                ],
                requiresTable: true
            },
            {
                id: 'iron_axe',
                name: 'Demir Balta',
                result: { item: 'iron_axe', count: 1 },
                ingredients: [
                    { item: 'iron', count: 2, positions: [[0, 0], [1, 0]] },
                    { item: 'wood', count: 2, positions: [[2, 0], [1, 1]] }
                ],
                requiresTable: true
            },
            {
                id: 'iron_sword',
                name: 'Demir Kılıç',
                result: { item: 'iron_sword', count: 1 },
                ingredients: [
                    { item: 'iron', count: 1, positions: [[1, 0]] },
                    { item: 'wood', count: 1, positions: [[1, 1]] }
                ],
                requiresTable: true
            },
            
            // Elmas aletler
            {
                id: 'diamond_pickaxe',
                name: 'Elmas Kazma',
                result: { item: 'diamond_pickaxe', count: 1 },
                ingredients: [
                    { item: 'diamond', count: 3, positions: [[0, 0], [1, 0], [2, 0]] },
                    { item: 'wood', count: 2, positions: [[1, 1], [1, 2]] }
                ],
                requiresTable: true
            },
            
            // Yapı malzemeleri
            {
                id: 'wood_planks',
                name: 'Odun Kalas',
                result: { item: 'wood_planks', count: 4 },
                ingredients: [
                    { item: 'wood', count: 1, positions: [[0, 0]] }
                ],
                requiresTable: false
            },
            {
                id: 'sticks',
                name: 'Çubuk',
                result: { item: 'sticks', count: 4 },
                ingredients: [
                    { item: 'wood_planks', count: 2, positions: [[0, 0], [1, 0]] }
                ],
                requiresTable: false
            },
            {
                id: 'crafting_table',
                name: 'Crafting Masası',
                result: { item: 'crafting_table', count: 1 },
                ingredients: [
                    { item: 'wood_planks', count: 4, positions: [[0, 0], [1, 0], [0, 1], [1, 1]] }
                ],
                requiresTable: false
            },
            
            // Gıda
            {
                id: 'bread',
                name: 'Ekmek',
                result: { item: 'bread', count: 1 },
                ingredients: [
                    { item: 'wheat', count: 3, positions: [[0, 0], [1, 0], [2, 0]] }
                ],
                requiresTable: false
            },
            
            // Zırh
            {
                id: 'iron_helmet',
                name: 'Demir Kask',
                result: { item: 'iron_helmet', count: 1 },
                ingredients: [
                    { item: 'iron', count: 5, positions: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1]] }
                ],
                requiresTable: true
            },
            {
                id: 'iron_chestplate',
                name: 'Demir Zırh',
                result: { item: 'iron_chestplate', count: 1 },
                ingredients: [
                    { item: 'iron', count: 8, positions: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [2, 2]] }
                ],
                requiresTable: true
            },
            
            // Özel eşyalar
            {
                id: 'torch',
                name: 'Meşale',
                result: { item: 'torch', count: 4 },
                ingredients: [
                    { item: 'coal', count: 1, positions: [[1, 0]] },
                    { item: 'sticks', count: 1, positions: [[1, 1]] }
                ],
                requiresTable: false
            },
            {
                id: 'furnace',
                name: 'Fırın',
                result: { item: 'furnace', count: 1 },
                ingredients: [
                    { item: 'stone', count: 8, positions: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]] }
                ],
                requiresTable: true
            }
        ];
    }
    
    createCraftingUI() {
        // Crafting penceresi
        const craftingWindow = document.createElement('div');
        craftingWindow.id = 'craftingWindow';
        craftingWindow.className = 'crafting-window';
        craftingWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(13, 13, 13, 0.98));
            border: 3px solid #FF9800;
            border-radius: 15px;
            padding: 20px;
            display: none;
            z-index: 1001;
            box-shadow: 0 20px 80px rgba(0, 0, 0, 0.9);
            min-width: 500px;
        `;
        
        // Başlık
        const title = document.createElement('h2');
        title.textContent = '🔨 Crafting';
        title.style.cssText = `
            font-family: 'Orbitron', monospace;
            color: #FF9800;
            margin-bottom: 20px;
            text-align: center;
            text-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
        `;
        
        // Crafting grid'i
        const craftingGrid = document.createElement('div');
        craftingGrid.className = 'crafting-grid';
        craftingGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 60px);
            grid-template-rows: repeat(3, 60px);
            gap: 5px;
            margin-bottom: 20px;
            justify-content: center;
        `;
        
        // Crafting slotları
        for (let i = 0; i < 9; i++) {
            const slot = this.createCraftingSlot(i);
            craftingGrid.appendChild(slot);
        }
        
        // Ok
        const arrow = document.createElement('div');
        arrow.innerHTML = '➡️';
        arrow.style.cssText = `
            font-size: 30px;
            text-align: center;
            margin: 20px 0;
        `;
        
        // Sonuç slotu
        const resultSlot = this.createResultSlot();
        
        // Tarif listesi
        const recipeList = document.createElement('div');
        recipeList.className = 'recipe-list';
        recipeList.style.cssText = `
            background: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        const recipeTitle = document.createElement('h3');
        recipeTitle.textContent = '📜 Mevcut Tarifler';
        recipeTitle.style.cssText = `
            color: #FF9800;
            margin-bottom: 10px;
            font-family: 'Orbitron', monospace;
        `;
        
        const recipeItems = document.createElement('div');
        recipeItems.className = 'recipe-items';
        
        // Tarifleri listele
        this.recipes.forEach(recipe => {
            const recipeItem = document.createElement('div');
            recipeItem.className = 'recipe-item';
            recipeItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                margin-bottom: 5px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            recipeItem.innerHTML = `
                <span>${recipe.name}</span>
                <span style="color: #4CAF50;">${this.getItemIcon(recipe.result.item)} x${recipe.result.count}</span>
            `;
            
            recipeItem.addEventListener('click', () => {
                this.showRecipePreview(recipe);
            });
            
            recipeItem.addEventListener('mouseenter', () => {
                recipeItem.style.background = 'rgba(255, 152, 0, 0.2)';
            });
            
            recipeItem.addEventListener('mouseleave', () => {
                recipeItem.style.background = 'rgba(255, 255, 255, 0.05)';
            });
            
            recipeItems.appendChild(recipeItem);
        });
        
        recipeList.appendChild(recipeTitle);
        recipeList.appendChild(recipeItems);
        
        // Butonlar
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 20px;
        `;
        
        const craftButton = document.createElement('button');
        craftButton.textContent = '🔨 Üret';
        craftButton.style.cssText = `
            background: linear-gradient(45deg, #4CAF50, #8BC34A);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-family: 'Orbitron', monospace;
            flex: 1;
            transition: all 0.3s ease;
        `;
        
        craftButton.addEventListener('click', () => {
            this.craft();
        });
        
        craftButton.addEventListener('mouseenter', () => {
            craftButton.style.transform = 'scale(1.05)';
            craftButton.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.4)';
        });
        
        craftButton.addEventListener('mouseleave', () => {
            craftButton.style.transform = 'scale(1)';
            craftButton.style.boxShadow = 'none';
        });
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕ Kapat';
        closeButton.style.cssText = `
            background: linear-gradient(45deg, #F44336, #E91E63);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-family: 'Orbitron', monospace;
            flex: 1;
            transition: all 0.3s ease;
        `;
        
        closeButton.addEventListener('click', () => {
            this.close();
        });
        
        buttonContainer.appendChild(craftButton);
        buttonContainer.appendChild(closeButton);
        
        // Her şeyi birleştir
        craftingWindow.appendChild(title);
        craftingWindow.appendChild(craftingGrid);
        craftingWindow.appendChild(arrow);
        craftingWindow.appendChild(resultSlot);
        craftingWindow.appendChild(recipeList);
        craftingWindow.appendChild(buttonContainer);
        
        document.body.appendChild(craftingWindow);
        
        this.craftingWindow = craftingWindow;
        this.craftingSlots = craftingGrid.querySelectorAll('.crafting-slot');
        this.resultSlot = resultSlot;
    }
    
    createCraftingSlot(index) {
        const slot = document.createElement('div');
        slot.className = 'crafting-slot';
        slot.dataset.slotIndex = index;
        
        slot.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            transition: all 0.3s ease;
            font-size: 24px;
        `;
        
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.style.borderColor = '#FF9800';
            slot.style.background = 'rgba(255, 152, 0, 0.2)';
        });
        
        slot.addEventListener('dragleave', () => {
            slot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            slot.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleSlotDrop(index, e);
        });
        
        return slot;
    }
    
    createResultSlot() {
        const slot = document.createElement('div');
        slot.className = 'result-slot';
        
        slot.style.cssText = `
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, rgba(255, 152, 0, 0.2), rgba(255, 193, 7, 0.2));
            border: 3px solid #FFD700;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            position: relative;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        `;
        
        const icon = document.createElement('div');
        icon.className = 'result-icon';
        icon.style.cssText = `
            font-size: 32px;
            margin-bottom: 5px;
        `;
        
        const count = document.createElement('div');
        count.className = 'result-count';
        count.style.cssText = `
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        `;
        
        slot.appendChild(icon);
        slot.appendChild(count);
        
        return slot;
    }
    
    setupEventListeners() {
        // Crafting masası etkileşimi
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' && this.game.player) {
                // Crafting masası yakınında mı kontrol et
                const nearbyTable = this.isNearCraftingTable();
                if (nearbyTable) {
                    this.open();
                }
            }
            
            if (e.key === 'Escape' && this.isCraftingTableOpen) {
                this.close();
            }
        });
    }
    
    isNearCraftingTable() {
        if (!this.game.player) return false;
        
        const playerX = this.game.player.x;
        const playerY = this.game.player.y;
        
        // Crafting masası bloklarını kontrol et
        const craftingTables = this.game.world.blocks.filter(block => 
            block.type === 'crafting_table'
        );
        
        for (const table of craftingTables) {
            const distance = Math.sqrt(
                Math.pow(table.x - playerX, 2) + 
                Math.pow(table.y - playerY, 2)
            );
            
            if (distance < 64) { // 2 blok mesafe
                return true;
            }
        }
        
        return false;
    }
    
    open() {
        this.isCraftingTableOpen = true;
        this.craftingWindow.style.display = 'block';
        this.game.isPaused = true;
        this.clearCraftingGrid();
    }
    
    close() {
        this.isCraftingTableOpen = false;
        this.craftingWindow.style.display = 'none';
        this.game.isPaused = false;
        this.returnItemsToInventory();
    }
    
    clearCraftingGrid() {
        this.craftingSlots.forEach(slot => {
            slot.textContent = '';
            slot.dataset.item = '';
            slot.dataset.count = '';
        });
        
        this.updateResult();
    }
    
    handleSlotDrop(slotIndex, e) {
        // Sürükle-bırak ile envanterden eşya ekle
        const itemData = e.dataTransfer.getData('text/plain');
        if (itemData) {
            const data = JSON.parse(itemData);
            this.addToCraftingSlot(slotIndex, data.item, data.count);
        }
    }
    
    addToCraftingSlot(slotIndex, item, count) {
        const slot = this.craftingSlots[slotIndex];
        
        // Envanterden eşya kontrol et
        if (this.game.inventory.hasItem(item, count)) {
            slot.textContent = this.getItemIcon(item);
            slot.dataset.item = item;
            slot.dataset.count = count;
            
            this.updateResult();
        }
    }
    
    updateResult() {
        const currentRecipe = this.findMatchingRecipe();
        
        if (currentRecipe) {
            const resultIcon = this.resultSlot.querySelector('.result-icon');
            const resultCount = this.resultSlot.querySelector('.result-count');
            
            resultIcon.textContent = this.getItemIcon(currentRecipe.result.item);
            resultCount.textContent = currentRecipe.result.count > 1 ? currentRecipe.result.count : '';
            
            this.resultSlot.style.opacity = '1';
            this.resultSlot.style.cursor = 'pointer';
        } else {
            const resultIcon = this.resultSlot.querySelector('.result-icon');
            const resultCount = this.resultSlot.querySelector('.result-count');
            
            resultIcon.textContent = '?';
            resultCount.textContent = '';
            
            this.resultSlot.style.opacity = '0.5';
            this.resultSlot.style.cursor = 'not-allowed';
        }
    }
    
    findMatchingRecipe() {
        const craftingGrid = this.getCraftingGrid();
        
        for (const recipe of this.recipes) {
            if (this.matchesRecipe(recipe, craftingGrid)) {
                return recipe;
            }
        }
        
        return null;
    }
    
    getCraftingGrid() {
        const grid = [];
        
        this.craftingSlots.forEach(slot => {
            grid.push({
                item: slot.dataset.item || null,
                count: parseInt(slot.dataset.count) || 0
            });
        });
        
        return grid;
    }
    
    matchesRecipe(recipe, grid) {
        // Tarif pozisyonlarını kontrol et
        const requiredPositions = {};
        
        recipe.ingredients.forEach(ingredient => {
            ingredient.positions.forEach(pos => {
                const index = pos[1] * 3 + pos[0];
                requiredPositions[index] = {
                    item: ingredient.item,
                    count: ingredient.count
                };
            });
        });
        
        // Grid'deki eşyaları kontrol et
        for (let i = 0; i < 9; i++) {
            const slot = grid[i];
            const required = requiredPositions[i];
            
            if (required) {
                if (slot.item !== required.item || slot.count < required.count) {
                    return false;
                }
            } else if (slot.item) {
                // Boş olmayan slot gereksiz eşya içeriyor
                return false;
            }
        }
        
        return true;
    }
    
    craft() {
        const recipe = this.findMatchingRecipe();
        
        if (!recipe) {
            alert('Geçerli bir tarif bulunamadı!');
            return;
        }
        
        // Malzemeleri envanterden çıkar
        const craftingGrid = this.getCraftingGrid();
        const itemsToConsume = {};
        
        craftingGrid.forEach(slot => {
            if (slot.item) {
                itemsToConsume[slot.item] = (itemsToConsume[slot.item] || 0) + slot.count;
            }
        });
        
        // Malzemeleri kontrol et ve çıkar
        for (const [item, count] of Object.entries(itemsToConsume)) {
            if (!this.game.inventory.hasItem(item, count)) {
                alert('Yeterli malzeme yok!');
                return;
            }
        }
        
        // Malzemeleri çıkar
        for (const [item, count] of Object.entries(itemsToConsume)) {
            this.game.inventory.removeItem(item, count);
        }
        
        // Sonucu envantere ekle
        this.game.inventory.addItem(recipe.result.item, recipe.result.count);
        
        // Crafting grid'ini temizle
        this.clearCraftingGrid();
        
        // Efekt
        this.showCraftingEffect();
        
        console.log(`${recipe.name} üretildi!`);
    }
    
    returnItemsToInventory() {
        // Crafting grid'indeki eşyaları envantere geri döndür
        this.craftingSlots.forEach(slot => {
            if (slot.dataset.item) {
                this.game.inventory.addItem(slot.dataset.item, parseInt(slot.dataset.count));
            }
        });
        
        this.clearCraftingGrid();
    }
    
    showRecipePreview(recipe) {
        // Tarif önizlemesi göster
        const preview = document.createElement('div');
        preview.className = 'recipe-preview';
        
        preview.innerHTML = `
            <h3>${recipe.name}</h3>
            <div class="recipe-ingredients">
                ${recipe.ingredients.map(ing => 
                    `<div>${this.getItemIcon(ing.item)} ${ing.item} x${ing.count}</div>`
                ).join('')}
            </div>
            <div class="recipe-result">
                Sonuç: ${this.getItemIcon(recipe.result.item)} ${recipe.result.item} x${recipe.result.count}
            </div>
        `;
        
        preview.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #FF9800;
            z-index: 1002;
        `;
        
        document.body.appendChild(preview);
        
        setTimeout(() => {
            preview.remove();
        }, 3000);
    }
    
    showCraftingEffect() {
        // Crafting efekti
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.game.addParticle(
                    this.game.canvas.width / 2 + (Math.random() - 0.5) * 100,
                    this.game.canvas.height / 2 + (Math.random() - 0.5) * 100,
                    'craft'
                );
            }, i * 50);
        }
        
        // Ses efekti
        this.game.playSound('place');
    }
    
    getItemIcon(item) {
        const icons = {
            'wood': '🪵',
            'stone': '🪨',
            'iron': '⚙️',
            'diamond': '💎',
            'gold': '🪙',
            'coal': '⚫',
            'wheat': '🌾',
            'sticks': '🥢',
            'wood_planks': '📋',
            'crafting_table': '🔨',
            'furnace': '🔥',
            'torch': '🔦',
            'bread': '🍞',
            'stone_pickaxe': '⛏️',
            'stone_axe': '🪓',
            'stone_sword': '⚔️',
            'iron_pickaxe': '⛏️',
            'iron_axe': '🪓',
            'iron_sword': '⚔️',
            'diamond_pickaxe': '💎⛏️',
            'iron_helmet': '⛑️',
            'iron_chestplate': '🦺'
        };
        
        return icons[item] || '📦';
    }
}
