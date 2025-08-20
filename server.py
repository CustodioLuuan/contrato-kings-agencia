#!/usr/bin/env python3
"""
Servidor local simples para testar o sistema de contratos
Execute: python server.py
Acesse: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os
from urllib.parse import urlparse, parse_qs

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse URL
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Se for acessar a raiz, redireciona para dashboard
        if path == '/':
            self.send_response(302)
            self.send_header('Location', '/dashboard.html')
            self.end_headers()
            return
        
        # Servir arquivos estáticos
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def main():
    # Mudar para o diretório do script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Criar servidor
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"🚀 Servidor rodando em: http://localhost:{PORT}")
        print(f"📊 Dashboard: http://localhost:{PORT}/dashboard.html")
        print(f"📄 Contrato: http://localhost:{PORT}/index.html")
        print("\nPressione Ctrl+C para parar o servidor")
        
        # Abrir dashboard automaticamente
        try:
            webbrowser.open(f'http://localhost:{PORT}/dashboard.html')
        except:
            pass
        
        # Manter servidor rodando
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Servidor parado!")

if __name__ == "__main__":
    main()

