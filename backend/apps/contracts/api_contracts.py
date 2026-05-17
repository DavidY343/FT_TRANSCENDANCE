class GameState:
    def __init__(self, game_id, fen, turn, status, clocks, players):
        self.game_id = game_id
        self.fen = fen
        self.turn = turn
        self.status = status
        self.clocks = clocks
        self.players = players

    def to_dict(self):
        return {
            "gameId": self.game_id,
            "fen": self.fen,
            "turn": self.turn,
            "status": self.status,
            "clocks": self.clocks,
            "players": self.players
        }


def api_success(data):
    return {"success": True, "data": data}

def api_error(message):
    return {"success": False, "error": message}
