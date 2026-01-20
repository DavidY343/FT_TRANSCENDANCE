from django.urls import path
from .views import get_game_state

urlpatterns = [
    path("GameState/", get_game_state, name="game-state"),
]