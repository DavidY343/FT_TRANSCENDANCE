from apps.contracts.api_contracts import GameState
from .models import Game

def serialize_game_to_gamestate(game: Game) -> GameState:
    """
    Convierte un modelo Game a GameState (contrato compartido)
    """
    return GameState(
        game_id=str(game.id),
        fen=game.fen,
        turn=game.turn,
        status=game.status,
        clocks={
            "wMs": getattr(game, "white_clock", 0),
            "bMs": getattr(game, "black_clock", 0)
        },
        players={
            "whiteId": str(game.player_white.id),
            "blackId": str(game.player_black.id) if game.player_black else None
        },
    )