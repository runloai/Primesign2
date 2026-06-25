#!/usr/bin/env python3
"""Simple HTTP server that serves static files AND accepts config.json publishes."""
import http.server
import json
import os
import sys

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
CONFIG_PATH = os.path.join(PUBLIC_DIR, "config.json")
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

class PublishHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)
    
    def do_POST(self):
        if self.path == "/api/publish":
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length))
                # Write to both public/ and dist/
                for d in [PUBLIC_DIR, DIST_DIR]:
                    os.makedirs(d, exist_ok=True)
                    with open(os.path.join(d, "config.json"), "w") as f:
                        json.dump(data, f, indent=2)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "services": len(data.get("services", []))}).encode())
                print(f"✅ Config published: {len(data.get('services', []))} services")
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            super().do_POST()
    
    def do_GET(self):
        if self.path == "/api/health":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        else:
            super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8888
    server = http.server.HTTPServer(("0.0.0.0", port), PublishHandler)
    print(f"🚀 Primesign server on port {port} (publish API: /api/publish)")
    server.serve_forever()
