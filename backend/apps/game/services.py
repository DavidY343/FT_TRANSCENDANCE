# apps/game/services.py

from .models import GameResults

def save_game_result(player_white_id, player_black_id, winner_id=None, loser_id=None, result="DRAW", vs_ai=False):

    if winner_id and loser_id and winner_id == loser_id:
        raise ValueError("Winner and loser cannot be the same user")

    if result == "DRAW" and (winner_id or loser_id):
        raise ValueError("Draw result cannot have winner or loser")

    game_result = GameResults.objects.create(
        player_white_id=player_white_id,
        player_black_id=player_black_id,
        winner_id=winner_id,
        loser_id=loser_id,
        result=result,
        vs_ai=vs_ai,
    )
    return game_result
