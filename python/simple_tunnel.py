#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Basit HTTP Tunnel - LocalTunnel alternatifi
"""

import asyncio
import aiohttp
import json
import logging
from aiohttp import web
import socket

logging.basicConfig(level=logging.INFO)

async def proxy_handler(request):
    """Tunnel proxy handler"""
    try:
        # İstekleri localhost:8001'e yönlendir
        target_url = f"http://127.0.0.1:8001{request.path_qs}"
        
        async with aiohttp.ClientSession() as session:
            # Headers'ı kopyala
            headers = dict(request.headers)
            headers.pop('Host', None)  # Host header'ını kaldır
            
            # İsteği yönlendir
            async with session.request(
                method=request.method,
                url=target_url,
                headers=headers,
                data=await request.read() if request.method in ['POST', 'PUT', 'PATCH'] else None
            ) as response:
                # Response'u oluştur
                resp_data = await response.read()
                
                # Headers'ı kopyala
                response_headers = {}
                for key, value in response.headers.items():
                    if key.lower() not in ['content-encoding', 'transfer-encoding', 'content-length']:
                        response_headers[key] = value
                
                return web.Response(
                    body=resp_data,
                    status=response.status,
                    headers=response_headers
                )
                
    except Exception as e:
        logging.error(f"Proxy hatası: {e}")
        return web.Response(text=f"Tunnel hatası: {e}", status=500)

async def get_public_ip():
    """Public IP'yi al"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('https://api.ipify.org') as response:
                return await response.text()
    except:
        return "localhost"

async def main():
    """Ana fonksiyon"""
    # Local server'ı kontrol et
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('http://127.0.0.1:8001', timeout=5) as response:
                logging.info("✅ Local sunucu çalışıyor")
    except Exception as e:
        logging.error(f"❌ Local sunucu çalışmıyor! Hata: {e}")
        logging.error("Önce sunucuyu başlatın.")
        return
    
    # Public IP'yi al
    public_ip = await get_public_ip()
    
    # Tunnel sunucusunu başlat
    app = web.Application()
    app.router.add_route('*', '/{path:.*}', proxy_handler)
    
    # CORS middleware
    @web.middleware
    async def cors_middleware(request, handler):
        response = await handler(request)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
    app.middlewares.append(cors_middleware)
    
    runner = web.AppRunner(app)
    await runner.setup()
    
    # Port 8080'de tunnel başlat
    site = web.TCPSite(runner, '0.0.0.0', 8080)
    await site.start()
    
    logging.info(f"🌐 Tunnel başlatıldı: http://0.0.0.0:8080")
    logging.info(f"🌍 Public IP: {public_ip}")
    logging.info(f"🔗 Tunnel URL: http://{public_ip}:8080")
    logging.info(f"📱 Oyun URL: http://{public_ip}:8080/html/index.html")
    logging.info(f"🔌 WebSocket: ws://{public_ip}:8080/ws")
    
    try:
        while True:
            await asyncio.sleep(3600)
    except KeyboardInterrupt:
        logging.info("Tunnel durduruldu")

if __name__ == '__main__':
    asyncio.run(main())
