#!/usr/bin/env bash
set -euo pipefail

# NOTE: This script is the single source of truth for dev automation.
# Use --minimal for a trimmed flow, or --full for everything.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
cd "$BACKEND_DIR"

# Quick mode: run only the websocket connection test and exit.
# Usage: ./scripts/dev_up.sh --run_test [<ACCESS_TOKEN>]
if [ "${1:-}" = "--run_test" ]; then
    # Token from CLI arg, env, or backend/tokens.txt
    if [ -n "${2:-}" ]; then
        TOKEN="$2"
    elif [ -n "${ACCESS_TOKEN:-}" ]; then
        TOKEN="$ACCESS_TOKEN"
    elif [ -f "$BACKEND_DIR/tokens.txt" ]; then
        TOKEN=$(grep '^ACCESS_TOKEN=' "$BACKEND_DIR/tokens.txt" | head -n1 | cut -d'=' -f2-)
    else
        echo "No ACCESS_TOKEN found. Provide it as second arg or set ACCESS_TOKEN env or ensure backend/tokens.txt exists." >&2
        exit 1
    fi

    if [ -x "$REPO_ROOT/.venv/bin/python" ]; then
        PY="$REPO_ROOT/.venv/bin/python"
    else
        PY=python3
    fi

    echo "Running WebSocket test using token (trimmed): ${TOKEN:0:8}..."
    env ACCESS_TOKEN="$TOKEN" WS_URI="ws://localhost:8001/ws/game/" "$PY" "$REPO_ROOT/scripts/ws_test_client.py"
    exit 0
fi

ensure_venv() {
    if [ ! -d "$REPO_ROOT/.venv" ]; then
        echo "Creating virtualenv at $REPO_ROOT/.venv"
        python3 -m venv "$REPO_ROOT/.venv"
        echo "Upgrading pip and installing requirements into the venv"
        "$REPO_ROOT/.venv/bin/python" -m pip install --upgrade pip setuptools wheel >/dev/null
        if [ -f "$BACKEND_DIR/requirements.txt" ]; then
            "$REPO_ROOT/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
        else
            echo "Warning: $BACKEND_DIR/requirements.txt not found; skipping pip install"
        fi
    fi
}

echo "Starting Postgres, Redis and Web (Daphne) with docker-compose..."
# Detect docker-compose v1 or docker compose (v2 plugin)
if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo "Error: neither 'docker-compose' nor 'docker compose' were found on PATH." >&2
    echo "Install Docker Compose (v1) or the Docker CLI Compose plugin (v2)." >&2
    echo "On Debian/Ubuntu you can: sudo apt install docker-compose-plugin" >&2
    echo "Or install the standalone docker-compose binary from https://docs.docker.com/compose/" >&2
    exit 1
fi

echo "Using compose command: $COMPOSE_CMD"
# Support a --down option to stop and remove the compose services for this project
if [ "${1:-}" = "--down" ]; then
    echo "Bringing down docker-compose services for backend/docker-compose.yml..."
    # Use compose down with volumes and remove orphans to clean up dev resources
    $COMPOSE_CMD -f docker-compose.yml down --volumes --remove-orphans || true
    echo "Docker compose services stopped and cleaned up."
    exit 0
fi
# By default start only the docker services used for infrastructure (postgres, redis).
# Pass --minimal for a trimmed setup, --full for the complete flow.
if [ "${1:-}" = "--full" ]; then
    $COMPOSE_CMD -f docker-compose.yml up -d --build
elif [ "${1:-}" = "--minimal" ]; then
    echo "Starting minimal docker-compose (Postgres + Redis)..."
    $COMPOSE_CMD -f docker-compose.yml up -d postgres redis
else
    echo "Starting only Postgres and Redis containers (docker-only mode)."
    $COMPOSE_CMD -f docker-compose.yml up -d postgres redis
    echo "Docker services started. If you want the full setup (venv, migrations, daphne, ws-test) run: ./scripts/dev_up.sh --full"
    echo "If you want a minimal setup (venv, migrations, tokens) run: ./scripts/dev_up.sh --minimal"
    exit 0
fi

echo "Waiting for Postgres to accept connections on 127.0.0.1:5432..."
python3 - <<'PY'
import socket, time, sys
for i in range(60):
        try:
                s=socket.create_connection(('127.0.0.1',5432),1)
                s.close()
                sys.exit(0)
        except Exception:
                time.sleep(1)
print('timeout waiting for postgres', file=sys.stderr)
sys.exit(1)
PY

ensure_venv

if [ -x "$REPO_ROOT/.venv/bin/python" ]; then
    PY="$REPO_ROOT/.venv/bin/python"
else
    PY=python3
fi

echo "Using python: $PY"

echo "Applying Django migrations..."
$PY manage.py migrate

if [ -x "$REPO_ROOT/.venv/bin/pip" ]; then
    echo "Ensuring Python dependencies are installed into $REPO_ROOT/.venv"
    "$REPO_ROOT/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt" || true
else
    echo "Warning: venv pip not found at $REPO_ROOT/.venv/bin/pip; skipping pip install"
fi

USER_USER="testplayer"
USER_PASS="testpass"
USER_EMAIL="testplayer@example.com"

echo "Creating test user (if not exists): $USER_USER"
${PY} manage.py shell <<PY
from django.contrib.auth import get_user_model
User = get_user_model()
u = "${USER_USER}"
if not User.objects.filter(username=u).exists():
    User.objects.create_user(u, "${USER_EMAIL}", "${USER_PASS}")
    print('created')
else:
    print('exists')
PY

echo "Generating JWT tokens for $USER_USER"
# Capture raw output and then take the last non-empty line to avoid stray messages
ACCESS_TOKEN_RAW=$($PY manage.py shell -c "from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
u=get_user_model().objects.get(username=\"$USER_USER\")
t=RefreshToken.for_user(u)
print(str(t.access_token))")
REFRESH_TOKEN_RAW=$($PY manage.py shell -c "from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
u=get_user_model().objects.get(username=\"$USER_USER\")
t=RefreshToken.for_user(u)
print(str(t))")

# Trim to last non-empty line (handles warnings/notes before token)
ACCESS_TOKEN=$(printf "%s" "$ACCESS_TOKEN_RAW" | awk 'NF{line=$0}END{print line}')
REFRESH_TOKEN=$(printf "%s" "$REFRESH_TOKEN_RAW" | awk 'NF{line=$0}END{print line}')

echo "ACCESS_TOKEN=$ACCESS_TOKEN"
echo "REFRESH_TOKEN=$REFRESH_TOKEN"

if [ "${1:-}" = "--minimal" ]; then
    cat <<'MSG'

Minimal setup done.
- Postgres and Redis are running via docker-compose (backend/docker-compose.yml).
- Migrations have been applied.
- A test user 'testplayer' exists (password 'testpass').
- ACCESS_TOKEN and REFRESH_TOKEN were printed above.

To start Daphne:
cd backend
daphne -b 0.0.0.0 -p 8001 config.asgi:application

To run the WebSocket test later:
./scripts/dev_up.sh --run_test

MSG
    exit 0
fi

# Check if Daphne is running on 8001, if not start it in background
if nc -z 127.0.0.1 8001 >/dev/null 2>&1; then
    echo "Daphne appears to be listening on 8001"
else
    echo "Starting Daphne in background on port 8001..."
    # Prefer the daphne executable from the repo venv if available
    if [ -x "$REPO_ROOT/.venv/bin/daphne" ]; then
        DAPHNE_BIN="$REPO_ROOT/.venv/bin/daphne"
    else
        # fallback to python -m daphne
        DAPHNE_BIN="$PY -m daphne"
    fi

    DAPHNE_LOG="$BACKEND_DIR/daphne.log"
    DAPHNE_PIDFILE="$BACKEND_DIR/daphne.pid"

    # Start Daphne in background and capture its PID and logs
    if [ -x "$REPO_ROOT/.venv/bin/daphne" ]; then
        nohup "$DAPHNE_BIN" -b 0.0.0.0 -p 8001 config.asgi:application >> "$DAPHNE_LOG" 2>&1 &
    else
        nohup $PY -m daphne -b 0.0.0.0 -p 8001 config.asgi:application >> "$DAPHNE_LOG" 2>&1 &
    fi
    echo $! > "$DAPHNE_PIDFILE"

    # Wait up to 10s for Daphne to start listening
    NOW=0
    SLEEP_INTERVAL=1
    MAX_WAIT=10
    while ! nc -z 127.0.0.1 8001 >/dev/null 2>&1; do
        sleep $SLEEP_INTERVAL
        NOW=$((NOW + SLEEP_INTERVAL))
        if [ $NOW -ge $MAX_WAIT ]; then
            echo "WARNING: Daphne did not start or is not listening on 8001 after ${MAX_WAIT}s. Check $DAPHNE_LOG for details."
            break
        fi
    done
    if nc -z 127.0.0.1 8001 >/dev/null 2>&1; then
        echo "Daphne started successfully (logs: $DAPHNE_LOG)"
    fi
fi

RUN_WS_TEST=false
if [ "${1:-}" = "--ws-test" ] || [ "${RUN_WS_TEST:-}" = "true" ]; then
    RUN_WS_TEST=true
fi

if [ "$RUN_WS_TEST" = "true" ]; then
    echo "Running WebSocket test using Python client..."
    env ACCESS_TOKEN="$ACCESS_TOKEN" WS_URI="ws://localhost:8001/ws/game/" "$PY" "$REPO_ROOT/scripts/ws_test_client.py"
fi

cat <<'MSG'

All done.
- Postgres and Redis are running via docker-compose (backend/docker-compose.yml).
- Migrations have been applied.
- A test user 'testplayer' exists (password 'testpass').
- ACCESS_TOKEN and REFRESH_TOKEN were printed above.

If Daphne didn't start automatically, run it in your venv:

source .venv/bin/activate
pip install -r requirements.txt
cd backend
daphne -b 0.0.0.0 -p 8001 config.asgi:application

To run the WebSocket test later:

chmod +x scripts/dev_up.sh
./scripts/dev_up.sh --ws-test

MSG
