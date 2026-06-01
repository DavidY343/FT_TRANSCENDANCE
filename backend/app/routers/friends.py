from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Friendship, User
from app.presence import is_online
from app.schemas import FriendOut, UserSearchOut


router = APIRouter(prefix="/friends", tags=["friends"])


@router.get("/search", response_model=list[UserSearchOut])
def search_users(
    q: str = Query(min_length=2, max_length=80),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pattern = f"%{q.strip()}%"
    relations = db.scalars(
        select(Friendship).where(
            or_(Friendship.requester_id == current_user.id, Friendship.addressee_id == current_user.id)
        )
    ).all()
    friend_ids = {
        relation.addressee_id if relation.requester_id == current_user.id else relation.requester_id
        for relation in relations
    }

    users = db.scalars(
        select(User)
        .where(
            User.id != current_user.id,
            User.is_active.is_(True),
            or_(User.username.ilike(pattern), User.display_name.ilike(pattern)),
        )
        .order_by(User.username.asc())
        .limit(12)
    ).all()

    result: list[UserSearchOut] = []
    for user in users:
        if user.id in friend_ids:
            continue
        result.append(
            UserSearchOut(
                id=user.id,
                username=user.username,
                display_name=user.display_name,
                avatar_url=user.avatar_url,
                online=is_online(user.id),
            )
        )

    return result


@router.post("/{user_id}")
def add_friend(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot add yourself")

    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    low_id = min(current_user.id, user_id)
    high_id = max(current_user.id, user_id)
    existing = db.scalar(
        select(Friendship).where(and_(Friendship.requester_id == low_id, Friendship.addressee_id == high_id))
    )
    if existing:
        return {"message": "Already friends"}

    friendship = Friendship(requester_id=low_id, addressee_id=high_id, status="accepted")
    db.add(friendship)
    db.commit()
    return {"message": "Friend added"}


@router.delete("/{user_id}")
def remove_friend(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    low_id = min(current_user.id, user_id)
    high_id = max(current_user.id, user_id)
    friendship = db.scalar(
        select(Friendship).where(and_(Friendship.requester_id == low_id, Friendship.addressee_id == high_id))
    )
    if not friendship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Friendship not found")

    db.delete(friendship)
    db.commit()
    return {"message": "Friend removed"}


@router.get("", response_model=list[FriendOut])
def list_friends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    relations = db.scalars(
        select(Friendship).where(
            or_(Friendship.requester_id == current_user.id, Friendship.addressee_id == current_user.id)
        )
    ).all()

    result: list[FriendOut] = []
    for relation in relations:
        friend_id = relation.addressee_id if relation.requester_id == current_user.id else relation.requester_id
        friend = db.get(User, friend_id)
        if friend:
            result.append(
                FriendOut(
                    id=friend.id,
                    username=friend.username,
                    display_name=friend.display_name,
                    avatar_url=friend.avatar_url,
                    online=is_online(friend.id),
                )
            )
    return result
