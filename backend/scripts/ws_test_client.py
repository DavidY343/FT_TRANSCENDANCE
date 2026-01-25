#!/usr/bin/env python3
"""Simple WebSocket test client that uses AUTH-as-first-message.

Reads ACCESS token from ACCESS_TOKEN env var (if set) or backend/tokens.txt
(expects a line starting with ACCESS=) and connects to ws://127.0.0.1:8001/ws/game/
sending the AUTH message then a STATE_REQUEST.

Usage:
  .venv/bin/python backend/scripts/ws_test_client.py

This is intended for local dev verification (Daphne on :8001).
"""
import asyncio
import json
import os
from pathlib import Path

try:
    import websockets
except ImportError:
    raise SystemExit("Please install the websockets package in the project's venv: pip install websockets")


TOKENS_FILE = Path(__file__).resolve().parents[1] / "tokens.txt"


def read_access_token():
    env_token = os.environ.get("ACCESS_TOKEN")
    if env_token:
        return env_token
    if not TOKENS_FILE.exists():
        raise FileNotFoundError(f"Tokens file not found: {TOKENS_FILE}")
    with TOKENS_FILE.open() as f:
        for line in f:
            line = line.strip()
            # Accept common labels: ACCESS= or ACCESS_TOKEN=
            if line.startswith("ACCESS="):
                return line.split("=", 1)[1]
            if line.startswith("ACCESS_TOKEN="):
                return line.split("=", 1)[1]
    raise RuntimeError("ACCESS token not found in tokens.txt")


async def run():
    access = read_access_token()
    uri = os.environ.get("WS_URI", "ws://127.0.0.1:8001/ws/game/")
    print(f"Connecting to {uri}")
    async with websockets.connect(uri) as ws:
        # Send AUTH-as-first-message
        await ws.send(json.dumps({"type": "AUTH", "token": access}))
        auth_resp = await ws.recv()
        print("AUTH_RESP:", auth_resp)

        # request state
        await ws.send(json.dumps({"type": "STATE_REQUEST", "room": "demo-room"}))
        reply = await ws.recv()
        print("STATE_REPLY:", reply)


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except Exception as e:
        print("ERROR:", type(e).__name__, e)
        raise
