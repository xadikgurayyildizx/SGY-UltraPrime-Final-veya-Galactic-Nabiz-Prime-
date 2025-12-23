"""gmode_live.py — SAHNE (dokunma)
Basit tek-komut sunucu: bu repo içeriğini localhost'ta servis eder.

Çalıştır:
  python3 gmode_live.py

Sonra tarayıcı:
  http://127.0.0.1:8000/
"""

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]  # repo root

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Always serve from repo root
        p = super().translate_path(path)
        rel = os.path.relpath(p, os.getcwd())
        return str(ROOT / rel)

if __name__ == "__main__":
    os.chdir(str(ROOT))
    host, port = "127.0.0.1", 8000
    print(f"[G-MODE LIVE] Serving {ROOT} at http://{host}:{port}/")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
