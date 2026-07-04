from __future__ import annotations

from collections import deque
from random import shuffle
from threading import Lock

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Game, User
from app.schemas import MatchmakingJoinRequest


router = APIRouter(prefix="/matchmaking", tags=["matchmaking"])

_queues: dict[int, deque[int]] = {5: deque(), 10: deque(), 30: deque()}
_pending_matches: dict[int, int] = {}
_lock = Lock()


def _remove_from_all_queues(user_id: int) -> None:
    for key in _queues:
        _queues[key] = deque(uid for uid in _queues[key] if uid != user_id)


@router.post("/join")
def join_queue(
    payload: MatchmakingJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from fastapi import HTTPException, status
    queue = _queues[payload.time_minutes]
    with _lock:
        active_game = db.query(Game).filter(
            ((Game.white_id == current_user.id) | (Game.black_id == current_user.id)),
            Game.status != "finished"
        ).first()
        if active_game:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have an active game in progress")

        matched_game_id = _pending_matches.pop(current_user.id, None)
        if matched_game_id:
            return {"status": "matched", "game_id": matched_game_id}

        for minutes, q in _queues.items():
            if current_user.id in q:
                position = list(q).index(current_user.id) + 1
                if minutes == payload.time_minutes:
                    return {
                        "status": "waiting",
                        "position": position,
                        "time_minutes": minutes,
                    }
                _remove_from_all_queues(current_user.id)
                break

        if queue:
            opponent_id = queue.popleft()
            players = [current_user.id, opponent_id]
            shuffle(players)
            white_id, black_id = players

            game = Game(mode=f"1v1:{payload.time_minutes}", white_id=white_id, black_id=black_id, status="playing")
            db.add(game)
            db.commit()
            db.refresh(game)

            _pending_matches[opponent_id] = game.id
            return {"status": "matched", "game_id": game.id, "time_minutes": payload.time_minutes}

        queue.append(current_user.id)
        return {"status": "waiting", "position": len(queue), "time_minutes": payload.time_minutes}


@router.delete("/leave")
def leave_queue(current_user: User = Depends(get_current_user)):
    with _lock:
        _remove_from_all_queues(current_user.id)
        _pending_matches.pop(current_user.id, None)
    return {"status": "left"}


@router.get("/status")
def queue_status(current_user: User = Depends(get_current_user)):
    with _lock:
        matched_game_id = _pending_matches.pop(current_user.id, None)
        if matched_game_id:
            return {"status": "matched", "game_id": matched_game_id}

        for minutes, q in _queues.items():
            if current_user.id in q:
                return {
                    "status": "waiting",
                    "position": list(q).index(current_user.id) + 1,
                    "time_minutes": minutes,
                }

    return {"status": "idle"}
