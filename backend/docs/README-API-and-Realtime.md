# API y Sistema de Tiempo Real (WebSockets)

La comunicación entre el frontend y el backend está completamente dividida en dos paradigmas.

## 1. REST API (Endpoints HTTP)

Se utilizan para operaciones de estado que no requieren respuesta en tiempo real. Todas las rutas están prefijadas con `/api/v1`.

*   **Autenticación (`/auth`)**: `/register`, `/login`, `/refresh`. Emiten y validan JSON Web Tokens (JWT).
*   **Usuarios (`/users`)**: Para obtener el perfil del usuario, actualizar avatar, buscar usuarios.
*   **Amigos (`/friends`)**: Para enviar solicitudes de amistad, aceptarlas, ver lista de amigos.
*   **Juegos (`/games`)**: `/history` (historial de partidas), `/leaderboard` (ranking ELO).
*   **Matchmaking (`/matchmaking`)**: Para buscar partidas multijugador.

**Envío al Frontend**: Las funciones retornan diccionarios de Python o modelos Pydantic (`schemas.py`), y FastAPI los serializa automáticamente a **JSON**.

## 2. WebSockets (Tiempo Real en Partidas)

El archivo `main.py` expone el endpoint `ws://[host]/ws/{game_id}`.

1.  **Conexión**: El frontend se conecta pasando el token JWT. El backend lo valida.
2.  **Estado (`RoomState`)**: Se crea o recupera una "sala" en memoria (archivo `realtime.py`) que mantiene el tablero de ajedrez (`chess.Board`), los milisegundos restantes del reloj y el historial de chat.
3.  **Mensajes entrantes (Frontend -> Backend)**: 
    *   `MOVE_SUBMIT`: El frontend envía una jugada. El backend la valida con `python-chess`.
    *   `CHAT_SEND`: Un mensaje de texto en la partida.
    *   `RESIGN`: Un jugador se rinde.
4.  **Mensajes salientes (Backend -> Frontend)**: A través de `realtime_manager.broadcast()`, el backend envía payloads JSON:
    *   `STATE_SYNC`: Sincroniza todo el tablero (FEN, turnos, movimientos legales). Se envía después de cada jugada válida.
    *   `CLOCK_TICK`: Se envía cada segundo (por un bucle en segundo plano `_clock_loop`) con el tiempo restante de cada jugador.
    *   `GAME_OVER`: Cuando hay jaque mate, timeout o alguien se rinde.
    *   `CHAT_MESSAGE`: Cuando alguien habla.
