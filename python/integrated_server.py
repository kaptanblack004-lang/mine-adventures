#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Burak Multiplayer Oyun Sunucusu
aiohttp ile HTTP ve WebSocket aynı portta çalışır
"""

import json
import os
import asyncio
import logging
from aiohttp import web, WSMsgType
from datetime import datetime

# Logging konfigürasyonü
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Global değişkenler
connected_clients = {}  # room_id -> {websocket: player_info}
client_rooms = {}  # websocket -> room_id
game_states = {}  # room_id -> game_state

class BurakGameServer:
    """Burak Multiplayer Oyun Sunucusu"""
    
    def __init__(self, host='0.0.0.0', port=8001):
        self.host = host
        self.port = port
        self.app = web.Application()
        self.setup_routes()
    
    def setup_routes(self):
        """HTTP ve WebSocket route'larını ayarla"""
        # Static files serving
        self.app.router.add_get('/', self.serve_index)
        self.app.router.add_static('/', path=os.path.join(os.path.dirname(__file__), '..', 'html'), name='static')
        
        # WebSocket endpoint
        self.app.router.add_get('/ws', self.websocket_handler)
    
    async def serve_index(self, request):
        """Ana sayfayı sun"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'html', 'index.html')
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            response = web.Response(text=content, content_type='text/html')
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            
            return response
        except FileNotFoundError:
            return web.Response(text="Index file not found", status=404)
    
    async def websocket_handler(self, request):
        """WebSocket handler"""
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        
        logging.info(f"🔌 Yeni WebSocket bağlantısı: {request.remote}")
        
        try:
            # İlk mesajı bekle (oda katılımı)
            join_message = await ws.receive_str()
            join_data = json.loads(join_message)
            
            if join_data.get('type') == 'join_room':
                room_id = join_data.get('roomId', 'Room1')
                player_name = join_data.get('player', f'Oyuncu_{int(datetime.now().timestamp())}')
                game_type = join_data.get('game', 'xox')  # oyun tipini al
                
                # Oda kontrolü
                valid_rooms = ['Room1', 'Room2', 'Room3']
                if room_id not in valid_rooms:
                    await ws.send_str(json.dumps({
                        'type': 'error',
                        'message': f'Geçersiz oda. Mevcut odalar: {", ".join(valid_rooms)}'
                    }))
                    return ws
                
                # Odaya katıl
                if room_id not in connected_clients:
                    connected_clients[room_id] = {}
                    game_states[room_id] = {
                        'game': game_type,  # oyun tipini kaydet
                        'players': [],
                        'current_turn': None,
                        'board': []
                    }
                
                player_id = f"player_{int(datetime.now().timestamp())}"
                player_info = {
                    'id': player_id,
                    'name': player_name,
                    'joined_at': datetime.now().isoformat()
                }
                
                connected_clients[room_id][ws] = player_info
                client_rooms[ws] = room_id
                
                # Oda durumunu güncelle
                game_states[room_id]['players'] = list(connected_clients[room_id].values())
                
                logging.info(f"✅ Oyuncu katıldı: {player_name} -> Oda: {room_id}")
                logging.info(f"🏠 Oda {room_id} toplam oyuncu: {len(connected_clients[room_id])}")
                
                # Katılma bildirimi
                join_notification = {
                    'type': 'room_joined',
                    'player': player_info,
                    'roomId': room_id,
                    'players': game_states[room_id]['players']
                }
                
                # Odadaki herkese gönder
                await self.broadcast_to_room(room_id, join_notification)
                
                # Odadaki oyuncu sayısı 2 olunca game_start gönder
                if len(connected_clients[room_id]) == 2:
                    game_type = game_states[room_id].get('game', 'xox')  # kaydedilen oyun tipini kullan
                    clients = list(connected_clients[room_id].keys())
                    players = list(connected_clients[room_id].values())
                    
                    start_msg_1 = {
                        'type': 'game_start',
                        'gameData': {'board': [], 'scores': {}, 'game': game_type},
                        'isFirstPlayer': True,
                        'opponent': players[1]['name']
                    }
                    start_msg_2 = {
                        'type': 'game_start',
                        'gameData': {'board': [], 'scores': {}, 'game': game_type},
                        'isFirstPlayer': False,
                        'opponent': players[0]['name']
                    }
                    await clients[0].send_str(json.dumps(start_msg_1))
                    await clients[1].send_str(json.dumps(start_msg_2))
                    
                    logging.info(f"🎮 Oyun başlatıldı: Oda {room_id}, Oyun: {game_type}")
                    logging.info(f"👥 Oyuncular: {players[0]['name']} vs {players[1]['name']}")
            
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
                        if data['type'] == 'chat':
                            await self.handle_chat_message(room_id, data, player_info)
                        
                        elif data['type'] == 'game_move':
                            await self.handle_game_move(room_id, data, player_info)
                        
                        elif data['type'] == 'leave_room':
                            await self.handle_leave_room(room_id, player_info)
                        
                    except json.JSONDecodeError:
                        logging.warning(f"Geçersiz JSON mesajı: {msg.data}")
                    except Exception as e:
                        logging.error(f"Mesaj işleme hatası: {e}")
        
        except Exception as e:
            logging.error(f"WebSocket bağlantı hatası: {e}")
        finally:
            await self.cleanup_connection(ws)
        
        return ws
    
    async def handle_chat_message(self, room_id, data, player_info):
        """Chat mesajını işle"""
        chat_msg = {
            'type': 'chat',
            'player': player_info['name'],
            'message': data['message'][:200],  # Max 200 karakter
            'timestamp': datetime.now().isoformat()
        }
        await self.broadcast_to_room(room_id, chat_msg)
    
    async def handle_game_move(self, room_id, data, player_info):
        """Oyun hamlesini işle"""
        move_msg = {
            'type': 'game_update',
            'gameData': data.get('gameData', {}),
            'isMyTurn': False  # Rakip için
        }
        
        # Hamleyi odaya broadcast et
        await self.broadcast_to_room(room_id, move_msg)
    
    async def handle_leave_room(self, room_id, player_info):
        """Oyuncu odadan ayrıldığında"""
        await self.cleanup_connection(list(client_rooms.keys())[0])
    
    async def start_game(self, room_id):
        """Oyunu başlat"""
        players = list(connected_clients[room_id].values())
        
        game_states[room_id].update({
            'status': 'playing',
            'started_at': datetime.now().isoformat(),
            'board': ['' for _ in range(9)],  # XOX için varsayılan
            'current_turn': players[0]['id']
        })
        
        # Oyun başlama bildirimi
        start_msg = {
            'type': 'game_started',
            'gameData': game_states[room_id],
            'isFirstPlayer': True  # İlk oyuncu için
        }
        
        await self.broadcast_to_room(room_id, start_msg)
        
        logging.info(f"🎮 Oyun başladı: Oda {room_id}")
    
    async def broadcast_to_room(self, room_id, message, exclude=None):
        """Odadaki tüm client'lara mesaj gönder"""
        if room_id not in connected_clients:
            return
        
        message_str = json.dumps(message)
        disconnected = []
        
        for client in connected_clients[room_id]:
            if client != exclude:
                try:
                    await client.send_str(message_str)
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
            if player_info:
                leave_notification = {
                    'type': 'player_left',
                    'player': player_info['name'],
                    'roomId': room_id,
                    'players': game_states[room_id]['players'] if room_id in game_states else [],
                    'timestamp': datetime.now().isoformat()
                }
                
                await self.broadcast_to_room(room_id, leave_notification)
                
                logging.info(f"👋 Oyuncu ayrıldı: {player_info.get('name', 'Unknown')} -> Oda: {room_id}")
        
        if ws in client_rooms:
            del client_rooms[ws]
    
    async def start_server(self):
        """Sunucuyu başlat"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        
        site = web.TCPSite(runner, self.host, self.port)
        await site.start()
        
        logging.info(f"🌐 Burak Multiplayer Sunucusu başlatıldı!")
        logging.info(f"📡 HTTP & WebSocket: http://{self.host}:{self.port}")
        logging.info(f"🔌 WebSocket Endpoint: ws://{self.host}:{self.port}/ws")
        logging.info(f"📁 Static Files: html/, css/, js/")
        logging.info(f"🏠 Odalar: Room1, Room2, Room3")
        logging.info("⏹️ Çıkmak için Ctrl+C'ye basın")
        
        try:
            await asyncio.Future()  # Sonsuz bekle
        except KeyboardInterrupt:
            logging.info("🛑 Sunucu durduruluyor...")
            await runner.cleanup()

def main():
    """Ana fonksiyon"""
    server = BurakGameServer()
    
    try:
        asyncio.run(server.start_server())
    except KeyboardInterrupt:
        logging.info("🛑 Sunucu kapatıldı")

if __name__ == "__main__":
    main()
