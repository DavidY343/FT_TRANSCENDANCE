import asyncio
import math
from time import perf_counter
from datetime import datetime

import chess
from fastapi import FastAPI
from fastapi import Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.auth import decode_token
from app.db import Base, engine
from app.db import SessionLocal
from app.models import Game, User
from app.ai_engine import ai_for_level
from app.presence import set_offline, set_online
from app.realtime import realtime_manager
from app.routers import auth, friends, games, matchmaking, users


app = FastAPI(title="Online Chess API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost", "http://localhost", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(friends.router, prefix="/api/v1")
app.include_router(games.router, prefix="/api/v1")
app.include_router(matchmaking.router, prefix="/api/v1")
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")


@app.websocket("/ws/presence")
async def websocket_presence(websocket: WebSocket, token: str | None = Query(default=None)):
    """
    Global presence heartbeat.
    The frontend opens this socket as soon as the user is authenticated and
    keeps it open for the entire session. No game logic happens here – it
    only drives set_online / set_offline so the Friends list reflects the
    real app-level presence rather than just in-game presence.
    """
    if not token:
        await websocket.close(code=1008, reason="Missing token")
        return

    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub", "0"))
        if payload.get("type") != "access" or user_id <= 0:
            raise ValueError("Invalid access token")
    except Exception:
        await websocket.close(code=1008, reason="Invalid token")
        return

    await websocket.accept()
    set_online(user_id)
    try:
        while True:
            try:
                # Keep the socket alive; client may send {"type":"ping"} or
                # just hold the connection open. Any receive error means the
                # browser navigated away / closed the tab.
                await websocket.receive_text()
            except (WebSocketDisconnect, RuntimeError):
                break
    finally:
        set_offline(user_id)


DISCONNECT_GRACE_SECONDS = 30
CLOCK_TICK_SECONDS = 1.0


def _is_ai_mode(game: Game) -> bool:
    return bool(game.mode and game.mode.startswith("ai:"))


def _ai_level(game: Game) -> str:
    if not _is_ai_mode(game):
        return "medium"
    parts = game.mode.split(":")
    if len(parts) >= 2 and parts[1]:
        return parts[1]
    return "medium"


def _ai_level_from_mode(mode: str) -> str:
    parts = mode.split(":")
    if len(parts) >= 2 and parts[1]:
        return parts[1]
    return "medium"


def _time_minutes_from_mode(mode: str) -> int:
    if mode.startswith("ai:"):
        parts = mode.split(":")
        if len(parts) >= 3 and parts[2].isdigit():
            value = int(parts[2])
            if value in {5, 10, 30}:
                return value
        return 10

    if mode.startswith("1v1:"):
        _, _, minutes = mode.partition(":")
        if minutes.isdigit() and int(minutes) in {5, 10, 30}:
            return int(minutes)
    return 10


def _game_result_from_board(board: chess.Board) -> tuple[str, str]:
    if board.is_checkmate():
        # Side to move is checkmated, so winner is the opposite color.
        return ("black_win", "checkmate") if board.turn == chess.WHITE else ("white_win", "checkmate")

    if board.is_stalemate():
        return "draw", "stalemate"

    if board.is_insufficient_material():
        return "draw", "insufficient_material"

    if board.can_claim_threefold_repetition() or board.is_repetition(3):
        return "draw", "threefold_repetition"

    if board.can_claim_fifty_moves() or board.is_fifty_moves():
        return "draw", "fifty_move_rule"

    outcome = board.outcome(claim_draw=True)
    if outcome is None:
        return "draw", "unknown"

    if outcome.winner is True:
        return "white_win", outcome.termination.name.lower()
    if outcome.winner is False:
        return "black_win", outcome.termination.name.lower()
    return "draw", outcome.termination.name.lower()


def _expected_score(rating_a: int, rating_b: int) -> float:
    return 1.0 / (1.0 + math.pow(10, (rating_b - rating_a) / 400.0))


def _apply_elo(db, game: Game, result: str) -> None:
    if _is_ai_mode(game):
        return

    if game.white_id is None:
        return

    white = db.get(User, game.white_id)
    if white is None:
        return

    k_factor = 32
    if result == "white_win":
        score_white = 1.0
    elif result == "black_win":
        score_white = 0.0
    else:
        score_white = 0.5

    if game.black_id is None:
        return

    black = db.get(User, game.black_id)
    if black is None:
        return

    expected_white = _expected_score(white.elo, black.elo)
    expected_black = _expected_score(black.elo, white.elo)
    score_black = 1.0 - score_white

    white.elo = max(100, int(round(white.elo + k_factor * (score_white - expected_white))))
    black.elo = max(100, int(round(black.elo + k_factor * (score_black - expected_black))))
    db.add(white)
    db.add(black)


def _finish_game(db, game: Game, room, result: str, reason: str) -> dict:
    room.finished = True
    game.status = "finished"
    game.result = result
    game.ended_at = datetime.utcnow()
    game.final_fen = room.board.fen()
    game.move_count = len(room.board.move_stack)
    _apply_elo(db, game, result)
    db.add(game)
    db.commit()

    winner = None
    if result == "white_win" and game.white_id is not None:
        white = db.get(User, game.white_id)
        winner = {
            "id": game.white_id,
            "username": white.username if white else "unknown",
        }
    elif result == "black_win":
        if game.black_id is None and _is_ai_mode(game):
            winner = {"id": None, "username": "ai"}
        elif game.black_id is not None:
            black = db.get(User, game.black_id)
            winner = {
                "id": game.black_id,
                "username": black.username if black else "unknown",
            }

    return {
        "type": "GAME_OVER",
        "reason": reason,
        "result": result,
        "winner": winner,
        "state": room.to_payload(),
    }


async def _clock_loop(game_id: int):
    while True:
        await asyncio.sleep(CLOCK_TICK_SECONDS)
        room = realtime_manager.get_room(game_id)
        if room is None:
            return

        db = SessionLocal()
        try:
            game = db.get(Game, game_id)
            if game is None or game.status == "finished":
                if room:
                    room.finished = True
                return

            now = datetime.utcnow()
            elapsed_ms = int((now - room.last_clock_ts).total_seconds() * 1000)
            room.last_clock_ts = now

            if elapsed_ms <= 0:
                continue

            if room.board.turn == chess.WHITE:
                room.white_ms = max(0, room.white_ms - elapsed_ms)
            else:
                room.black_ms = max(0, room.black_ms - elapsed_ms)

            if room.finished:
                return

            await realtime_manager.broadcast(game_id, {"type": "CLOCK_TICK", "clocks": room.to_payload()["clocks"]})

            if room.white_ms <= 0 or room.black_ms <= 0:
                result = "black_win" if room.white_ms <= 0 else "white_win"
                game_over_payload = _finish_game(db, game, room, result, "timeout")
                await realtime_manager.broadcast(game_id, {"type": "STATE_SYNC", "state": room.to_payload()})
                await realtime_manager.broadcast(game_id, game_over_payload)
                return
        except Exception:
            # Prevent unhandled task exceptions from crashing noisy rooms during transient DB pressure.
            return
        finally:
            try:
                db.close()
            except Exception:
                pass


async def _forfeit_if_not_reconnected(game_id: int, disconnected_user_id: int):
    await asyncio.sleep(DISCONNECT_GRACE_SECONDS)
    if realtime_manager.is_user_connected(disconnected_user_id):
        return

    room = realtime_manager.get_room(game_id)
    if room is None:
        return

    db = SessionLocal()
    try:
        game = db.get(Game, game_id)
        if game is None or game.status == "finished":
            return

        if disconnected_user_id not in {game.white_id, game.black_id}:
            return

        result = "black_win" if disconnected_user_id == game.white_id else "white_win"
        game_over_payload = _finish_game(db, game, room, result, "disconnect_forfeit")
        await realtime_manager.broadcast(game_id, {"type": "STATE_SYNC", "state": room.to_payload()})
        await realtime_manager.broadcast(game_id, game_over_payload)
    finally:
        try:
            db.close()
        except Exception:
            pass


@app.websocket("/ws/{game_id}")
async def websocket_game(game_id: int, websocket: WebSocket, token: str | None = Query(default=None)):
    if not token:
        await websocket.close(code=1008, reason="Missing token")
        return

    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub", "0"))
        if payload.get("type") != "access" or user_id <= 0:
            raise ValueError("Invalid access token")
    except Exception:
        await websocket.close(code=1008, reason="Invalid token")
        return

    init_db = SessionLocal()
    try:
        game = init_db.get(Game, game_id)
        if not game:
            await websocket.close(code=1008, reason="Game not found")
            return

        allowed = user_id in {game.white_id, game.black_id}
        if _is_ai_mode(game) and user_id == game.white_id:
            allowed = True

        if not allowed:
            await websocket.close(code=1008, reason="Not allowed")
            return

        white_id = game.white_id
        black_id = game.black_id
        game_mode = game.mode
        game_finished = game.status == "finished"
        final_fen = game.final_fen

        white_user = init_db.get(User, white_id) if white_id else None
        black_user = init_db.get(User, black_id) if black_id else None

        def _player_info(u: User | None):
            return {"id": u.id, "username": u.username, "display_name": u.display_name} if u else None

        white_info = _player_info(white_user)
        black_info = _player_info(black_user)
        if _is_ai_mode(game) and black_id is None:
            difficulty = _ai_level_from_mode(game_mode)
            black_info = {"id": None, "username": "ai", "display_name": f"AI ({difficulty.capitalize()})"}
    finally:
        try:
            init_db.close()
        except Exception:
            pass

    try:

        was_reconnecting = await realtime_manager.connect(game_id, user_id, websocket)
        set_online(user_id)

        minutes = _time_minutes_from_mode(game_mode)
        room = realtime_manager.get_or_create_room(
            game_id,
            white_id,
            black_id,
            final_fen,
            white_info=white_info,
            black_info=black_info,
            initial_ms=minutes * 60 * 1000,
            time_control_minutes=minutes,
            is_ai=bool(game_mode and game_mode.startswith("ai:")),
            finished=game_finished,
        )
        room.last_clock_ts = datetime.utcnow()

        if room.clock_task is None or room.clock_task.done():
            room.clock_task = asyncio.create_task(_clock_loop(game_id))

        await realtime_manager.send_personal(websocket, {"type": "STATE_SYNC", "state": room.to_payload()})
        await realtime_manager.broadcast(game_id, {"type": "PRESENCE", "user_id": user_id, "online": True})
        if was_reconnecting:
            await realtime_manager.broadcast(
                game_id,
                {
                    "type": "DISCONNECT_GRACE",
                    "user_id": user_id,
                    "active": False,
                    "seconds": 0,
                },
            )

        while True:
            try:
                incoming = await websocket.receive_json()
            except RuntimeError:
                # Starlette can raise RuntimeError on abrupt disconnects before WebSocketDisconnect.
                break

            event_type = incoming.get("type")

            if event_type == "STATE_SYNC_REQ":
                await realtime_manager.send_personal(websocket, {"type": "STATE_SYNC", "state": room.to_payload()})
                continue

            if event_type == "RESIGN":
                event_db = SessionLocal()
                try:
                    game = event_db.get(Game, game_id)
                    if not game or game.status == "finished" or room.finished:
                        room.finished = True
                        continue

                    if user_id == game.white_id:
                        result = "black_win"
                    else:
                        result = "white_win"
                    game_over_payload = _finish_game(event_db, game, room, result, "resign")
                finally:
                    try:
                        event_db.close()
                    except Exception:
                        pass

                await realtime_manager.broadcast(game_id, {"type": "STATE_SYNC", "state": room.to_payload()})
                await realtime_manager.broadcast(game_id, game_over_payload)
                continue

            if event_type == "CHAT_SEND":
                if room.is_ai:
                    await realtime_manager.send_personal(
                        websocket,
                        {
                            "type": "ERROR",
                            "message": "Chat is only available in human vs human games",
                        },
                    )
                    continue

                text = str(incoming.get("message", "")).strip()
                if not text:
                    await realtime_manager.send_personal(websocket, {"type": "ERROR", "message": "Empty message"})
                    continue
                text = text[:500]
                message = {
                    "user_id": user_id,
                    "message": text,
                    "at": datetime.utcnow().isoformat() + "Z",
                }
                room.chat_messages.append(message)
                if len(room.chat_messages) > 100:
                    room.chat_messages = room.chat_messages[-100:]
                await realtime_manager.broadcast(game_id, {"type": "CHAT_MESSAGE", "payload": message})
                continue

            if event_type != "MOVE_SUBMIT":
                await realtime_manager.send_personal(websocket, {"type": "ERROR", "message": "Unsupported event type"})
                continue

            if room.finished:
                await realtime_manager.send_personal(websocket, {"type": "MOVE_REJECTED", "reason": "Game finished"})
                continue

            move_uci = str(incoming.get("move", "")).strip().lower()
            if not move_uci:
                from_sq = str(incoming.get("from", "")).strip().lower()
                to_sq = str(incoming.get("to", "")).strip().lower()
                promotion = str(incoming.get("promotion", "")).strip().lower()
                if promotion:
                    move_uci = f"{from_sq}{to_sq}{promotion}"
                else:
                    move_uci = f"{from_sq}{to_sq}"

            if not move_uci:
                await realtime_manager.send_personal(websocket, {"type": "MOVE_REJECTED", "reason": "Missing move"})
                continue

            turn_user = room.white_id if room.board.turn == chess.WHITE else room.black_id
            if turn_user != user_id:
                await realtime_manager.send_personal(websocket, {"type": "MOVE_REJECTED", "reason": "Not your turn"})
                continue

            try:
                move = chess.Move.from_uci(move_uci)
            except Exception:
                await realtime_manager.send_personal(websocket, {"type": "MOVE_REJECTED", "reason": "Invalid move format"})
                continue

            if move not in room.board.legal_moves:
                await realtime_manager.send_personal(websocket, {"type": "MOVE_REJECTED", "reason": "Illegal move"})
                continue

            room.board.push(move)
            room.last_clock_ts = datetime.utcnow()
            next_fen = room.board.fen()
            next_move_count = len(room.board.move_stack)

            should_sync_before_ai = room.is_ai and not room.finished and room.board.turn == chess.BLACK
            if should_sync_before_ai:
                await realtime_manager.broadcast(
                    game_id,
                    {
                        "type": "STATE_SYNC",
                        "state": room.to_payload(),
                    },
                )

            if should_sync_before_ai:
                think_start = perf_counter()
                ai_move = ai_for_level(_ai_level_from_mode(game_mode)).choose_move(room.board)
                think_elapsed_ms = int((perf_counter() - think_start) * 1000)

                if think_elapsed_ms > 0:
                    room.black_ms = max(0, room.black_ms - think_elapsed_ms)

                room.last_clock_ts = datetime.utcnow()

                if room.black_ms <= 0:
                    game_over_payload = None
                    event_db = SessionLocal()
                    try:
                        game = event_db.get(Game, game_id)
                        if game and game.status != "finished":
                            game_over_payload = _finish_game(event_db, game, room, "white_win", "timeout")
                    finally:
                        try:
                            event_db.close()
                        except Exception:
                            pass

                    await realtime_manager.broadcast(
                        game_id,
                        {
                            "type": "STATE_SYNC",
                            "state": room.to_payload(),
                        },
                    )
                    if game_over_payload:
                        await realtime_manager.broadcast(game_id, game_over_payload)
                    continue

                if ai_move is not None:
                    room.board.push(ai_move)
                    room.last_clock_ts = datetime.utcnow()
                    next_fen = room.board.fen()
                    next_move_count = len(room.board.move_stack)

            game_over_payload = None
            event_db = SessionLocal()
            try:
                game = event_db.get(Game, game_id)
                if not game or game.status == "finished":
                    room.finished = True
                    await realtime_manager.send_personal(
                        websocket,
                        {"type": "MOVE_REJECTED", "reason": "Game finished"},
                    )
                    continue

                game.status = "playing"
                game.final_fen = next_fen
                game.move_count = next_move_count

                if room.board.is_game_over(claim_draw=True):
                    result, reason = _game_result_from_board(room.board)
                    game_over_payload = _finish_game(event_db, game, room, result, reason)
                else:
                    event_db.add(game)
                    event_db.commit()
            finally:
                try:
                    event_db.close()
                except Exception:
                    pass

            await realtime_manager.broadcast(
                game_id,
                {
                    "type": "STATE_SYNC",
                    "state": room.to_payload(),
                },
            )

            if game_over_payload:
                await realtime_manager.broadcast(game_id, game_over_payload)

    except WebSocketDisconnect:
        pass
    except RuntimeError:
        # Defensive: runtime disconnect race can bypass WebSocketDisconnect.
        pass
    finally:
        offline = await realtime_manager.disconnect(game_id, user_id)
        if offline:
            set_offline(user_id)
            await realtime_manager.broadcast(game_id, {"type": "PRESENCE", "user_id": user_id, "online": False})
            await realtime_manager.broadcast(
                game_id,
                {
                    "type": "DISCONNECT_GRACE",
                    "user_id": user_id,
                    "active": True,
                    "seconds": DISCONNECT_GRACE_SECONDS,
                },
            )
            room = realtime_manager.get_room(game_id)
            if room:
                room.disconnect_started_at[user_id] = datetime.utcnow()
                room.disconnect_tasks[user_id] = asyncio.create_task(_forfeit_if_not_reconnected(game_id, user_id))

        pass
