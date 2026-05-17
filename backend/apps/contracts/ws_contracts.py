def state_sync_payload(game_state):
    return {"event": "STATE_SYNC", "payload": game_state.to_dict()}

def move_submit_payload(from_square, to_square, promotion=None):
    return {"event": "MOVE_SUBMIT", "payload": {"from": from_square, "to": to_square, "promotion": promotion}}

def game_over_payload(winner_id, loser_id, result):
    return {"event": "GAME_OVER", "payload": {"winnerId": winner_id, "loserId": loser_id, "result": result}}
