Automatización - Postgres + Redis para desarrollo

Descripción
-----------
Este archivo describe cómo levantar Postgres y Redis localmente usando `docker-compose` y un pequeño script `scripts/dev_up.sh` que automatiza:
- docker-compose up -d (Postgres + Redis)
- Espera a que Postgres acepte conexiones
- Ejecuta `python manage.py migrate`
- Crea un usuario de prueba `testplayer` (si no existe) con contraseña `testpass`
- Imprime un `ACCESS_TOKEN` y `REFRESH_TOKEN` para pruebas

Archivos añadidos
-----------------
- `backend/docker-compose.yml` — definición de servicios Postgres y Redis
- `scripts/dev_up.sh` — script que arranca los servicios y ejecuta migraciones y creación de usuario

Cómo usar (rápido)
------------------
Para un flujo minimal y reproducible en desarrollo hay un script nuevo `scripts/dev_minimal.sh` (recomendado). Este script arranca solo lo imprescindible (Postgres + Redis), aplica migraciones y genera tokens de prueba.

1. Desde la raíz del repo, hacer ejecutable y lanzar el script minimal:

```bash
chmod +x scripts/dev_minimal.sh
./scripts/dev_minimal.sh
```

2. El script deja los tokens en `backend/tokens.txt` y arranca los servicios `postgres` y `redis` definidos en `backend/docker-compose.yml`.

3. Ejemplos de prueba (generados por el script):

- Cliente nativo / wscat (Authorization header):

```bash
wscat -c ws://localhost:8001/ws/game/ -H "Authorization: Bearer <ACCESS_TOKEN>"
```

- Navegador (desarrollo): para pruebas rápidas puedes usar el flujo AUTH-as-first-message o añadir cookies manualmente en DevTools; en producción usar cookies HttpOnly.

Recomendado: usar un header Authorization en lugar de querystring. Ejemplos:

wscat (soporta headers):

```bash
wscat -c ws://localhost:8001/ws/game/ -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Cliente Python (websockets):

```python
import asyncio, websockets, json

# NOTE: depending on the installed `websockets` version, passing headers via
# `extra_headers` may fail (some versions forward them to low-level
# create_connection which doesn't accept that argument). If you encounter a
# TypeError, use one of the alternatives below.

# Alternative A - AUTH-as-first-message (browser-friendly, recommended for dev):
async def run_with_auth_message(token):
	uri = "ws://localhost:8001/ws/game/"
	async with websockets.connect(uri) as ws:
		# send AUTH as first message (consumer supports this fallback)
		await ws.send(json.dumps({"type": "AUTH", "token": token}))
		print(await ws.recv())
		await ws.send(json.dumps({"type": "STATE_REQUEST", "room": "demo-room"}))
		print(await ws.recv())

# Alternative B - headers (if your websockets supports extra_headers):
async def run_with_headers(token):
	uri = "ws://localhost:8001/ws/game/"
	headers = [("Authorization", f"Bearer {token}")]
	async with websockets.connect(uri, extra_headers=headers) as ws:
		await ws.send(json.dumps({"type":"STATE_REQUEST","room":"demo-room"}))
		print(await ws.recv())

# Run one of the helpers:
if __name__ == '__main__':
	# asyncio.run(run_with_auth_message('<ACCESS_TOKEN>'))
	# or
	# asyncio.run(run_with_headers('<ACCESS_TOKEN>'))
	pass
```

Nota: como la API WebSocket nativa de los navegadores no permite headers personalizados, para clientes web puedes usar cookie HttpOnly o enviar el token como primer mensaje AUTH (ver nota en README_WS.md). Para desarrollo el middleware acepta querystring si `DEBUG=True`.

Cliente incluido (script de conveniencia)
---------------------------------------
Se ha añadido un pequeño cliente de prueba listo para usar en `scripts/ws_test_client.py`.

Características:
- Lee `ACCESS_TOKEN` (o `ACCESS`) desde `backend/tokens.txt` generado por `scripts/dev_up.sh --minimal`.
- Conecta a `ws://127.0.0.1:8001/ws/game/` por defecto.
- Envía un mensaje `{"type":"AUTH","token": <ACCESS>}` como primer mensaje y luego solicita `STATE_REQUEST`.

Uso rápido:

```bash
.venv/bin/python scripts/ws_test_client.py
```

Si Daphne corre en otra URL o puerto, exporta `WS_URI` antes de ejecutar:

```bash
WS_URI="ws://localhost:8001/ws/game/" .venv/bin/python scripts/ws_test_client.py
```

Notas
-----
- El script asume que `docker` y `docker-compose` están instalados y accesibles por el usuario.
- Ejecuta `scripts/dev_up.sh` con el virtualenv activado para que `python3 manage.py` use las dependencias correctas.
- El uso de JWT en querystring es sólo para pruebas locales; en producción usar un middleware o tokens de reconexión seguros.

Si quieres, lo añado también al `backend/WEBSOCKET_LOG.md` o creo un commit que modifique su contenido para referenciar este archivo.
