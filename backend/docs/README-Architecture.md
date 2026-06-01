# Arquitectura del Backend: FT_TRANSCENDANCE

El backend está construido utilizando **FastAPI**, un framework web moderno y rápido para Python. Está diseñado para manejar tanto peticiones tradicionales (REST API) como conexiones en tiempo real mediante WebSockets (para las partidas de ajedrez).

## Componentes Principales

1. **`main.py`**: Es el punto de entrada de la aplicación. Configura la aplicación FastAPI, el middleware de CORS (para permitir que el frontend se comunique con él), e incluye todos los "routers" (rutas de la API). También maneja la conexión WebSocket principal en `/ws/{game_id}`.
2. **`realtime.py`**: Gestiona el estado de las partidas en tiempo real. Utiliza una clase `RealtimeManager` para llevar un registro de qué usuarios están conectados a qué partidas (salas/rooms), manejar desconexiones, reconexiones y emitir mensajes (broadcast) a todos los jugadores de una sala.
3. **`db.py` y `models.py`**: Configuran la conexión a la base de datos utilizando **SQLAlchemy** (un ORM para Python). `models.py` define las tablas de la base de datos (Usuarios, Partidas, Amistades).
4. **Routers (`app/routers/`)**: Contienen la lógica de los distintos endpoints REST divididos por dominio (auth, users, friends, games, matchmaking).
5. **Lógica de Ajedrez**: Se apoya en la librería `python-chess` para validar movimientos, comprobar jaque mate, tablas, etc.

## ¿Dónde se envía datos al Frontend?

Los datos se envían al frontend por dos canales:
1. **Respuestas HTTP (REST API)**: Cuando el frontend hace una petición (ej. GET `/api/v1/games/history`), los routers devuelven objetos JSON con la información.
2. **WebSockets (Tiempo Real)**: A través del endpoint `ws://.../ws/{game_id}`. El backend utiliza la función `await realtime_manager.broadcast()` o `await realtime_manager.send_personal()` en `main.py` para enviar payloads JSON en tiempo real al frontend (ej. un nuevo movimiento `STATE_SYNC`, mensajes de chat `CHAT_MESSAGE`, o reloj `CLOCK_TICK`).

## ¿Dónde se envían datos a la Base de Datos?

Los datos se envían y persisten en la base de datos a través de SQLAlchemy usando el objeto `db` (Session). Esto ocurre principalmente en:
1. **Los Routers**: Cuando un usuario se registra, se crea una partida, o se añade un amigo. Se utiliza `db.add(objeto)` y `db.commit()`.
2. **`main.py` (Fin de Partida)**: En funciones como `_finish_game()`, donde se actualiza el estado final de la partida (`game.status = "finished"`), el PGN/FEN resultante, y se recalcula el ELO de los jugadores (`_apply_elo()`). Luego se llama a `db.commit()`.
