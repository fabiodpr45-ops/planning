#!/usr/bin/env python3
"""Lanceur desktop pour l'application planning DPR45.

- Démarre un serveur HTTP local qui sert les fichiers statiques du projet.
- Ouvre automatiquement le navigateur par défaut.
- Peut être empaqueté en .exe avec PyInstaller.
"""

from __future__ import annotations

import argparse
import http.server
import os
import socket
import socketserver
import sys
import threading
import time
import webbrowser
from pathlib import Path


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def resolve_base_dir() -> Path:
    """Retourne le dossier des assets selon le contexte (dev ou PyInstaller)."""
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS)
    return Path(__file__).resolve().parent


def pick_free_port(start: int = 8000, attempts: int = 30) -> int:
    for port in range(start, start + attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(("127.0.0.1", port)) != 0:
                return port
    raise RuntimeError("Aucun port libre trouvé entre 8000 et 8029")


def start_server(base_dir: Path, port: int) -> ReusableTCPServer:
    handler = lambda *args, **kwargs: http.server.SimpleHTTPRequestHandler(  # noqa: E731
        *args,
        directory=str(base_dir),
        **kwargs,
    )
    server = ReusableTCPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Lance le planning DPR45 en local")
    parser.add_argument("--port", type=int, default=8000, help="Port de départ (défaut: 8000)")
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Ne pas ouvrir le navigateur automatiquement",
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=0,
        help="Arrêt auto après N secondes (0 = infini)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    base_dir = resolve_base_dir()

    required_files = ["index.html", "login.html", "dashboard.html", "planning.html"]
    missing = [name for name in required_files if not (base_dir / name).exists()]
    if missing:
        print(f"Fichiers manquants: {', '.join(missing)}", file=sys.stderr)
        return 2

    port = pick_free_port(start=args.port)
    server = start_server(base_dir, port)
    url = f"http://127.0.0.1:{port}/index.html"

    print(f"Serveur démarré sur {url}")
    if not args.no_browser:
        webbrowser.open(url)

    try:
        if args.duration > 0:
            time.sleep(args.duration)
        else:
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("\nArrêt demandé.")
    finally:
        server.shutdown()
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
