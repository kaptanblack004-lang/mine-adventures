#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Burak Ultra Profesyonel Multiplayer Oyun Sunucusu
Gelişmiş oda sistemi, gerçek zamanlı multiplayer ve chat desteği
"""

import json
import os
import asyncio
import websockets
import logging
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import threading
import time
from datetime import datetime
import argparse

# Logging konfigürasyonu
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)

# Global değişkenler
connected_clients = {}  # room_id -> {websocket: player_info}
client_rooms = {}  # websocket -> room_id
game_states = {}  # room_id -> game_state

class MultiplayerHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Multiplayer için optimize edilmiş HTTP handler"""
    
    def __init__(self, *args, **kwargs):
        self.config = self.load_config()
        super().__init__(*args, **kwargs)
    
    def load_config(self):
        """Konfigürasyon dosyasını yükle"""
        try:
            with open('../json/config.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {"server": {"port": 8001, "websocket_port": 8766}}
    
    def end_headers(self):
        """Güvenlik header'larını ekle"""
        # Dinamik CORS - ngrok ve localhost'a izin ver
        self.send_header('Content-Security-Policy', 
                        "default-src 'self'; script-src 'self' 'unsafe-inline'; "
                        "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
                        "font-src 'self' data:; connect-src 'self' ws: wss:;")
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Access-Control-Allow-Origin', '*')  # Ngrok için wildcard
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Cache-Control', 'max-age=3600')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Sadece önemli olayları logla"""
        if "404" in format or "500" in format or "WebSocket" in format:
            logging.info(f"{self.address_string()} - {format % args}")
    
    def translate_path(self, path):
        """Dosya yollarını düzgün yönlendir"""
        path = super().translate_path(path)
        if path.startswith(os.getcwd()):
            parent_dir = os.path.dirname(os.getcwd())
            return os.path.join(parent_dir, os.path.relpath(path, os.getcwd()))
        return path
    
    def do_OPTIONS(self):
        """CORS preflight isteğini yönet"""
        self.send_response(200)
        self.end_headers()

async def websocket_handler(websocket, path):
    """Gelişmiş WebSocket handler"""
    client_info = {
        'remote_address': websocket.remote_address,
        'path': path,
        'timestamp': datetime.now().isoformat()
    }
    
    logging.info(f"🔌 Yeni WebSocket bağlantısı isteği: {client_info}")
    
    try:
        # İlk mesajı bekle (oda katılımı)
        join_message = await websocket.recv()
        join_data = json.loads(join_message)
        
        if join_data.get('type') == 'join_room':
            room_id = join_data.get('roomId', 'Room1')
            player_id = join_data.get('playerId', f'player_{int(time.time())}')
            player_name = join_data.get('playerName', f'Oyuncu_{player_id[-6:]}')
            
            # Oda kontrolü
            config = load_config()
            max_rooms = config.get('multiplayer', {}).get('rooms', ['Room1', 'Room2', 'Room3'])
            if room_id not in max_rooms:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': f'Geçersiz oda. Mevcut odalar: {", ".join(max_rooms)}'
                }))
                return
            
            # Odaya katıl
            if room_id not in connected_clients:
                connected_clients[room_id] = {}
                game_states[room_id] = {'game': None, 'players': [], 'current_turn': None}
            
            player_info = {
                'id': player_id,
                'name': player_name,
                'joined_at': datetime.now().isoformat(),
                'ready': False
            }
            
            connected_clients[room_id][websocket] = player_info
            client_rooms[websocket] = room_id
            
            # Oya durumunu güncelle
            game_states[room_id]['players'] = list(connected_clients[room_id].values())
            
            logging.info(f"✅ Oyuncu katıldı: {player_name} ({player_id}) -> Oda: {room_id}")
            logging.info(f"🏠 Oda {room_id} toplam oyuncu: {len(connected_clients[room_id])}")
            
            # Katılma bildirimi
            join_notification = {
                'type': 'player_joined',
                'player': player_info,
                'roomId': room_id,
                'players': game_states[room_id]['players'],
                'gameState': game_states[room_id]
            }
            
            # Odadaki herkese gönder
            await broadcast_to_room(room_id, join_notification, exclude=None)
            
            logging.info(f"Oyuncu {player_name} ({player_id}) odaya katıldı: {room_id}")
        
        # Ana mesaj döngüsü
        async for message in websocket:
            try:
                data = json.loads(message)
                room_id = client_rooms.get(websocket)
                
                if not room_id:
                    continue
                
                player_info = connected_clients[room_id].get(websocket, {})
                
                # Mesaj tipine göre işle
                if data['type'] == 'chat_message':
                    await handle_chat_message(room_id, data, player_info)
                
                elif data['type'] == 'game_move':
                    await handle_game_move(room_id, data, player_info)
                
                elif data['type'] == 'start_game':
                    await handle_start_game(room_id, data, player_info)
                
                elif data['type'] == 'player_ready':
                    await handle_player_ready(room_id, data, player_info)
                
            except json.JSONDecodeError:
                continue
            except Exception as e:
                logging.error(f"Mesaj işleme hatası: {e}")
    
    except websockets.exceptions.ConnectionClosed as e:
        logging.info(f"🔌 WebSocket bağlantısı normal şekilde kapandı: {e.code}")
    except Exception as e:
        logging.error(f"❌ WebSocket bağlantı hatası: {e}")
    finally:
        await cleanup_connection(websocket)

async def handle_chat_message(room_id, data, player_info):
    """Chat mesajını işle"""
    chat_msg = {
        'type': 'chat_message',
        'player': player_info,
        'message': data['message'][:200],  # Max 200 karakter
        'timestamp': datetime.now().isoformat()
    }
    await broadcast_to_room(room_id, chat_msg)

async def handle_game_move(room_id, data, player_info):
    """Oyun hamlesini işle"""
    game_state = game_states.get(room_id, {})
    
    # Sıra kontrolü
    if game_state.get('current_turn') and game_state['current_turn'] != player_info['id']:
        await websocket.send(json.dumps({
            'type': 'error',
            'message': 'Sıra sende değil!'
        }))
        return
    
    # Hamleyi uygula
    move_msg = {
        'type': 'game_move',
        'player': player_info,
        'gameType': data.get('gameType', 'xox'),
        'move': data['move'],
        'timestamp': datetime.now().isoformat()
    }
    
    # Oyun durumunu güncelle
    if data.get('gameType') == 'xox':
        await update_xox_game(room_id, data['move'], player_info)
    
    await broadcast_to_room(room_id, move_msg)

async def handle_start_game(room_id, data, player_info):
    """Oyunu başlat"""
    game_type = data.get('gameType', 'xox')
    
    game_states[room_id] = {
        'game': game_type,
        'players': list(connected_clients[room_id].values()),
        'current_turn': None,
        'board': [['' for _ in range(3)] for _ in range(3)],
        'status': 'waiting',
        'started_at': datetime.now().isoformat()
    }
    
    start_msg = {
        'type': 'game_started',
        'gameType': game_type,
        'gameState': game_states[room_id],
        'timestamp': datetime.now().isoformat()
    }
    
    await broadcast_to_room(room_id, start_msg)

async def handle_player_ready(room_id, data, player_info):
    """Oyuncu hazır durumunu güncelle"""
    player_info['ready'] = data.get('ready', False)
    
    # Tüm oyuncular hazır mı kontrol et
    all_ready = all(p.get('ready', False) for p in connected_clients[room_id].values())
    
    if all_ready and len(connected_clients[room_id]) >= 2:
        await handle_start_game(room_id, {'gameType': 'xox'}, player_info)
    
    ready_msg = {
        'type': 'player_ready_update',
        'player': player_info,
        'allReady': all_ready,
        'players': list(connected_clients[room_id].values())
    }
    
    await broadcast_to_room(room_id, ready_msg)

async def update_xox_game(room_id, move, player_info):
    """XOX oyun durumunu güncelle"""
    game_state = game_states.get(room_id, {})
    board = game_state.get('board', [['' for _ in range(3)] for _ in range(3)])
    
    try:
        row, col = move['row'], move['col']
        symbol = 'X' if game_state.get('current_turn') == player_info['id'] else 'O'
        
        if board[row][col] == '':
            board[row][col] = symbol
            
            # Sırayı değiştir
            players = list(connected_clients[room_id].values())
            current_player_index = next((i for i, p in enumerate(players) if p['id'] == player_info['id']), 0)
            next_player_index = (current_player_index + 1) % len(players)
            game_state['current_turn'] = players[next_player_index]['id']
            
            # Kazanan kontrolü
            winner = check_xox_winner(board)
            if winner:
                game_state['status'] = 'finished'
                game_state['winner'] = winner
            elif all(all(cell != '' for cell in row) for row in board):
                game_state['status'] = 'draw'
            
            game_state['board'] = board
            
    except Exception as e:
        logging.error(f"XOX güncelleme hatası: {e}")

def check_xox_winner(board):
    """XOX kazananını kontrol et"""
    # Satırlar
    for row in board:
        if row[0] == row[1] == row[2] != '':
            return row[0]
    
    # Sütunlar
    for col in range(3):
        if board[0][col] == board[1][col] == board[2][col] != '':
            return board[0][col]
    
    # Diagonal
    if board[0][0] == board[1][1] == board[2][2] != '':
        return board[0][0]
    if board[0][2] == board[1][1] == board[2][0] != '':
        return board[0][2]
    
    return None

async def broadcast_to_room(room_id, message, exclude=None):
    """Odadaki tüm client'lara mesaj gönder"""
    if room_id not in connected_clients:
        return
    
    message_str = json.dumps(message)
    disconnected = []
    
    for client in connected_clients[room_id]:
        if client != exclude:
            try:
                await client.send(message_str)
            except:
                disconnected.append(client)
    
    # Kopan bağlantıları temizle
    for client in disconnected:
        await cleanup_connection(client)

async def cleanup_connection(websocket):
    """Bağlantıyı temizle"""
    room_id = client_rooms.get(websocket)
    if room_id and room_id in connected_clients:
        player_info = connected_clients[room_id].get(websocket)
        
        if websocket in connected_clients[room_id]:
            del connected_clients[room_id][websocket]
        
        # Oyun durumunu güncelle
        if room_id in game_states:
            game_states[room_id]['players'] = list(connected_clients[room_id].values())
        
        # Ayrılma bildirimi
        leave_notification = {
            'type': 'player_left',
            'player': player_info,
            'roomId': room_id,
            'players': game_states[room_id]['players'] if room_id in game_states else [],
            'timestamp': datetime.now().isoformat()
        }
        
        await broadcast_to_room(room_id, leave_notification)
        
        if player_info:
            logging.info(f"👋 Oyuncu ayrıldı: {player_info.get('name', 'Unknown')} ({player_info.get('id', 'Unknown')}) -> Oda: {room_id}")
            logging.info(f"🏠 Oda {room_id} kalan oyuncu: {len(connected_clients[room_id])}")
    
    if websocket in client_rooms:
        del client_rooms[websocket]

def load_config():
    """Konfigürasyon dosyasını yükle"""
    try:
        with open('../json/config.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {"server": {"port": 8001, "websocket_port": 8766}}

async def start_websocket_server(port=8001):
    """WebSocket sunucusunu HTTP ile aynı portta başlat"""
    # WebSocket handler'ını HTTP server'a entegre et
    pass

def start_http_server(host='0.0.0.0', port=8001):
    """HTTP sunucusunu başlat"""
    server = ThreadingHTTPServer((host, port), MultiplayerHTTPRequestHandler)
    logging.info(f"HTTP sunucusu başlatıldı: http://{host}:{port}")
    logging.info("Çıkmak için Ctrl+C'ye basın")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logging.info("Sunucu durduruldu")
        server.shutdown()

def main():
    """Ana fonksiyon"""
    parser = argparse.ArgumentParser(description='Burak Multiplayer Oyun Sunucusu')
    parser.add_argument('--host', default='0.0.0.0', help='Host adresi')
    parser.add_argument('--port', type=int, help='HTTP portu')
    parser.add_argument('--ws-port', type=int, help='WebSocket portu')
    
    args = parser.parse_args()
    
    # Konfigürasyonu yükle
    config = load_config()
    
    http_port = args.port or config.get('server', {}).get('port', 8001)
    ws_port = args.ws_port or config.get('server', {}).get('websocket_port', 8766)
    host = args.host or config.get('server', {}).get('host', '0.0.0.0')
    
    # WebSocket'i ayrı thread'de başlat
    ws_thread = threading.Thread(target=lambda: asyncio.run(start_websocket_server(ws_port)))
    ws_thread.daemon = True
    ws_thread.start()
    
    # HTTP sunucusunu başlat
    start_http_server(host, http_port)

if __name__ == "__main__":
    main()
