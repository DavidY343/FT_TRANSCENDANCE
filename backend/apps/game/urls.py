# apps/game/urls.py
from django.urls import path
from .views import persist_game_result, get_game_results

urlpatterns = [
    path("results/", persist_game_result, name="persist-game-result"),  # POST
    path("results/all/", get_game_results, name="get-game-results"),    # GET
]
