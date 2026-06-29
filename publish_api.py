#!/usr/bin/env python3
"""Lightweight publish API server on port 9998.

Writes to public/config.json AND dist/config.json on every publish.
Includes health check, CORS, payload validation, and OOM protection.
Also handles image uploads - saves to public/images/uploads/
"""
import json, os, sys, signal, base64, uuid
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

BASE = os.path.dirname(os.path.abspath(__file__))
PUBLIC_CONFIG = os.path.join(BASE, "public", "config.json")
DIST_CONFIG = os.path.join(BASE, "dist", "config.json")
UPLOAD_DIR = os.path.join(BASE, "public", "images", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

    def _atomic_write(self, path, data):
        d = os.path.dirname(path)
        os.makedirs(d, exist_ok=True)
        tmp = path + ".tmp"
        try:
            with open(tmp, "w") as f:
                json.dump(data, f, indent=2)
                f.write("\n")
            os.replace(tmp, path)
        except Exception:
            if os.path.exists(tmp):
                os.unlink(tmp)
            raise

    def do_POST(self):
        if self.path == "/publish":
            try:
                raw_length = self.headers.get("Content-Length", "0")
                try:
                    length = int(raw_length)
                except (ValueError, TypeError):
                    self._respond(400, {"error": "invalid content-length header"})
                    return
                if length <= 0 or length > 10 * 1024 * 1024:
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
                    self._atomic_write(path, data)
                    written.append(path)

                svc_count = len(data.get("services", []))
                print(f"Published {svc_count} services to {len(written)} locations")
                self._respond(200, {"ok": True, "services": svc_count, "paths": written})
            except json.JSONDecodeError:
                self._respond(400, {"error": "invalid JSON payload"})
            except (OSError, IOError) as e:
                print(f"Publish write error: {e}")
                self._respond(500, {"error": f"write failed: {e}"})
            except Exception as e:
                print(f"Publish error: {e}")
                self._respond(500, {"error": str(e)})
        elif self.path == "/upload-image":
            # Handle image upload - save to file instead of base64
            try:
                content_type = self.headers.get("Content-Type", "")
                if "multipart/form-data" not in content_type:
                    self._respond(400, {"error": "expected multipart/form-data"})
                    return
                
                raw_length = int(self.headers.get("Content-Length", 0))
                if raw_length > 20 * 1024 * 1024:  # 20MB max
                    self._respond(400, {"error": "file too large (max 20MB)"})
                    return
                
                raw = self.rfile.read(raw_length)
                
                # Parse multipart form data
                boundary = content_type.split("boundary=")[1].encode()
                parts = raw.split(b"--" + boundary)
                
                file_data = None
                filename = None
                
                for part in parts:
                    if b"Content-Disposition" in part and b"filename=" in part:
                        # Extract filename
                        disposition = part.split(b"\r\n\r\n")[0].decode(errors='ignore')
                        filename_start = disposition.find('filename="') + 10
                        filename_end = disposition.find('"', filename_start)
                        filename = disposition[filename_start:filename_end]
                        
                        # Extract file data
                        file_data = part.split(b"\r\n\r\n", 1)[1].rsplit(b"\r\n--", 1)[0]
                        break
                
                if not file_data or not filename:
                    self._respond(400, {"error": "no file found in upload"})
                    return
                
                # Generate unique filename
                ext = os.path.splitext(filename)[1].lower() or ".webp"
                if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
                    ext = ".webp"
                
                unique_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
                filepath = os.path.join(UPLOAD_DIR, unique_name)
                
                # Write file
                with open(filepath, "wb") as f:
                    f.write(file_data)
                
                # Also copy to dist
                dist_filepath = os.path.join(BASE, "dist", "images", "uploads", unique_name)
                os.makedirs(os.path.dirname(dist_filepath), exist_ok=True)
                with open(dist_filepath, "wb") as f:
                    f.write(file_data)
                
                url = f"/images/uploads/{unique_name}"
                print(f"Uploaded image: {url}")
                self._respond(200, {"ok": True, "url": url, "filename": unique_name})
            except Exception as e:
                print(f"Upload error: {e}")
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
