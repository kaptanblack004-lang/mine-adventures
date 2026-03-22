#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Burak Ultra Profesyonel Web Sitesi - Gelişmiş Python Backend
Bu script gelişmiş özellikler, konfigürasyon yönetimi ve logging içerir.
"""

import json
import os
import logging
import sys
import asyncio
import websockets
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import ssl
import argparse
import threading
from datetime import datetime

# Logging konfigürasyonu - performans için sadece hatalar
logging.basicConfig(
    level=logging.WARNING,  # Sadece uyarılar ve hatalar
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        # logging.StreamHandler()  # Konsol logunu kaldır - performans için
    ]
)

def selamla(isim):
    """Kullanıcıyı selamlar."""
    return f"Merhaba, {isim}! Burak'ın profesyonel sitesine hoş geldiniz."

def veri_yukle(dosya_yolu):
    """JSON dosyasından veri yükler."""
    try:
        with open(dosya_yolu, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Hata: {dosya_yolu} dosyası bulunamadı.")
        return None
    except json.JSONDecodeError:
        print(f"Hata: {dosya_yolu} geçerli bir JSON dosyası değil.")
        return None

def veri_kaydet(dosya_yolu, veri):
    """Veriyi JSON dosyasına kaydeder."""
    try:
        with open(dosya_yolu, 'w', encoding='utf-8') as f:
            json.dump(veri, f, indent=4, ensure_ascii=False)
        print(f"Veri başarıyla {dosya_yolu} dosyasına kaydedildi.")
    except Exception as e:
        print(f"Veri kaydedilirken hata: {e}")

class UltraSecureHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Ultra güvenli HTTP istek işleyicisi."""

    # Buffer size'ı artır - performans için
    bufsize = 64 * 1024  # 64KB buffer

    def end_headers(self):
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;")
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        self.send_header('Cache-Control', 'max-age=3600')  # 1 saat cache için
        super().end_headers()

    def log_message(self, format, *args):
        # Performans için sadece hatalar loglansın
        if "404" in format or "500" in format:
            logging.warning(f"{self.address_string()} - {format % args}")
        # Normal request'ler için loglama yapma

# WebSocket bağlantıları - oda bazlı
connected_clients = {}  # room_id -> set of websockets
client_rooms = {}  # websocket -> room_id

async def websocket_handler(websocket, path):
    """WebSocket bağlantı handler'ı - optimize edilmiş."""
    try:
        # İlk mesajı bekle (oda katılımı)
        join_message = await websocket.recv()
        join_data = json.loads(join_message)

        if join_data.get('type') == 'join_room':
            room_id = join_data.get('roomId', 'default')
            player_id = join_data.get('playerId', f'player_{id(websocket)}')

            # Odaya katıl
            if room_id not in connected_clients:
                connected_clients[room_id] = set()
            connected_clients[room_id].add(websocket)
            client_rooms[websocket] = room_id

            # Katılma mesajını oda üyelerine gönder
            join_notification = {
                'type': 'player_joined',
                'playerId': player_id,
                'roomId': room_id,
                'players': list(connected_clients[room_id])  # Sadece websocket objeleri değil
            }

            # Bu odadaki diğer client'lara gönder
            for client in connected_clients[room_id]:
                if client != websocket:
                    try:
                        await client.send(json.dumps(join_notification))
                    except:
                        pass  # Client bağlantısı kopmuş olabilir

            logging.info(f"Oyuncu {player_id} odaya katıldı: {room_id}")

        # Ana mesaj döngüsü
        async for message in websocket:
            try:
                data = json.loads(message)
                room_id = client_rooms.get(websocket)

                if not room_id:
                    continue

                # Mesaj tipine göre işle
                if data['type'] == 'chat_message':
                    # Chat mesajını odaya gönder
                    chat_msg = {
                        'type': 'chat_message',
                        'playerId': data.get('playerId', 'unknown'),
                        'message': data['message'],
                        'timestamp': data.get('timestamp', int(asyncio.get_event_loop().time() * 1000))
                    }

                    for client in connected_clients[room_id]:
                        if client != websocket:
                            try:
                                await client.send(json.dumps(chat_msg))
                            except:
                                pass

                elif data['type'] == 'game_move':
                    # Oyun hamlesini odaya gönder
                    move_msg = {
                        'type': 'game_move',
                        'playerId': data.get('playerId', 'unknown'),
                        'gameType': data.get('gameType', 'unknown'),
                        'move': data['move']
                    }

                    for client in connected_clients[room_id]:
                        if client != websocket:
                            try:
                                await client.send(json.dumps(move_msg))
                            except:
                                pass

            except json.JSONDecodeError:
                continue  # Geçersiz JSON, görmezden gel
            except Exception as e:
                logging.error(f"WebSocket mesaj hatası: {e}")
                break

    except Exception as e:
        logging.error(f"WebSocket bağlantı hatası: {e}")
    finally:
        # Bağlantıyı temizle
        room_id = client_rooms.get(websocket)
        if room_id and websocket in connected_clients.get(room_id, set()):
            connected_clients[room_id].remove(websocket)

            # Ayrılma mesajını gönder
            leave_notification = {
                'type': 'player_left',
                'roomId': room_id,
                'players': list(connected_clients[room_id]) if room_id in connected_clients else []
            }

            for client in connected_clients.get(room_id, set()):
                try:
                    await client.send(json.dumps(leave_notification))
                except:
                    pass

        if websocket in client_rooms:
            del client_rooms[websocket]

def start_websocket_server(port=8765):
    """WebSocket server'ı başlat."""
    start_server = websockets.serve(websocket_handler, "0.0.0.0", port)
    logging.info(f"WebSocket server başlatıldı: ws://0.0.0.0:{port}")
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

def konfig_yukle(dosya_yolu):
    """Konfigürasyon dosyasını yükler."""
    try:
        with open(dosya_yolu, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.warning(f"Konfigürasyon dosyası bulunamadı: {dosya_yolu}")
        return {}
    except json.JSONDecodeError as e:
        logging.error(f"Konfigürasyon dosyası geçersiz JSON: {e}")
        return {}

def yedek_al(dosya_yolu):
    """Dosyanın yedeğini alır."""
    if os.path.exists(dosya_yolu):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        yedek_yolu = f"{dosya_yolu}.backup_{timestamp}"
        try:
            with open(dosya_yolu, 'r', encoding='utf-8') as src:
                with open(yedek_yolu, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            logging.info(f"Yedek alındı: {yedek_yolu}")
        except Exception as e:
            logging.error(f"Yedek alınırken hata: {e}")

def web_sunucusu_baslat(host='localhost', port=8000, ssl_enabled=False, config=None):
    """Gelişmiş web sunucusu başlatır."""
    try:
        server_address = (host, port)
        httpd = ThreadingHTTPServer(server_address, UltraSecureHTTPRequestHandler)

        if ssl_enabled and config:
            # SSL sertifikası (gerçek kullanımda geçerli sertifika gerekli)
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            # context.load_cert_chain(certfile=config.get('ssl_cert'), keyfile=config.get('ssl_key'))
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            logging.info("SSL etkinleştirildi.")

        logging.info(f"Ultra profesyonel sunucu başlatıldı: http{'s' if ssl_enabled else ''}://{host}:{port}")
        logging.info("Çıkmak için Ctrl+C'ye basın.")

        # WebSocket server'ı başlat
        asyncio.run(start_websocket_server_async(8765))
    except KeyboardInterrupt:
        logging.info("Sunucu durduruldu.")
    except Exception as e:
        logging.error(f"Sunucu başlatılırken hata: {e}")

async def start_websocket_server_async(port=8765):
    """WebSocket server'ı asenkron olarak başlat."""
    async with websockets.serve(websocket_handler, "0.0.0.0", port):
        logging.info(f"WebSocket server başlatıldı: ws://0.0.0.0:{port}")
        await asyncio.Future()  # Sonsuza kadar çalış

def istatistik_goster():
    """Site istatistiklerini gösterir."""
    json_dosya = os.path.join(os.path.dirname(__file__), '..', 'json', 'data.json')
    veri = veri_yukle(json_dosya)
    if veri:
        proje_sayisi = len(veri.get('projeler', []))
        blog_sayisi = len(veri.get('blog', []))
        print(f"Proje sayısı: {proje_sayisi}")
        print(f"Blog yazısı sayısı: {blog_sayisi}")
        print(f"Site sürümü: {veri.get('version', 'Bilinmiyor')}")

def main():
    """Ana fonksiyon - gelişmiş argüman parsing ile."""
    parser = argparse.ArgumentParser(description='Burak Ultra Profesyonel Web Sitesi Sunucusu')
    parser.add_argument('command', choices=['server', 'stats', 'backup'], help='Komut')
    parser.add_argument('--host', default='localhost', help='Sunucu hostu')
    parser.add_argument('--port', type=int, default=8000, help='Sunucu portu')
    parser.add_argument('--ssl', action='store_true', help='SSL etkinleştir')
    parser.add_argument('--config', default='../json/config.json', help='Konfigürasyon dosyası')

    args = parser.parse_args()

    # Konfigürasyon yükle
    config_dosya = os.path.join(os.path.dirname(__file__), args.config)
    config = konfig_yukle(config_dosya)

    if args.command == 'server':
        host = config.get('server', {}).get('host', args.host)
        port = config.get('server', {}).get('port', args.port)
        ssl_enabled = config.get('server', {}).get('ssl', args.ssl)
        web_sunucusu_baslat(host, port, ssl_enabled, config)
    elif args.command == 'stats':
        istatistik_goster()
    elif args.command == 'backup':
        json_dosya = os.path.join(os.path.dirname(__file__), '..', 'json', 'data.json')
        yedek_al(json_dosya)

if __name__ == "__main__":
    main()