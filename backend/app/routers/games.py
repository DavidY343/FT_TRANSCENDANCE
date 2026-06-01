from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Game, User
from app.realtime import realtime_manager
from app.schemas import CreateAIGameRequest


router = APIRouter(prefix="/games", tags=["games"])


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


@router.post("/vs-ai")
def create_vs_ai_game(
    payload: CreateAIGameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    game = Game(mode=f"ai:{payload.difficulty}:{payload.time_minutes}", white_id=current_user.id, black_id=None, status="playing")
    db.add(game)
    db.commit()
    db.refresh(game)
    return {
        "game_id": game.id,
        "mode": game.mode,
        "difficulty": payload.difficulty,
        "time_minutes": payload.time_minutes,
    }


@router.get("/history")
def game_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    games = (
        db.query(Game)
        .filter((Game.white_id == current_user.id) | (Game.black_id == current_user.id))
        .order_by(Game.started_at.desc())
        .limit(20)
        .all()
    )

    user_ids = {
        user_id
        for game in games
        for user_id in (game.white_id, game.black_id)
        if user_id is not None
    }
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    users_by_id = {user.id: user for user in users}

    def _player_info(user_id: int | None):
        if user_id is None:
            return None
        user = users_by_id.get(user_id)
        if user is None:
            return {"id": user_id, "username": "unknown", "display_name": "Unknown"}
        return {"id": user.id, "username": user.username, "display_name": user.display_name}

    def _result_for_me(game: Game) -> str:
        if game.status != "finished":
            return "in_progress"
        if game.result == "draw":
            return "draw"

        is_white = game.white_id == current_user.id
        if game.result == "white_win":
            return "win" if is_white else "loss"
        if game.result == "black_win":
            return "loss" if is_white else "win"
        return "unknown"

    history = []
    for game in games:
        is_white = game.white_id == current_user.id
        opponent_id = game.black_id if is_white else game.white_id
        if game.mode.startswith("ai:") and opponent_id is None:
            parts = game.mode.split(":")
            difficulty = parts[1] if len(parts) >= 2 else "medium"
            opponent = {"id": None, "username": "ai", "display_name": f"AI ({difficulty or 'medium'})"}
        else:
            opponent = _player_info(opponent_id)

        history.append(
            {
                "id": game.id,
                "mode": game.mode,
                "status": game.status,
                "result": game.result,
                "result_for_me": _result_for_me(game),
                "my_color": "white" if is_white else "black",
                "white": _player_info(game.white_id),
                "black": _player_info(game.black_id),
                "opponent": opponent,
                "started_at": game.started_at,
                "ended_at": game.ended_at,
            }
        )

    return history


@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    users = db.query(User).order_by(User.elo.desc()).limit(20).all()
    return [{"id": u.id, "username": u.username, "display_name": u.display_name, "elo": u.elo} for u in users]


@router.get("/{game_id}")
def get_game(game_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    game = db.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")

    allowed = current_user.id == game.white_id or current_user.id == game.black_id
    if game.mode.startswith("ai:") and current_user.id == game.white_id:
        allowed = True
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    return {
        "id": game.id,
        "mode": game.mode,
        "status": game.status,
        "result": game.result,
        "white_id": game.white_id,
        "black_id": game.black_id,
        "final_fen": game.final_fen,
        "move_count": game.move_count,
        "started_at": game.started_at,
        "ended_at": game.ended_at,
    }


@router.get("/{game_id}/state")
def get_game_state(game_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    game = db.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")

    allowed = current_user.id == game.white_id or current_user.id == game.black_id
    if game.mode.startswith("ai:") and current_user.id == game.white_id:
        allowed = True
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    initial_minutes = _time_minutes_from_mode(game.mode)
    room = realtime_manager.get_or_create_room(
        game.id,
        game.white_id,
        game.black_id,
        game.final_fen,
        initial_ms=initial_minutes * 60 * 1000,
        time_control_minutes=initial_minutes,
        is_ai=game.mode.startswith("ai:"),
        finished=game.status == "finished",
    )
    return room.to_payload()
