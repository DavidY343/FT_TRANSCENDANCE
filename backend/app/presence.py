ONLINE_USERS: set[int] = set()


def set_online(user_id: int) -> None:
    ONLINE_USERS.add(user_id)


def set_offline(user_id: int) -> None:
    ONLINE_USERS.discard(user_id)


def is_online(user_id: int) -> bool:
    return user_id in ONLINE_USERS
