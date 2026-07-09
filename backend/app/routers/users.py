import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import User, Friendship, Game, UserAchievement
from app.schemas import UserOut, UserUpdateRequest


router = APIRouter(prefix="/users", tags=["users"])
UPLOAD_DIR = "/app/uploads"
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 2 * 1024 * 1024


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(payload: UserUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.display_name = payload.display_name
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(file.filename or "")[1].lower() or ".png"
    avatar_name = f"{uuid4().hex}{extension}"
    avatar_path = os.path.join(UPLOAD_DIR, avatar_name)

    with open(avatar_path, "wb") as out:
        out.write(content)

    current_user.avatar_url = f"/uploads/{avatar_name}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


def _get_achievements_for_user(db: Session, user: User):
    # --- Compute live conditions ---
    has_friend = db.query(Friendship).filter(
        ((Friendship.requester_id == user.id) | (Friendship.addressee_id == user.id)) &
        (Friendship.status == "accepted")
    ).first() is not None

    high_elo = user.elo > 1250

    played_human = db.query(Game).filter(
        ((Game.white_id == user.id) & (Game.black_id.isnot(None))) |
        ((Game.black_id == user.id) & (Game.white_id.isnot(None)))
    ).filter(
        Game.status == "finished"
    ).filter(
        ~Game.mode.like("ai:%")
    ).first() is not None

    played_ai = db.query(Game).filter(
        (Game.white_id == user.id) | (Game.black_id == user.id)
    ).filter(
        Game.status == "finished"
    ).filter(
        Game.mode.like("ai:%")
    ).first() is not None

    # --- Achievement definitions ---
    definitions = [
        {"id": "add_friend", "title": "Friendly Spirit", "description": "Add at least one friend", "emoji": "🤝", "condition": has_friend},
        {"id": "elo_1250", "title": "Tactical Master", "description": "Reach more than 1250 Elo rating", "emoji": "🏆", "condition": high_elo},
        {"id": "play_human", "title": "True Competitor", "description": "Play a finished game against a human player", "emoji": "👤", "condition": played_human},
        {"id": "play_ai", "title": "Machine Challenger", "description": "Play a finished game against the AI", "emoji": "🤖", "condition": played_ai},
    ]

    # --- Load persisted achievements ---
    persisted = {row.achievement_id: row for row in db.query(UserAchievement).filter(
        UserAchievement.user_id == user.id
    ).all()}

    # --- Sync: persist newly unlocked achievements ---
    for defn in definitions:
        if defn["condition"] and defn["id"] not in persisted:
            record = UserAchievement(user_id=user.id, achievement_id=defn["id"])
            db.add(record)
            persisted[defn["id"]] = record

    if db.new:
        db.commit()

    # --- Build response ---
    achievements = []
    for defn in definitions:
        entry = {
            "id": defn["id"],
            "title": defn["title"],
            "description": defn["description"],
            "emoji": defn["emoji"],
            "unlocked": defn["id"] in persisted,
        }
        record = persisted.get(defn["id"])
        if record and hasattr(record, "unlocked_at") and record.unlocked_at:
            entry["unlocked_at"] = record.unlocked_at.isoformat()
        achievements.append(entry)

    return achievements


@router.get("/me/achievements")
def get_my_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_achievements_for_user(db, current_user)


@router.get("/{user_id}/achievements")
def get_user_achievements(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _get_achievements_for_user(db, user)
