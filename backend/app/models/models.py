import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

# User Manager personalizado
class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, email, password, **extra_fields)


# Tabla users
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    avatar_url = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username

# Tabla friendships
class Friendship(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
        ("DECLINED", "Declined"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_sent")
    addressee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_received")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("requester", "addressee")

    def __str__(self):
        return f"{self.requester.username} -> {self.addressee.username} ({self.status})"

# Tabla games
class Game(models.Model):
    STATUS_CHOICES = [
        ("WAITING", "Waiting"),
        ("PLAYING", "Playing"),
        ("CHECKMATE", "Checkmate"),
        ("STALEMATE", "Stalemate"),
        ("DRAW", "Draw"),
        ("RESIGNED", "Resigned"),
        ("TIMEOUT", "Timeout"),
    ]
    TURN_CHOICES = [("w", "White"), ("b", "Black")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player_white = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_white")
    player_black = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_as_black")
    vs_ai = models.BooleanField(default=False)
    fen = models.CharField(max_length=100, default="")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="WAITING")
    turn = models.CharField(max_length=1, choices=TURN_CHOICES, default="w")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Game {self.id} - {self.player_white} vs {self.player_black or 'AI'}"


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

    def __str__(self):
        return f"Result Game {self.game.id} - {self.result}"

# Tabla user_statistics
class GameStatistics(models.Model):
    user = models.OneToOneField(User, primary_key=True, on_delete=models.CASCADE, related_name="statistics")
    total_games = models.PositiveIntegerField(default=0)
    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    draws = models.PositiveIntegerField(default=0)
    elo_rating = models.IntegerField(default=1000)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Elo: {self.elo_rating} | Games: {self.total_games}"
