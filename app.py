# Project file: app.py — main HTTP server and router; serves templates and exposes /api/ endpoints handled by `database.py`
import http.server
import socketserver
import json
import os
from database import init_db, handle_request

PORT = 8000

class ClinicHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            self._send_json(handle_request(self.path, 'GET'))
        else:
            # Extract path without query string
            path_only = self.path.split('?')[0]
            query_string = self.path[len(path_only):] if len(self.path) > len(path_only) else ''
            
            if path_only == '/' or path_only == '/index.html':
                self.path = f'/templates/index.html{query_string}'
                return super().do_GET()
            elif path_only.endswith('.html') and not path_only.startswith('/templates/'):
                self.path = f'/templates{path_only}{query_string}'
                return super().do_GET()
            else:
                return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        response = handle_request(self.path, 'POST', data)
        self._send_json(response)

    def _send_json(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

if __name__ == "__main__":
    init_db()
    print(f"Clinic System: http://localhost:{PORT}")
    socketserver.TCPServer(("", PORT), ClinicHandler).serve_forever()