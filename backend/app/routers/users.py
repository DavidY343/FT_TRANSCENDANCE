import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import User, Friendship, Game
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


@router.get("/me/achievements")
def get_my_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Add friend achievement
    has_friend = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) | (Friendship.addressee_id == current_user.id)) &
        (Friendship.status == "accepted")
    ).first() is not None

    # 2. Reach > 1250 Elo achievement
    high_elo = current_user.elo > 1250

    # 3. Play un-AI (human) game achievement
    played_human = db.query(Game).filter(
        ((Game.white_id == current_user.id) & (Game.black_id.isnot(None))) |
        ((Game.black_id == current_user.id) & (Game.white_id.isnot(None)))
    ).filter(
        Game.status == "finished"
    ).filter(
        ~Game.mode.like("ai:%")
    ).first() is not None

    # 4. Play AI game achievement
    played_ai = db.query(Game).filter(
        (Game.white_id == current_user.id) | (Game.black_id == current_user.id)
    ).filter(
        Game.status == "finished"
    ).filter(
        Game.mode.like("ai:%")
    ).first() is not None

    achievements = [
        {
            "id": "add_friend",
            "title": "Friendly Spirit",
            "description": "Add at least one friend",
            "emoji": "🤝",
            "unlocked": has_friend
        },
        {
            "id": "elo_1250",
            "title": "Tactical Master",
            "description": "Reach more than 1250 Elo rating",
            "emoji": "🏆",
            "unlocked": high_elo
        },
        {
            "id": "play_human",
            "title": "True Competitor",
            "description": "Play a finished game against a human player",
            "emoji": "👤",
            "unlocked": played_human
        },
        {
            "id": "play_ai",
            "title": "Machine Challenger",
            "description": "Play a finished game against the AI",
            "emoji": "🤖",
            "unlocked": played_ai
        }
    ]
    return achievements
