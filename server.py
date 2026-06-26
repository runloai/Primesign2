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
    
    def _atomic_write(self, path, data):
        d = os.path.dirname(path)
        os.makedirs(d, exist_ok=True)
        tmp = path + ".tmp"
        try:
            with open(tmp, "w") as f:
                json.dump(data, f, indent=2)
            os.replace(tmp, path)
        except Exception:
            if os.path.exists(tmp):
                os.unlink(tmp)
            raise

    def do_POST(self):
        if self.path == "/api/publish":
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length))
                # Don't overwrite with empty data
                if not data.get("services") and not data.get("contact"):
                    with open(os.path.join(PUBLIC_DIR, "config.json")) as f:
                        svc_count = json.load(f).get("services", [])
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "empty payload", "existing_services": len(svc_count)}).encode())
                    print(f"❌ Rejected empty publish")
                    return
                # Write to both public/ and dist/ atomically
                for d in [PUBLIC_DIR, DIST_DIR]:
                    self._atomic_write(os.path.join(d, "config.json"), data)
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
        elif self.path == "/" or "." not in self.path.split("/")[-1]:
            # Serve index.html for all non-file paths (SPA routing)
            self.path = "/index.html"
            return super().do_GET()
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
