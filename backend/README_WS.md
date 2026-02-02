# WebSocket Quickstart (Sprint 2)

This document explains how to run the realtime WebSocket server and test the minimal contract, including matchmaking, ready confirmation, and server-authoritative clocks.

## Prerequisites

- Redis running locally (Docker recommended)
- Python environment with backend dependencies installed
- A valid JWT access token (use existing auth flow)

## 1) Start Redis


```bash
docker run --rm -p 6379:6379 redis:7
```

## 2) Run the ASGI server (Daphne recommended)

From the `backend/` directory:

```bash
daphne -b 0.0.0.0 -p 8001 config.asgi:application
```

> Alternative (optional): Django `runserver` (OK for quick dev)
>
> ```bash
> python manage.py runserver 8000
> ```

## 3) Connect from a client

### Option A — Auth via header (recommended)

Using `wscat`:

```bash
wscat -c ws://127.0.0.1:8001/ws/game/ -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Then send (room optional):

```json
{"type":"STATE_REQUEST","room":"demo-room"}
```

You should receive:

```json
{"type":"STATE_SYNC","payload":{"fen":"startpos","turn":"w","clocks":{"wMs":300000,"bMs":300000},"status":"PLAYING","players":{}}}
```

### Option B — Auth via AUTH message (browser-friendly)

Connect without headers, then send **first** message:

```json
{"type":"AUTH","token":"<ACCESS_TOKEN>"}
```

You should receive:

```json
{"type":"AUTH_OK"}
```

After that, you can send `STATE_REQUEST`.

### Rooms (basic lifecycle)

You can join a room in two ways:

1) Querystring on connect:

```
ws://127.0.0.1:8001/ws/game/?room=demo-room
```

2) Send a `ROOM_JOIN` message after auth:

```json
{"type":"ROOM_JOIN","room":"demo-room"}
```

Any `STATE_REQUEST` with a `room` will also join that room implicitly.

### Ping / Pong (healthcheck)

Send:

```json
{"type":"PING"}
```

Server replies (includes reconnect token):

```json
{"type":"PONG"}
```

### Mock match + move events (Sprint 1 demo)

Send a mock match request:

```json
{"type":"MATCH_FOUND","room":"demo-room"}
```

Server replies:

```json
{"type":"MATCH_FOUND","payload":{"room":"demo-room","players":{"white":"<you>","black":"opponent"},"reconnectToken":"<token>"}}
```

Submit a mock move:

```json
{"type":"MOVE_SUBMIT","move":{"from":"e2","to":"e4"}}
```

Server replies:

```json
{"type":"MOVE_APPLIED","payload":{"move":{"from":"e2","to":"e4"},"fen":"startpos","turn":"b","clocks":{"wMs":299900,"bMs":300000}}}
```

### Matchmaking queue (demo)

Client joins the matchmaking queue:

```json
{"type":"MATCHMAKE"}
```

If no opponent is waiting:

```json
{"type":"MATCH_QUEUED"}
```

When a second client joins, both receive:

```json
{"type":"MATCH_FOUND","payload":{"room":"match_...","players":{"white":"<you>","black":"opponent"},"reconnectToken":"<token>"}}
```

### Ready confirmation (Sprint 2)

After MATCH_FOUND, the game room is created but waiting for both players to confirm readiness.

Send:

```json
{"type":"READY"}
```

If not both ready yet:

```json
{"type":"READY_CONFIRMED"}
```

When both players send READY, both receive:

```json
{"type":"GAME_READY","room":"match_...","players":{"white":"...","black":"..."}}
```

Followed by:

```json
{"type":"GAME_START","room":"match_...","clocks":{"wMs":300000,"bMs":300000}}
```

This starts the clocks for white.

### Clocks and moves (Sprint 2)

Moves now update server-side clocks and broadcast to the room.

Send:

```json
{"type":"MOVE_SUBMIT","move":{"from":"e2","to":"e4"}}
```

Server calculates elapsed time, subtracts from active player's clock, switches turn, and replies to both:

```json
{"type":"MOVE_APPLIED","payload":{"move":{"from":"e2","to":"e4"},"fen":"startpos","turn":"b","clocks":{"wMs":299900,"bMs":300000}}}
```

Clocks are server-authoritative but decrement locally in the frontend for smoothness (sync on moves).

### Reconnect (demo)

Client re-joins a room after refresh (use the token from MATCH_FOUND):

```json
{"type":"RECONNECT","token":"<token>"}
```

Server replies:

```json
{"type":"PLAYER_RECONNECTED","payload":{"room":"demo-room","user":{"id":"...","username":"..."},"reconnectToken":"<token>"}}
```

### Presence events (optional)

When another authenticated client connects or disconnects, you’ll receive:

```json
{"type":"PLAYER_JOINED","user":{"id":"...","username":"..."}}
```

```json
{"type":"PLAYER_DISCONNECTED","user":{"id":"...","username":"..."}}
```

## Notes

- In `DEBUG=True`, the middleware also accepts `?token=<ACCESS_TOKEN>` in the querystring (development only).
- For production, do **not** pass tokens in the querystring.
- Clocks are in milliseconds (300000 = 5 minutes). Frontend handles local countdown with sync on moves.
