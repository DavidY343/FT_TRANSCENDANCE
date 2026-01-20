import uuid
import os
import django
from django.utils import timezone

# 1️⃣ Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.users.models import User, GameStatistics
from apps.friends.models import Friendship
from apps.game.models import Game, GameResult


def run():
    print("Seeding database...")

    # --- 1️⃣ Crear usuarios (si no existen por email) ---
    user_data = [
        {"username": "alice", "email": "alice@example.com", "first_name": "Alice", "last_name": "Test"},
        {"username": "bob", "email": "bob@example.com", "first_name": "Bob", "last_name": "Test"},
        {"username": "charlie", "email": "charlie@example.com", "first_name": "Charlie", "last_name": "Test"},
        {"username": "diana", "email": "diana@example.com", "first_name": "Diana", "last_name": "Test"},
    ]
    users = []
    for data in user_data:
        user, created = User.objects.get_or_create(
            email=data["email"],
            defaults={
                "id": uuid.uuid4(),
                "username": data["username"],
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "password": "pbkdf2_sha256$fakehash",  # fake password, normalmente usar set_password
                "avatar_url": f"https://example.com/avatar/{data['username']}.png",
                "is_active": True,
                "date_joined": timezone.now(),
            }
        )
        users.append(user)

    print(f"Users seeded: {len(users)}")

    # --- 2️⃣ Crear amistades (si no existen) ---
    friendship_pairs = [
        (users[0], users[1]),
        (users[0], users[2]),
        (users[1], users[2]),
        (users[2], users[3]),
    ]
    for requester, addressee in friendship_pairs:
        Friendship.objects.get_or_create(
            requester=requester,
            addressee=addressee,
            defaults={
                "id": uuid.uuid4(),
                "status": "ACCEPTED",
                "created_at": timezone.now(),
            }
        )
    print(f"Friendships seeded: {len(friendship_pairs)}")

    # --- 3️⃣ Crear partidas (si no existen por combinación de jugadores y estado) ---
    games = []
    for i in range(3):
        white = users[i % len(users)]
        black = users[(i + 1) % len(users)]
        game, created = Game.objects.get_or_create(
            player_white=white,
            player_black=black,
            status="PLAYING",
            defaults={
                "id": uuid.uuid4(),
                "vs_ai": False,
                "fen": "startpos",
                "turn": "w",
                "white_clock": 600000,
                "black_clock": 600000,
                "created_at": timezone.now(),
                "finished_at": timezone.now(),
            }
        )
        games.append(game)

    print(f"Games seeded: {len(games)}")

    # --- 4️⃣ Crear resultados (si no existen) ---
    for i, game in enumerate(games):
        winner = game.player_white if i % 2 == 0 else game.player_black
        loser = game.player_black if winner == game.player_white else game.player_white
        GameResult.objects.get_or_create(
            game=game,
            defaults={
                "id": uuid.uuid4(),
                "winner": winner,
                "loser": loser,
                "result": "WIN",
                "created_at": timezone.now(),
            }
        )
    print(f"Game results seeded: {len(games)}")

    # --- 5️⃣ Crear estadísticas (si no existen) ---
    for user in users:
        GameStatistics.objects.get_or_create(
            user=user,
            defaults={
                "total_games": 2,
                "wins": 1,
                "losses": 1,
                "draws": 0,
                "elo_rating": 1200,
                "updated_at": timezone.now(),
            }
        )

    print("Database seeding complete!")


if __name__ == "__main__":
    run()
