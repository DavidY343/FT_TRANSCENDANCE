from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import Friendship, User
from app.presence import is_online
from app.schemas import FriendOut, FriendRequestOut, UserSearchOut


router = APIRouter(prefix="/friends", tags=["friends"])


def _user_search_out(user: User) -> UserSearchOut:
    return UserSearchOut(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        online=is_online(user.id),
    )


def _relation_between(db: Session, user_a: int, user_b: int) -> Friendship | None:
    return db.scalar(
        select(Friendship).where(
            or_(
                and_(Friendship.requester_id == user_a, Friendship.addressee_id == user_b),
                and_(Friendship.requester_id == user_b, Friendship.addressee_id == user_a),
            )
        )
    )


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
    related_ids = {
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
        if user.id in related_ids:
            continue
        result.append(_user_search_out(user))

    return result


@router.post("/{user_id}")
def send_friend_request(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot add yourself")

    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = _relation_between(db, current_user.id, user_id)
    if existing:
        if existing.status == "accepted":
            return {"message": "Already friends"}
        if existing.requester_id == current_user.id:
            return {"message": "Friend request already sent"}
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a pending request from this user",
        )

    friendship = Friendship(requester_id=current_user.id, addressee_id=user_id, status="pending")
    db.add(friendship)
    db.commit()
    return {"message": "Friend request sent"}


@router.get("/requests/incoming", response_model=list[FriendRequestOut])
def incoming_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    requests = db.scalars(
        select(Friendship)
        .where(Friendship.addressee_id == current_user.id, Friendship.status == "pending")
        .order_by(Friendship.created_at.desc())
    ).all()

    result: list[FriendRequestOut] = []
    for relation in requests:
        requester = db.get(User, relation.requester_id)
        addressee = db.get(User, relation.addressee_id)
        result.append(
            FriendRequestOut(
                id=relation.id,
                requester_id=relation.requester_id,
                addressee_id=relation.addressee_id,
                status=relation.status,
                created_at=relation.created_at,
                requester=_user_search_out(requester) if requester else None,
                addressee=_user_search_out(addressee) if addressee else None,
            )
        )
    return result


@router.get("/requests/outgoing", response_model=list[FriendRequestOut])
def outgoing_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    requests = db.scalars(
        select(Friendship)
        .where(Friendship.requester_id == current_user.id, Friendship.status == "pending")
        .order_by(Friendship.created_at.desc())
    ).all()

    result: list[FriendRequestOut] = []
    for relation in requests:
        requester = db.get(User, relation.requester_id)
        addressee = db.get(User, relation.addressee_id)
        result.append(
            FriendRequestOut(
                id=relation.id,
                requester_id=relation.requester_id,
                addressee_id=relation.addressee_id,
                status=relation.status,
                created_at=relation.created_at,
                requester=_user_search_out(requester) if requester else None,
                addressee=_user_search_out(addressee) if addressee else None,
            )
        )
    return result


@router.post("/requests/{requester_id}/accept")
def accept_request(requester_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    relation = db.scalar(
        select(Friendship).where(
            Friendship.requester_id == requester_id,
            Friendship.addressee_id == current_user.id,
            Friendship.status == "pending",
        )
    )
    if not relation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Friend request not found")

    relation.status = "accepted"
    db.add(relation)
    db.commit()
    return {"message": "Friend request accepted"}


@router.post("/requests/{requester_id}/reject")
def reject_request(requester_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    relation = db.scalar(
        select(Friendship).where(
            Friendship.requester_id == requester_id,
            Friendship.addressee_id == current_user.id,
            Friendship.status == "pending",
        )
    )
    if not relation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Friend request not found")

    db.delete(relation)
    db.commit()
    return {"message": "Friend request rejected"}


@router.delete("/{user_id}")
def remove_friend(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    friendship = _relation_between(db, current_user.id, user_id)
    if not friendship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Friendship not found")

    if friendship.status != "accepted":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove a non-accepted friendship")

    db.delete(friendship)
    db.commit()
    return {"message": "Friend removed"}


@router.get("", response_model=list[FriendOut])
def list_friends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    relations = db.scalars(
        select(Friendship).where(
            or_(Friendship.requester_id == current_user.id, Friendship.addressee_id == current_user.id),
            Friendship.status == "accepted",
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
