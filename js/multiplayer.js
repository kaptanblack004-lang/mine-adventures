// Multiplayer Oyun Sistemi - Temiz ve Çalışan Versiyon

// Global değişkenler
let ws = null;
let isConnected = false;
let playerId = null;
let currentRoom = null;
let isMyTurn = false;

// WebSocket bağlantısını başlat
function initWebSocket() {
    // Port olmadan WebSocket URL'si oluştur
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}/ws`;
    
    console.log('🌐 WebSocket URL:', wsUrl);
    console.log('📍 Host:', host);
    console.log('🔒 Protocol:', protocol);
    console.log('🔗 Full URL:', window.location.href);

    try {
        ws = new WebSocket(wsUrl);
        
        // Oyuncu ID'si oluştur
        playerId = 'player_' + Math.random().toString(36).substr(2, 9);

        ws.onopen = function(event) {
            console.log('✅ WebSocket bağlantısı başarıyla açıldı');
            console.log('🔗 Bağlantı URL:', wsUrl);
            console.log('👤 Oyuncu ID:', playerId);
            console.log('📊 WebSocket readyState:', ws.readyState);
            console.log('🔌 Protocol:', ws.protocol);
            isConnected = true;
            updateConnectionStatus(true);
            showNotification('Sunucuya bağlandınız!', 'success');
        };

        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (e) {
                console.error('WebSocket mesajı parse edilemedi:', e);
            }
        };

        ws.onclose = function(event) {
            console.log('❌ WebSocket bağlantısı kapandı');
            console.log('📊 Kapanma kodu:', event.code);
            console.log('📝 Kapanma sebebi:', event.reason);
            console.log('🔄 Temiz mi kapatıldı:', event.wasClean);
            console.log('🔗 URL:', wsUrl);
            console.log('📊 Son readyState:', ws.readyState);
            isConnected = false;
            updateConnectionStatus(false);
            showNotification('Sunucu bağlantısı kesildi!', 'error');
            
            // Hata kodlarına göre özel mesajlar
            switch(event.code) {
                case 1000:
                    console.log('ℹ️ Normal kapanma - bağlantı başarıyla sonlandırıldı');
                    break;
                case 1001:
                    console.log('🔴 Sunucu tarafından kapatıldı');
                    break;
                case 1002:
                    console.log('🔴 Protokol hatası - beklenmeyen veri alındı');
                    break;
                case 1003:
                    console.log('🔴 Desteklenmeyen veri tipi alındı');
                    break;
                case 1004:
                    console.log('🔴 Ayrılmış - kod belirtilmemiş');
                    break;
                case 1005:
                    console.log('🔴 Beklenmedik kapanma - kod belirtilmemiş');
                    break;
                case 1006:
                    console.log('🔴 Bağlantı koptu - ağ sorunu');
                    break;
                case 1007:
                    console.log('rame Geçersiz frame verisi');
                    break;
                case 1008:
                    console.log('🔴 Policy ihlali');
                    break;
                case 1009:
                    console.log('🔴 Mesaj çok büyük');
                    break;
                case 1010:
                    console.log('🔴 Extension gerekli');
                    break;
                case 1011:
                    console.log('🔴 Sunucu hatası - beklenmedik durum');
                    break;
                case 1015:
                    console.log('🔴 TLS handshake başarısız');
                    break;
                default:
                    console.log('🔴 Bilinmeyen kapanma kodu:', event.code);
            }
            
            // Otomatik yeniden bağlanma
            console.log('🔄 3 saniye sonra yeniden bağlanma deneniyor...');
            setTimeout(() => {
                if (!isConnected) {
                    console.log('🔄 Yeniden bağlanma deneniyor...');
                    initWebSocket();
                }
            }, 3000);
        };

        ws.onerror = function(error) {
            console.error('🚨 WebSocket hatası:', error);
            console.error('🔍 Hata detayları:', {
                type: error.type,
                timestamp: new Date().toISOString(),
                url: wsUrl,
                readyState: ws.readyState,
                bufferedAmount: ws.bufferedAmount
            });
            console.error('🌐 Browser bilgileri:', {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            });
            isConnected = false;
            updateConnectionStatus(false);
            showNotification('Bağlantı hatası!', 'error');
        };
    } catch (e) {
        console.error('WebSocket oluşturma hatası:', e);
        showNotification('WebSocket bağlantısı kurulamadı!', 'error');
    }
}

// Bağlantı durumunu güncelle
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.className = connected ? 'connected' : 'disconnected';
        statusElement.textContent = connected ? '🟢 Bağlı' : '🔴 Bağlı Değil';
    }
}

// WebSocket mesajlarını işle
function handleWebSocketMessage(data) {
    console.log('Mesaj alındı:', data);
    
    switch (data.type) {
        case 'player_joined':
            if (data.roomId === currentRoom) {
                showNotification(`${data.player.name} odaya katıldı`, 'info');
                updateRoomInfo(data.players);
                updateGameState(data.gameState);
            }
            break;

        case 'player_left':
            if (data.roomId === currentRoom) {
                showNotification(`${data.player.name} odadan ayrıldı`, 'info');
                updateRoomInfo(data.players);
                updateGameState(data.gameState);
            }
            break;

        case 'chat_message':
            addChatMessage(data.player.name, data.message, data.timestamp);
            break;

        case 'game_move':
            handleGameMove(data);
            break;

        case 'game_started':
            startMultiplayerGame(data);
            break;

        case 'player_ready_update':
            updateRoomInfo(data.players);
            if (data.allReady) {
                showNotification('Tüm oyuncular hazır! Oyun başlıyor...', 'success');
            }
            break;

        case 'error':
            showNotification(data.message, 'error');
            break;

        default:
            console.log('Bilinmeyen mesaj tipi:', data.type);
    }
}

// Chat mesajı ekle
function addChatMessage(playerName, message, timestamp) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `
        <span class="player-name">${playerName}:</span>
        <span class="message-text">${message}</span>
        <span class="timestamp">${new Date(timestamp).toLocaleTimeString()}</span>
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Chat mesajı gönder
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message || !isConnected) return;

    const data = {
        type: 'chat_message',
        message: message,
        timestamp: Date.now()
    };

    ws.send(JSON.stringify(data));
    input.value = '';
}

// Odaya katıl
function joinRoom(roomId) {
    if (!isConnected) {
        showNotification('Önce sunucuya bağlanın!', 'error');
        return;
    }

    const playerName = prompt('Oyuncu adınız:') || 'Oyuncu';
    
    const data = {
        type: 'join_room',
        roomId: roomId,
        playerId: playerId,
        playerName: playerName
    };

    currentRoom = roomId;
    ws.send(JSON.stringify(data));
    showNotification(`${roomId} odasına katılınıyor...`, 'info');
}

// Odadan ayrıl
function leaveRoom() {
    if (!isConnected || !currentRoom) return;

    const data = {
        type: 'leave_room'
    };

    ws.send(JSON.stringify(data));
    currentRoom = null;
}

// Multiplayer XOX oyununu başlat
function startMultiplayerXOX() {
    if (!currentRoom) {
        showNotification('Önce bir odaya katılın!', 'error');
        return;
    }

    const data = {
        type: 'start_game',
        gameType: 'xox'
    };

    ws.send(JSON.stringify(data));
}

// XOX hamlesi gönder
function sendXOXMove(row, col) {
    if (!currentRoom || !isMyTurn) return;

    const data = {
        type: 'game_move',
        gameType: 'xox',
        move: { row: row, col: col }
    };

    ws.send(JSON.stringify(data));
}

// Oda bilgisini güncelle
function updateRoomInfo(players) {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    playersList.innerHTML = '';
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-item';
        playerElement.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-status ${player.ready ? 'ready' : 'not-ready'}">
                ${player.ready ? '✅ Hazır' : '⏳ Hazır Değil'}
            </span>
        `;
        playersList.appendChild(playerElement);
    });
}

// Oyun durumunu güncelle
function updateGameState(gameState) {
    if (!gameState) return;
    
    // XOX tahtasını güncelle
    if (gameState.game === 'xox' && gameState.board) {
        updateXOXBoardFromServer(gameState.board);
    }
    
    // Sıra bilgisini güncelle
    if (gameState.current_turn === playerId) {
        isMyTurn = true;
        showNotification('Sıra sende!', 'info');
    } else {
        isMyTurn = false;
    }
}

// Sunucudan gelen XOX tahtasını güncelle
function updateXOXBoardFromServer(board) {
    const cells = document.querySelectorAll('#multiplayer-xox .cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        cell.textContent = board[row][col];
        cell.className = 'cell ' + (board[row][col] ? 'taken' : '');
    });
}

// Oyun hamlesini işle
function handleGameMove(data) {
    if (data.gameType === 'xox') {
        updateXOXBoardFromServer(data.move);
        
        // Sıra kontrolü
        if (data.player.id !== playerId) {
            isMyTurn = true;
            showNotification('Sıra sende!', 'info');
        }
    }
}

// Multiplayer oyun başlat
function startMultiplayerGame(data) {
    showNotification(`${data.gameType.toUpperCase()} oyunu başladı!`, 'success');

    if (data.gameType === 'xox') {
        initMultiplayerXOX();
        updateGameState(data.gameState);
    }
}

// Multiplayer XOX'u başlat
function initMultiplayerXOX() {
    const board = document.getElementById('multiplayer-xox-board');
    if (!board) return;

    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'xox-cell';
        cell.dataset.position = i;
        cell.onclick = () => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            sendXOXMove(row, col);
        };
        board.appendChild(cell);
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Sayfa yüklendiğinde WebSocket'i başlat
document.addEventListener('DOMContentLoaded', function() {
    initWebSocket();

    // Chat enter tuşu
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // XOX hücrelerine event listener'ları ekle
    const xoxCells = document.querySelectorAll('.xox-cell');
    xoxCells.forEach((cell, index) => {
        cell.addEventListener('click', function() {
            const row = Math.floor(index / 3);
            const col = index % 3;
            sendXOXMove(row, col);
        });
    });
});

// Export fonksiyonlar - global scope
window.joinRoom = joinRoom;
window.leaveRoom = leaveRoom;
window.startMultiplayerXOX = startMultiplayerXOX;
window.sendChatMessage = sendChatMessage;
window.initWebSocket = initWebSocket;
window.handleWebSocketMessage = handleWebSocketMessage;
window.addChatMessage = addChatMessage;
window.updateRoomInfo = updateRoomInfo;
window.updateGameState = updateGameState;
window.handleGameMove = handleGameMove;
window.startMultiplayerGame = startMultiplayerGame;
window.initMultiplayerXOX = initMultiplayerXOX;
window.sendXOXMove = sendXOXMove;
window.showNotification = showNotification;
window.updateConnectionStatus = updateConnectionStatus;
