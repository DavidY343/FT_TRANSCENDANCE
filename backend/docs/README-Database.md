# Base de Datos: Modelos y Persistencia

El backend utiliza **SQLAlchemy** como ORM para interactuar con la base de datos relacional. La conexión se establece en `db.py` y los modelos están en `models.py`.

## Modelos de Datos (`models.py`)

1. **User (Usuarios)**:
   - Almacena información de la cuenta: `id`, `email`, `username`, `password_hash`, `display_name`, `avatar_url`.
   - Mantiene el ranking del jugador: `elo` (por defecto 1200).
   - Datos de estado: `is_active`, `created_at`.

2. **Friendship (Amistades)**:
   - Relaciona dos usuarios: `requester_id` y `addressee_id`.
   - Guarda el estado de la relación: `status` (ej. "accepted", "pending").

3. **Game (Partidas)**:
   - Almacena los metadatos de las partidas de ajedrez.
   - Jugadores: `white_id`, `black_id` (claves foráneas a User). Si es contra la IA, el `black_id` puede ser NULL.
   - Estado: `mode` (ej. `ai:medium:10`, `1v1:10`), `status` ("pending", "playing", "finished"), `result` ("white_win", "black_win", "draw").
   - Ajedrez: `final_fen` (estado final del tablero), `move_count`.

## ¿Cuándo y cómo se envían datos a la Base de Datos?

El acceso a la base de datos se inyecta en los endpoints de FastAPI utilizando la dependencia `Depends(get_db)`.

*   **Creación de Usuarios (`routers/auth.py`)**: Cuando se llama a `/register`, se instancia un objeto `User`, se hace `db.add(user)` y `db.commit()`.
*   **Creación de Partidas (`routers/games.py`, `matchmaking.py`)**: Cuando inicia una partida contra la IA o al encontrar oponente, se crea un objeto `Game` y se guarda con `db.commit()`.
*   **Actualización de Partidas y ELO (`main.py`)**: Mientras se juega por WebSocket, los movimientos de la partida se guardan **en memoria** (`realtime.py` -> `RoomState.board`). La base de datos **solo se actualiza periódicamente o al final de la partida** (en `_finish_game`) para evitar saturar la base de datos con peticiones por cada movimiento o cada segundo del reloj. Cuando la partida acaba o alguien hace un movimiento que la termina, se calcula el ELO de ambos, se actualiza el FEN final y se hace `db.commit()`.
