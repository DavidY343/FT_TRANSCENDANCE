# WebSocket Quickstart (Sprint 1)

This document explains how to run the realtime WebSocket server and test the minimal contract.

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
{"type":"MOVE_APPLIED","payload":{"move":{"from":"e2","to":"e4"},"fen":"startpos","turn":"b"}}
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
