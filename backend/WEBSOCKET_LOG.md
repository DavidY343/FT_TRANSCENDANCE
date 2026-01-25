# WebSocket / Channels Work Log

Registro de trabajo para el equipo (Persona 4: Real‑time/WS). Solo incluye lo implementado hoy.

---

## 2026-01-24 — Work log (Persona 4)

### Resumen claro (qué se implementó)
- **Rooms básicos**: join por querystring, `ROOM_JOIN` y `STATE_REQUEST` con `room`.
- **Presencia**: `PLAYER_JOINED` / `PLAYER_DISCONNECTED` (grupo `presence`).
- **Healthcheck**: `PING` → `PONG`.
- **Eventos mock WS**: `MATCH_FOUND`, `MOVE_SUBMIT` → `MOVE_APPLIED`.
- **Matchmaking demo**: `MATCHMAKE` empareja 2 sockets y emite `MATCH_FOUND` a ambos; `MATCH_QUEUED` si no hay rival.
- **Reconexión**: `RECONNECT` con **token** emitido en `MATCH_FOUND`.
- **Docs WS**: `backend/README_WS.md` actualizado con ejemplos de rooms, ping/pong, matchmaking y reconexión con token.
- **Tests WS**: suite en `apps/realtime/tests.py` ampliada y **todos verdes** (rooms/presencia/ping/move/matchmake/reconnect).

### Archivos tocados
- `backend/apps/realtime/consumers.py`
- `backend/apps/realtime/tests.py`
- `backend/README_WS.md`
- `backend/WEBSOCKET_AUTOMATION.md` (referencias al cliente WS unificado)
- `scripts/dev_up.sh` y `scripts/dev_minimal.sh` (unificación de scripts)
- `scripts/ws_test_client.py`

### Contrato WS (resumen rápido)
- `ROOM_JOIN`, `STATE_REQUEST`, `STATE_SYNC`
- `PING`, `PONG`
- `MATCHMAKE`, `MATCH_QUEUED`, `MATCH_FOUND`
- `MOVE_SUBMIT`, `MOVE_APPLIED`
- `RECONNECT` → `PLAYER_RECONNECTED`

### Estado
- **Sprint 1 (Persona 4) cerrado** con eventos demo, reconexión y matchmaking mock.

### Demo rápida (paso a paso)
1) Levantar Redis y Daphne.
2) Abrir **dos** clientes WS autenticados.
3) Ejecutar matchmaking → recibir `MATCH_FOUND` con `reconnectToken`.
4) Enviar `MOVE_SUBMIT` → recibir `MOVE_APPLIED`.
5) Simular refresh: enviar `RECONNECT` con token → `PLAYER_RECONNECTED`.

#### Comandos sugeridos (opcional)

```bash
# Terminal 1: Redis
docker run --rm -p 6379:6379 redis:7
```

```bash
# Terminal 2: Daphne
cd backend
daphne -b 0.0.0.0 -p 8001 config.asgi:application
```

```bash
# Terminal 3: generar tokens (si no hay)
python manage.py shell -c "from django.contrib.auth import get_user_model; from rest_framework_simplejwt.tokens import RefreshToken; u, _ = get_user_model().objects.get_or_create(username='testplayer', defaults={'email':'testplayer@example.com'}); u.set_password('testpass'); u.save(); t=RefreshToken.for_user(u); print('ACCESS_TOKEN=' + str(t.access_token))"
```

```bash
# Terminal 4: conectar con wscat (cliente 1)
wscat -c ws://127.0.0.1:8001/ws/game/ -H "Authorization: Bearer <ACCESS_TOKEN>"
```

```bash
# Terminal 5: conectar con wscat (cliente 2)
wscat -c ws://127.0.0.1:8001/ws/game/ -H "Authorization: Bearer <ACCESS_TOKEN_2>"
```

Luego enviar en cada cliente:

```json
{"type":"MATCHMAKE"}
```

Y probar:

```json
{"type":"MOVE_SUBMIT","move":{"from":"e2","to":"e4"}}
```

Para reconectar:

```json
{"type":"RECONNECT","token":"<reconnectToken>"}
```

---
