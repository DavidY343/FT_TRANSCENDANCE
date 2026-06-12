from __future__ import annotations

import asyncio
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime

import chess
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect


@dataclass
class RoomState:
    game_id: int
    white_id: int | None
    black_id: int | None
    white_info: dict | None = None
    black_info: dict | None = None
    board: chess.Board = field(default_factory=chess.Board)
    white_ms: int = 10 * 60 * 1000
    black_ms: int = 10 * 60 * 1000
    time_control_minutes: int = 10
    is_ai: bool = False
    finished: bool = False
    chat_messages: list[dict] = field(default_factory=list)
    last_clock_ts: datetime = field(default_factory=datetime.utcnow)
    clock_started: bool = False
    clock_task: asyncio.Task | None = None
    disconnect_tasks: dict[int, asyncio.Task] = field(default_factory=dict)
    disconnect_started_at: dict[int, datetime] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)

    def _active_disconnect_grace(self, grace_seconds: int) -> dict | None:
        """Return the active disconnect_grace entry, or None if none is active."""
        for user_id, task in self.disconnect_tasks.items():
            if not task.done():
                started = self.disconnect_started_at.get(user_id)
                if started is not None:
                    elapsed = max(0.0, (datetime.utcnow() - started).total_seconds())
                    remaining = max(0, int(grace_seconds - elapsed))
                    return {"user_id": user_id, "active": True, "seconds": remaining}
        return None

    def to_payload(self, grace_seconds: int = 30) -> dict:
        return {
            "game_id": self.game_id,
            "fen": self.board.fen(),
            "turn": "w" if self.board.turn == chess.WHITE else "b",
            "status": "finished" if self.finished or self.board.is_game_over(claim_draw=True) else "playing",
            "last_move": self.board.peek().uci() if self.board.move_stack else None,
            "move_count": len(self.board.move_stack),
            "is_check": self.board.is_check(),
            "legal_moves": [move.uci() for move in self.board.legal_moves],
            "players": {
                "white_id": self.white_id,
                "black_id": self.black_id,
                "white": self.white_info,
                "black": self.black_info,
            },
            "clocks": {"white_ms": self.white_ms, "black_ms": self.black_ms},
            "time_control_minutes": self.time_control_minutes,
            "is_ai": self.is_ai,
            "chat_messages": self.chat_messages,
            "disconnect_grace": self._active_disconnect_grace(grace_seconds),
        }


class RealtimeManager:
    def __init__(self) -> None:
        self._room_connections: dict[int, dict[int, WebSocket]] = defaultdict(dict)
        self._user_connections: dict[int, int] = defaultdict(int)
        self._rooms: dict[int, RoomState] = {}
        self._lock = asyncio.Lock()

    async def connect(self, game_id: int, user_id: int, websocket: WebSocket) -> bool:
        await websocket.accept()
        was_reconnecting = False
        async with self._lock:
            self._room_connections[game_id][user_id] = websocket
            self._user_connections[user_id] += 1

            room = self._rooms.get(game_id)
            if room and user_id in room.disconnect_tasks:
                if not room.disconnect_tasks[user_id].done():
                    room.disconnect_tasks[user_id].cancel()
                room.disconnect_tasks.pop(user_id, None)
                room.disconnect_started_at.pop(user_id, None)
                was_reconnecting = True

        return was_reconnecting

    async def disconnect(self, game_id: int, user_id: int) -> bool:
        async with self._lock:
            room_map = self._room_connections.get(game_id, {})
            room_map.pop(user_id, None)
            if not room_map and game_id in self._room_connections:
                self._room_connections.pop(game_id, None)

            if user_id in self._user_connections:
                self._user_connections[user_id] -= 1
                if self._user_connections[user_id] <= 0:
                    self._user_connections.pop(user_id, None)
                    return True
        return False

    def is_user_connected(self, user_id: int) -> bool:
        return self._user_connections.get(user_id, 0) > 0

    def get_or_create_room(
        self,
        game_id: int,
        white_id: int | None,
        black_id: int | None,
        fen: str | None,
        *,
        white_info: dict | None = None,
        black_info: dict | None = None,
        initial_ms: int = 10 * 60 * 1000,
        time_control_minutes: int = 10,
        is_ai: bool = False,
        finished: bool = False,
    ) -> RoomState:
        room = self._rooms.get(game_id)
        if room:
            room.time_control_minutes = time_control_minutes
            room.is_ai = is_ai
            room.finished = finished or room.finished
            if white_info:
                room.white_info = white_info
            if black_info:
                room.black_info = black_info
            return room

        board = chess.Board(fen) if fen else chess.Board()
        room = RoomState(
            game_id=game_id,
            white_id=white_id,
            black_id=black_id,
            white_info=white_info,
            black_info=black_info,
            board=board,
            white_ms=initial_ms,
            black_ms=initial_ms,
            time_control_minutes=time_control_minutes,
            is_ai=is_ai,
            finished=finished,
        )
        self._rooms[game_id] = room
        return room

    def get_room(self, game_id: int) -> RoomState | None:
        return self._rooms.get(game_id)

    def get_connected_count(self, game_id: int) -> int:
        return len(self._room_connections.get(game_id, {}))

    async def send_personal(self, websocket: WebSocket, payload: dict) -> None:
        try:
            await websocket.send_json(payload)
        except (WebSocketDisconnect, RuntimeError):
            return

    async def broadcast(self, game_id: int, payload: dict) -> None:
        room_map = self._room_connections.get(game_id, {})
        stale_users: list[int] = []

        for user_id, websocket in list(room_map.items()):
            try:
                await websocket.send_json(payload)
            except (WebSocketDisconnect, RuntimeError):
                stale_users.append(user_id)

        if stale_users:
            async with self._lock:
                target_room = self._room_connections.get(game_id, {})
                for user_id in stale_users:
                    target_room.pop(user_id, None)
                    if user_id in self._user_connections:
                        self._user_connections[user_id] -= 1
                        if self._user_connections[user_id] <= 0:
                            self._user_connections.pop(user_id, None)


realtime_manager = RealtimeManager()
