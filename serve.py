#!/usr/bin/env python3
"""Локальний сервер для перегляду сайту «Незламна Хортиця».
Запуск:  python3 serve.py   →   http://127.0.0.1:5566
"""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5566
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"Серверуємо «Незламну Хортицю» на http://127.0.0.1:{PORT}")
    httpd.serve_forever()
