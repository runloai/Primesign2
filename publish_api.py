#!/usr/bin/env python3
"""Lightweight publish API server on port 9998.

Writes to public/config.json AND dist/config.json on every publish.
Includes health check, CORS, payload validation, and OOM protection.
"""
import json, os, sys, signal
from http.server import HTTPServer, BaseHTTPRequestHandler

BASE = os.path.dirname(os.path.abspath(__file__))
PUBLIC_CONFIG = os.path.join(BASE, "public", "config.json")
DIST_CONFIG = os.path.join(BASE, "dist", "config.json")

class PublishAPI(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def _respond(self, status, body):
        self._set_headers(status)
        self.wfile.write(json.dumps(body).encode())

    def do_GET(self):
        if self.path == "/health":
            exists = os.path.exists(PUBLIC_CONFIG)
            self._respond(200, {"status": "ok", "config_exists": exists})
        else:
            self._respond(404, {"error": "not found"})

    def do_POST(self):
        if self.path == "/publish":
            try:
                length = int(self.headers.get("Content-Length", 0))
                if length == 0 or length > 10 * 1024 * 1024:
                    self._respond(400, {"error": "invalid content length"})
                    return

                raw = self.rfile.read(length)
                data = json.loads(raw)

                # Validate: require at least some meaningful data
                has_services = len(data.get("services", [])) > 0
                has_contact = bool(data.get("contact"))
                has_portfolio = len(data.get("portfolio", [])) > 0
                if not (has_services or has_contact or has_portfolio):
                    self._respond(400, {
                        "error": "payload must include services, contact, or portfolio data",
                        "hint": "use the Save button in admin to build a complete config"
                    })
                    return

                data["_version"] = "2.1"

                written = []
                for path in [PUBLIC_CONFIG, DIST_CONFIG]:
                    d = os.path.dirname(path)
                    os.makedirs(d, exist_ok=True)
                    # Atomic write: write to temp then rename
                    tmp = path + ".tmp"
                    with open(tmp, "w") as f:
                        json.dump(data, f, indent=2)
                    os.replace(tmp, path)
                    written.append(path)

                svc_count = len(data.get("services", []))
                print(f"Published {svc_count} services to {len(written)} locations")
                self._respond(200, {"ok": True, "services": svc_count, "paths": written})
            except json.JSONDecodeError:
                self._respond(400, {"error": "invalid JSON payload"})
            except Exception as e:
                print(f"Publish error: {e}")
                self._respond(500, {"error": str(e)})
        else:
            self._respond(404, {"error": "not found"})

    def do_OPTIONS(self):
        self._set_headers(200)

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9998
    server = HTTPServer(("0.0.0.0", port), PublishAPI)
    print(f"Publish API listening on 0.0.0.0:{port}")
    print(f"  Writes to: {PUBLIC_CONFIG}")
    print(f"  Writes to: {DIST_CONFIG}")
    server.serve_forever()
