#!/usr/bin/env python3
"""Launcher for publish_api.py with auto-restart on crash.

Usage:
  python start_publish_api.py [port]

Keeps the publish API running even if it crashes (OOM, port conflict, etc.).
Logs to stdout with timestamps.
"""
import subprocess, sys, time, os

BASE = os.path.dirname(os.path.abspath(__file__))
API_SCRIPT = os.path.join(BASE, "publish_api.py")
PORT = sys.argv[1] if len(sys.argv) > 1 else "9998"
MAX_RESTART_DELAY = 30  # seconds

def main():
    print(f"[launcher] Starting publish_api.py on port {PORT} with auto-restart")
    restart_delay = 1
    while True:
        try:
            proc = subprocess.Popen(
                [sys.executable, API_SCRIPT, PORT],
                cwd=BASE
            )
            proc.wait()
            exit_code = proc.returncode
            print(f"[launcher] publish_api.py exited with code {exit_code}, restarting in {restart_delay}s...")
        except FileNotFoundError:
            print(f"[launcher] CRITICAL: {API_SCRIPT} not found!")
            return 1
        except Exception as e:
            print(f"[launcher] CRITICAL: {e}")
            return 1

        time.sleep(restart_delay)
        restart_delay = min(restart_delay * 2, MAX_RESTART_DELAY)

if __name__ == "__main__":
    sys.exit(main())
