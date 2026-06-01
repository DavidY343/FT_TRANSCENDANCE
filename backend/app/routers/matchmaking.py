from __future__ import annotations

from collections import deque
from random import shuffle
from threading import Lock

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Game, User


router = APIRouter(prefix="/matchmaking", tags=["matchmaking"])

_queue: deque[int] = deque()
_pending_matches: dict[int, int] = {}
_lock = Lock()


def _remove_from_queue(user_id: int) -> None:
    global _queue
    _queue = deque(uid for uid in _queue if uid != user_id)


@router.post("/join")
def join_queue(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    with _lock:
        matched_game_id = _pending_matches.pop(current_user.id, None)
        if matched_game_id:
            return {"status": "matched", "game_id": matched_game_id}

        if current_user.id in _queue:
            position = list(_queue).index(current_user.id) + 1
            return {"status": "waiting", "position": position}

        if _queue:
            opponent_id = _queue.popleft()
            players = [current_user.id, opponent_id]
            shuffle(players)
            white_id, black_id = players

            game = Game(mode="1v1", white_id=white_id, black_id=black_id, status="playing")
            db.add(game)
            db.commit()
            db.refresh(game)

            _pending_matches[opponent_id] = game.id
            return {"status": "matched", "game_id": game.id}

        _queue.append(current_user.id)
        return {"status": "waiting", "position": len(_queue)}


@router.delete("/leave")
def leave_queue(current_user: User = Depends(get_current_user)):
    with _lock:
        _remove_from_queue(current_user.id)
        _pending_matches.pop(current_user.id, None)
    return {"status": "left"}


@router.get("/status")
def queue_status(current_user: User = Depends(get_current_user)):
    with _lock:
        matched_game_id = _pending_matches.pop(current_user.id, None)
        if matched_game_id:
            return {"status": "matched", "game_id": matched_game_id}

        if current_user.id in _queue:
            return {"status": "waiting", "position": list(_queue).index(current_user.id) + 1}

    return {"status": "idle"}
