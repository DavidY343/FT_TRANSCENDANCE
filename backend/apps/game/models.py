import uuid
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class GameResults(models.Model):

    RESULT_CHOICES = [
        ("CHECKMATE", "Checkmate"),
        ("DRAW", "Draw"),
        ("RESIGNED", "Resigned"),
        ("TIMEOUT", "Timeout"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player_white = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_white")
    player_black = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_as_black")
    vs_ai = models.BooleanField(default=False)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_won")
    loser = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_lost")
    result = models.CharField(max_length=10, choices=RESULT_CHOICES)
    finished_at = models.DateTimeField(auto_now=True)

