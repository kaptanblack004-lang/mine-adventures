#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Minecraft Pro - Python Backend Sunucusu
Çok oyunculu mod ve sunucu tarafı işlemler için
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import time
import random
import threading
from datetime import datetime
import sqlite3
import hashlib
import os

# Flask uygulamasını oluştur
app = Flask(__name__)
app.config['SECRET_KEY'] = 'minecraft_pro_secret_key_2026'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Veritabanı bağlantısı
def init_database():
    conn = sqlite3.connect('minecraft_pro.db')
    cursor = conn.cursor()
    
    # Oyuncular tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # Dünya verileri tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS worlds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            data TEXT NOT NULL,
            owner_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES players (id)
        )
    ''')
    
    # Liderlik tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER,
            score INTEGER,
            category TEXT,
            achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Oyun durumu
game_state = {
    'players': {},
    'worlds': {},
    'chat_messages': [],
    'server_time': time.time()
}

# Oyuncu sınıfı
class Player:
    def __init__(self, username, socket_id):
        self.username = username
        self.socket_id = socket_id
        self.x = random.randint(0, 1000)
        self.y = 100
        self.z = 0
        self.health = 100
        self.hunger = 100
        self.level = 1
        self.experience = 0
        self.inventory = []
        self.last_update = time.time()
        self.room = 'main'
        
    def to_dict(self):
        return {
            'username': self.username,
            'x': self.x,
            'y': self.y,
            'z': self.z,
            'health': self.health,
            'hunger': self.hunger,
            'level': self.level,
            'experience': self.experience,
            'inventory': self.inventory
        }

# Dünya sınıfı
class World:
    def __init__(self, name, owner):
        self.name = name
        self.owner = owner
        self.blocks = []
        self.created_at = time.time()
        self.last_modified = time.time()
        self.seed = random.randint(1000, 9999)
        
    def generate_chunk(self, chunk_x, chunk_y):
        """Chunk生成"""
        chunk = []
        for x in range(chunk_x * 16, (chunk_x + 1) * 16):
            for y in range(chunk_y * 16, (chunk_y + 1) * 16):
                # Basit procedural generation
                height = int(64 + 10 * random.random())
                for z in range(height):
                    if z == height - 1:
                        block_type = 'grass'
                    elif z > height - 4:
                        block_type = 'dirt'
                    else:
                        block_type = 'stone'
                    
                    chunk.append({
                        'x': x,
                        'y': z,
                        'z': y,
                        'type': block_type
                    })
        return chunk
    
    def to_dict(self):
        return {
            'name': self.name,
            'owner': self.owner,
            'blocks': self.blocks,
            'created_at': self.created_at,
            'seed': self.seed
        }

# HTTP Routes
@app.route('/')
def index():
    """Ana sayfa"""
    return send_from_directory('../', 'index.html')

@app.route('/api/status')
def get_status():
    """Sunucu durumu"""
    return jsonify({
        'status': 'online',
        'players_online': len(game_state['players']),
        'worlds_count': len(game_state['worlds']),
        'server_time': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/players')
def get_players():
    """Online oyuncular"""
    players = [player.to_dict() for player in game_state['players'].values()]
    return jsonify(players)

@app.route('/api/worlds')
def get_worlds():
    """Mevcut dünyalar"""
    worlds = [world.to_dict() for world in game_state['worlds'].values()]
    return jsonify(worlds)

@app.route('/api/chat', methods=['GET', 'POST'])
def handle_chat():
    """Chat sistemi"""
    if request.method == 'POST':
        data = request.json
        message = {
            'username': data.get('username', 'Anonymous'),
            'message': data.get('message', ''),
            'timestamp': time.time()
        }
        
        # Mesajı kaydet
        game_state['chat_messages'].append(message)
        
        # Son 50 mesajı tut
        if len(game_state['chat_messages']) > 50:
            game_state['chat_messages'] = game_state['chat_messages'][-50:]
        
        # Tüm oyunculara yayınla
        socketio.emit('chat_message', message)
        
        return jsonify({'status': 'success'})
    
    return jsonify(game_state['chat_messages'])

@app.route('/api/leaderboard')
def get_leaderboard():
    """Liderlik tablosu"""
    conn = sqlite3.connect('minecraft_pro.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT p.username, l.score, l.category, l.achieved_at
        FROM leaderboard l
        JOIN players p ON l.player_id = p.id
        ORDER BY l.score DESC
        LIMIT 10
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    leaderboard = []
    for row in results:
        leaderboard.append({
            'username': row[0],
            'score': row[1],
            'category': row[2],
            'achieved_at': row[3]
        })
    
    return jsonify(leaderboard)

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Oyuncu bağlantısı"""
    print(f'Yeni oyuncu bağlandı: {request.sid}')
    emit('connected', {'message': 'Sunucuya bağlandınız!'})

@socketio.on('disconnect')
def handle_disconnect():
    """Oyuncu ayrılması"""
    print(f'Oyuncu ayrıldı: {request.sid}')
    
    # Oyuncuyu listeden kaldır
    for username, player in list(game_state['players'].items()):
        if player.socket_id == request.sid:
            del game_state['players'][username]
            
            # Diğer oyunculara haber ver
            socketio.emit('player_left', {'username': username})
            break

@socketio.on('join_game')
def handle_join_game(data):
    """Oyuna katılma"""
    username = data.get('username', f'Player_{random.randint(1000, 9999)}')
    
    # Yeni oyuncu oluştur
    player = Player(username, request.sid)
    game_state['players'][username] = player
    
    # Odaya katıl
    join_room('main')
    player.room = 'main'
    
    # Oyuncuya başlangıç verilerini gönder
    emit('game_joined', {
        'player': player.to_dict(),
        'players': [p.to_dict() for p in game_state['players'].values()],
        'worlds': [w.to_dict() for w in game_state['worlds'].values()]
    })
    
    # Diğer oyunculara haber ver
    emit('player_joined', player.to_dict(), broadcast=True, include_self=False)

@socketio.on('player_update')
def handle_player_update(data):
    """Oyuncu konum güncellemesi"""
    username = data.get('username')
    
    if username in game_state['players']:
        player = game_state['players'][username]
        
        # Pozisyonu güncelle
        player.x = data.get('x', player.x)
        player.y = data.get('y', player.y)
        player.z = data.get('z', player.z)
        player.health = data.get('health', player.health)
        player.hunger = data.get('hunger', player.hunger)
        player.last_update = time.time()
        
        # Diğer oyunculara yayınla
        emit('player_moved', player.to_dict(), broadcast=True, include_self=False)

@socketio.on('block_action')
def handle_block_action(data):
    """Blok işlemleri"""
    action = data.get('action')  # 'place' veya 'break'
    block_data = data.get('block')
    world_name = data.get('world', 'main')
    
    # Dünya var mı kontrol et
    if world_name not in game_state['worlds']:
        # Yeni dünya oluştur
        game_state['worlds'][world_name] = World(world_name, 'server')
    
    world = game_state['worlds'][world_name]
    
    if action == 'place':
        # Blok yerleştir
        world.blocks.append(block_data)
        world.last_modified = time.time()
        
        # Tüm oyunculara yayınla
        emit('block_placed', block_data, broadcast=True)
        
    elif action == 'break':
        # Blok kır
        world.blocks = [b for b in world.blocks if not (
            b['x'] == block_data['x'] and 
            b['y'] == block_data['y'] and 
            b['z'] == block_data['z']
        )]
        world.last_modified = time.time()
        
        # Tüm oyunculara yayınla
        emit('block_broken', block_data, broadcast=True)

@socketio.on('chat_message')
def handle_chat_message(data):
    """Chat mesajı"""
    username = data.get('username', 'Anonymous')
    message = data.get('message', '')
    
    if message.strip():
        chat_data = {
            'username': username,
            'message': message,
            'timestamp': time.time()
        }
        
        # Mesajı kaydet
        game_state['chat_messages'].append(chat_data)
        
        # Son 50 mesajı tut
        if len(game_state['chat_messages']) > 50:
            game_state['chat_messages'] = game_state['chat_messages'][-50:]
        
        # Tüm oyunculara yayınla
        emit('chat_message', chat_data, broadcast=True)

@socketio.on('world_request')
def handle_world_request(data):
    """Dünya verisi isteği"""
    world_name = data.get('world', 'main')
    
    if world_name not in game_state['worlds']:
        # Yeni dünya oluştur
        game_state['worlds'][world_name] = World(world_name, 'server')
    
    world = game_state['worlds'][world_name]
    
    # Chunk'ları gönder
    emit('world_data', {
        'world': world.to_dict(),
        'chunks': world.generate_chunk(0, 0)
    })

# Arka plan görevleri
def background_tasks():
    """Arka plan görevleri"""
    while True:
        # Sunucu zamanını güncelle
        game_state['server_time'] = time.time()
        
        # AFK oyuncuları kontrol et
        current_time = time.time()
        for username, player in list(game_state['players'].items()):
            if current_time - player.last_update > 300:  # 5 dakika
                del game_state['players'][username]
                socketio.emit('player_left', {'username': username}, room='main')
        
        # Dünya kaydetme (her 10 dakikada bir)
        if int(current_time) % 600 == 0:
            save_worlds()
        
        time.sleep(1)

def save_worlds():
    """Dünyaları kaydet"""
    try:
        conn = sqlite3.connect('minecraft_pro.db')
        cursor = conn.cursor()
        
        for name, world in game_state['worlds'].items():
            world_data = json.dumps(world.to_dict())
            cursor.execute('''
                INSERT OR REPLACE INTO worlds (name, data, owner_id)
                VALUES (?, ?, (SELECT id FROM players WHERE username = ?))
            ''', (name, world_data, world.owner))
        
        conn.commit()
        conn.close()
        print(f'Dünyalar kaydedildi: {len(game_state["worlds"])} dünya')
    except Exception as e:
        print(f'Dünya kaydetme hatası: {e}')

def start_server():
    """Sunucuyu başlat"""
    print('🎮 Minecraft Pro Sunucusu Başlatılıyor...')
    print('📡 Sunucu Adresi: http://localhost:5000')
    print('🌐 WebSocket: ws://localhost:5000')
    
    # Veritabanını başlat
    init_database()
    
    # Arka plan görevlerini başlat
    background_thread = threading.Thread(target=background_tasks, daemon=True)
    background_thread.start()
    
    # Sunucuyu başlat
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    try:
        start_server()
    except KeyboardInterrupt:
        print('\n👋 Sunucu kapatılıyor...')
        save_worlds()
        print('✅ Sunucu başarıyla kapatıldı.')
