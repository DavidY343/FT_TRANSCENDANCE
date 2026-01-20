import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings

User = settings.AUTH_USER_MODEL

# Tabla games
class Game(models.Model):
    STATUS_CHOICES = [
        ("WAITING", "Waiting"),
        ("ACTIVE", "Active"),
        ("FINISHED", "Finished"),
    ]
    TURN_CHOICES = [("w", "White"), ("b", "Black")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player_white = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_white")
    player_black = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_as_black")
    vs_ai = models.BooleanField(default=False)
    fen = models.CharField(max_length=100, default="")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="WAITING")
    turn = models.CharField(max_length=1, choices=TURN_CHOICES, default="w")
    white_clock = models.IntegerField(default=600000)
    black_clock = models.IntegerField(default=600000)
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(auto_now=True)


# Tabla game_results
class GameResult(models.Model):
    RESULT_CHOICES = [
        ("WIN", "Win"),
        ("LOSS", "Loss"),
        ("DRAW", "Draw"),
        ("RESIGNED", "Resigned"),
        ("TIMEOUT", "Timeout"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name="result")
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_won")
    loser = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_lost")
    result = models.CharField(max_length=10, choices=RESULT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

