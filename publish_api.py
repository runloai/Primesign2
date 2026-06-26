#!/usr/bin/env python3
"""Lightweight publish-only API server on port 9999."""
import json, os, sys
from http.server import HTTPServer, BaseHTTPRequestHandler

BASE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(BASE, "public", "config.json")
DIST = os.path.join(BASE, "dist", "config.json")

class PublishAPI(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/api/publish":
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length))
                for path in [CONFIG, DIST]:
                    os.makedirs(os.path.dirname(path), exist_ok=True)
                    with open(path, "w") as f:
                        json.dump(data, f, indent=2)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "services": len(data.get("services", []))}).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    def log_message(self, *a): pass

port = int(sys.argv[1]) if len(sys.argv) > 1 else 9999
HTTPServer(("0.0.0.0", port), PublishAPI).serve_forever()
