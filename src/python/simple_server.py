#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Burak Ultra Profesyonel Web Sitesi - Basit ve Hızlı Server
"""

import json
import os
import asyncio
import websockets
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import argparse

# Basit WebSocket handler
connected_clients = set()

async def websocket_handler(websocket, path):
    """Basit WebSocket handler."""
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            # Mesajı tüm client'lara gönder
            for client in connected_clients:
                if client != websocket:
                    try:
                        await client.send(message)
                    except:
                        pass
    except:
        pass
    finally:
        connected_clients.remove(websocket)

# Güvenli HTTP handler
class SecureHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;")
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Cache-Control', 'max-age=3600')
        super().end_headers()

    def log_message(self, format, *args):
        # Sadece hatalar için log
        if "404" in format or "500" in format:
            print(f"HTTP Error: {format % args}")

    def translate_path(self, path):
        # Dosyaları üst dizinden serve et
        path = super().translate_path(path)
        if path.startswith(os.getcwd()):
            # Üst dizine yönlendir
            parent_dir = os.path.dirname(os.getcwd())
            return os.path.join(parent_dir, os.path.relpath(path, os.getcwd()))
        return path

# WebSocket server başlat
async def start_websocket_server(port=8765):
    async with websockets.serve(websocket_handler, "0.0.0.0", port):
        print(f"WebSocket server: ws://0.0.0.0:{port}")
        await asyncio.Future()

# HTTP server başlat
def start_http_server(host='0.0.0.0', port=8000):
    server = ThreadingHTTPServer((host, port), SecureHTTPRequestHandler)
    print(f"HTTP server: http://{host}:{port}")
    print("Çıkmak için Ctrl+C'ye basın")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Server durduruldu")

# Ana fonksiyon
def main():
    parser = argparse.ArgumentParser(description='Burak Web Server')
    parser.add_argument('--host', default='0.0.0.0', help='Host')
    parser.add_argument('--port', type=int, default=8000, help='HTTP Port')
    parser.add_argument('--ws-port', type=int, default=8765, help='WebSocket Port')

    args = parser.parse_args()

    # Üst dizine geç (html, css, js dosyaları için)
    parent_dir = os.path.dirname(os.getcwd())
    os.chdir(parent_dir)

    # WebSocket'i ayrı thread'de başlat
    import threading
    ws_thread = threading.Thread(target=lambda: asyncio.run(start_websocket_server(args.ws_port)))
    ws_thread.daemon = True
    ws_thread.start()

    # HTTP server'ı başlat
    start_http_server(args.host, args.port)

if __name__ == "__main__":
    main()