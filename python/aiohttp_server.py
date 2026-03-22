#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Burak Ultra Profesyonel Multiplayer Oyun Sunucusu
aiohttp ile HTTP ve WebSocket aynı portta entegre
"""

import json
import os
import asyncio
import logging
from aiohttp import web, WSMsgType
from datetime import datetime
import time

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

class MultiplayerGameServer:
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()
        self.load_config()
    
    def load_config(self):
        """Konfigürasyon dosyasını yükle"""
        try:
            with open('../json/config.json', 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        except:
            self.config = {"server": {"port": 8001, "websocket_port": 8766}}
    
    def setup_routes(self):
        """HTTP ve WebSocket route'larını ayarla"""
        # Static files
        self.app.router.add_get('/', self.serve_index)
        self.app.router.add_get('/html/index.html', self.serve_index)
        self.app.router.add_static('/', '../', name='static')
        
        # WebSocket
        self.app.router.add_get('/ws', self.websocket_handler)
    
    async def serve_index(self, request):
        """Ana sayfayı serve et"""
        try:
            with open('../html/index.html', 'r', encoding='utf-8') as f:
                content = f.read()
            return web.Response(text=content, content_type='text/html')
        except FileNotFoundError:
            return web.Response(text="Index file not found", status=404)
    
    async def websocket_handler(self, request):
        """WebSocket handler"""
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        
        client_info = {
            'remote_address': request.remote,
            'timestamp': datetime.now().isoformat()
        }
        
        logging.info(f"🔌 Yeni WebSocket bağlantısı: {client_info}")
        logging.info(f"📋 Request headers: {dict(request.headers)}")
        
        try:
            # İlk mesajı bekle (oda katılımı)
            msg = await ws.receive()
            logging.info(f"📨 İlk mesaj alındı: {msg.type} - {msg.data[:100] if msg.type == WSMsgType.TEXT else msg.type}")
            
            if msg.type == WSMsgType.TEXT:
                join_data = json.loads(msg.data)
                
                if join_data.get('type') == 'join_room':
                    room_id = join_data.get('roomId', 'Room1')
                    player_id = join_data.get('playerId', f'player_{int(time.time())}')
                    player_name = join_data.get('playerName', f'Oyuncu_{player_id[-6:]}')
                    
                    # Oda kontrolü
                    max_rooms = self.config.get('multiplayer', {}).get('rooms', ['Room1', 'Room2', 'Room3'])
                    if room_id not in max_rooms:
                        await ws.send_json({
                            'type': 'error',
                            'message': f'Geçersiz oda. Mevcut odalar: {", ".join(max_rooms)}'
                        })
                        return ws
                    
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
                    
                    connected_clients[room_id][ws] = player_info
                    client_rooms[ws] = room_id
                    
                    # Oda durumunu güncelle
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
                    await self.broadcast_to_room(room_id, join_notification, exclude=ws)
            
            # Ana mesaj döngüsü
            async for msg in ws:
                if msg.type == WSMsgType.TEXT:
                    try:
                        data = json.loads(msg.data)
                        room_id = client_rooms.get(ws)
                        
                        if not room_id:
                            continue
                        
                        player_info = connected_clients[room_id].get(ws, {})
                        
                        # Mesaj tipine göre işle
                        if data['type'] == 'chat_message':
                            await self.handle_chat_message(room_id, data, player_info)
                        
                        elif data['type'] == 'game_move':
                            await self.handle_game_move(room_id, data, player_info)
                        
                        elif data['type'] == 'start_game':
                            await self.handle_start_game(room_id, data, player_info)
                        
                        elif data['type'] == 'player_ready':
                            await self.handle_player_ready(room_id, data, player_info)
                        
                    except json.JSONDecodeError:
                        logging.error(f"JSON parse hatası: {msg.data[:100]}")
                        continue
                    except Exception as e:
                        logging.error(f"Mesaj işleme hatası: {e}")
                
                elif msg.type == WSMsgType.ERROR:
                    logging.error(f'WebSocket bağlantı hatası: {ws.exception()}')
                elif msg.type == WSMsgType.PING:
                    await ws.pong()
                    logging.info("🏓 PING alındı, PONG gönderildi")
        
        except Exception as e:
            logging.error(f"❌ WebSocket bağlantı hatası: {e}")
        finally:
            await self.cleanup_connection(ws)
        
        return ws
    
    async def handle_chat_message(self, room_id, data, player_info):
        """Chat mesajını işle"""
        chat_msg = {
            'type': 'chat_message',
            'player': player_info,
            'message': data['message'][:200],  # Max 200 karakter
            'timestamp': datetime.now().isoformat()
        }
        await self.broadcast_to_room(room_id, chat_msg)
    
    async def handle_game_move(self, room_id, data, player_info):
        """Oyun hamlesini işle"""
        game_state = game_states.get(room_id, {})
        
        # Sıra kontrolü
        if game_state.get('current_turn') and game_state['current_turn'] != player_info['id']:
            await ws.send_json({
                'type': 'error',
                'message': 'Sıra sende değil!'
            })
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
            await self.update_xox_game(room_id, data['move'], player_info)
        
        await self.broadcast_to_room(room_id, move_msg)
    
    async def handle_start_game(self, room_id, data, player_info):
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
        
        await self.broadcast_to_room(room_id, start_msg)
    
    async def handle_player_ready(self, room_id, data, player_info):
        """Oyuncu hazır durumunu güncelle"""
        player_info['ready'] = data.get('ready', False)
        
        # Tüm oyuncular hazır mı kontrol et
        all_ready = all(p.get('ready', False) for p in connected_clients[room_id].values())
        
        if all_ready and len(connected_clients[room_id]) >= 2:
            await self.handle_start_game(room_id, {'gameType': 'xox'}, player_info)
        
        ready_msg = {
            'type': 'player_ready_update',
            'player': player_info,
            'allReady': all_ready,
            'players': list(connected_clients[room_id].values())
        }
        
        await self.broadcast_to_room(room_id, ready_msg)
    
    async def update_xox_game(self, room_id, move, player_info):
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
                winner = self.check_xox_winner(board)
                if winner:
                    game_state['status'] = 'finished'
                    game_state['winner'] = winner
                elif all(all(cell != '' for cell in row) for row in board):
                    game_state['status'] = 'draw'
                
                game_state['board'] = board
                
        except Exception as e:
            logging.error(f"XOX güncelleme hatası: {e}")
    
    def check_xox_winner(self, board):
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
    
    async def broadcast_to_room(self, room_id, message, exclude=None):
        """Odadaki tüm client'lara mesaj gönder"""
        if room_id not in connected_clients:
            return
        
        disconnected = []
        
        for client in connected_clients[room_id]:
            if client != exclude:
                try:
                    await client.send_json(message)
                except:
                    disconnected.append(client)
        
        # Kopan bağlantıları temizle
        for client in disconnected:
            await self.cleanup_connection(client)
    
    async def cleanup_connection(self, ws):
        """Bağlantıyı temizle"""
        room_id = client_rooms.get(ws)
        if room_id and room_id in connected_clients:
            player_info = connected_clients[room_id].get(ws)
            
            if ws in connected_clients[room_id]:
                del connected_clients[room_id][ws]
            
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
            
            await self.broadcast_to_room(room_id, leave_notification)
            
            if player_info:
                logging.info(f"👋 Oyuncu ayrıldı: {player_info.get('name', 'Unknown')} ({player_info.get('id', 'Unknown')}) -> Oda: {room_id}")
                logging.info(f"🏠 Oda {room_id} kalan oyuncu: {len(connected_clients[room_id])}")
        
        if ws in client_rooms:
            del client_rooms[ws]
    
    async def start_server(self, host='0.0.0.0', port=8001):
        """Sunucuyu başlat"""
        # CORS middleware ekle
        @web.middleware
        async def cors_middleware(request, handler):
            response = await handler(request)
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response
        
        self.app.middlewares.append(cors_middleware)
        
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()
        
        logging.info(f"🌐 HTTP+WebSocket Sunucusu başlatıldı: http://{host}:{port}")
        logging.info(f"🔌 WebSocket endpoint: ws://{host}:{port}/ws")
        logging.info(f"🌍 Cloudflare için: https://members-piano-illustration-particles.trycloudflare.com/html/index.html")
        
        # Sunucuyu açık tut
        try:
            while True:
                await asyncio.sleep(3600)  # Saatte bir kontrol et
        except asyncio.CancelledError:
            logging.info("Sunucu durduruldu")

def main():
    """Ana fonksiyon"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Burak Multiplayer Oyun Sunucusu (aiohttp)')
    parser.add_argument('--host', default='0.0.0.0', help='Host adresi')
    parser.add_argument('--port', type=int, default=8001, help='Port')
    
    args = parser.parse_args()
    
    server = MultiplayerGameServer()
    
    try:
        asyncio.run(server.start_server(args.host, args.port))
    except KeyboardInterrupt:
        logging.info("Sunucu durduruldu")

if __name__ == "__main__":
    main()
