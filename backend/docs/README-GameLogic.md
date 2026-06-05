# Lógica de Ajedrez y Matchmaking

## Motor de Ajedrez

El backend NO programa desde cero cómo se mueve un caballo o cómo funciona un jaque mate. Utiliza la robusta librería de Python llamada **`python-chess`**.

En `realtime.py` (y en `main.py`), cada partida activa tiene asociado un objeto `chess.Board`.
*   Cuando un jugador intenta moverse (`MOVE_SUBMIT`), el backend convierte la jugada a formato UCI (ej. "e2e4").
*   Luego comprueba: `if move not in room.board.legal_moves: ... rechazar`.
*   Si es válido: `room.board.push(move)`.

La función `_game_result_from_board` en `main.py` comprueba si el tablero está en estado terminal (jaque mate, rey ahogado, triple repetición, etc.) usando los métodos nativos de `python-chess` (ej. `board.is_checkmate()`).

## Inteligencia Artificial (Modo IA)

Cuando un usuario juega contra la máquina, se utiliza el script `ai_engine.py` (invocado en `main.py` cuando le toca a las piezas negras).
*   Se mide el tiempo (`perf_counter`) que tarda la IA en responder y se le resta de su reloj.
*   Si la IA elige una jugada, se hace `room.board.push(ai_move)` de la misma forma que un jugador humano.

## Reloj y Tiempo (Time Control)

En `main.py` existe una función asíncrona llamada `_clock_loop(game_id)`.
*   Esta función corre en un bucle cada `1.0` segundos mientras la partida está activa.
*   Calcula cuánto tiempo pasó desde la última iteración.
*   Le resta ese tiempo (`elapsed_ms`) al reloj del jugador que tiene el turno actual (`room.white_ms` o `room.black_ms`).
*   Si el reloj llega a `0`, termina la partida por "timeout" (`_finish_game`) declarando ganador al oponente.
*   En cada "tick", envía (broadcast) el nuevo tiempo a los clientes vía WebSocket.
