from __future__ import annotations

import random

import chess


PIECE_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 0,
}


class ChessAI:
    def __init__(self, depth: int, blunder_rate: float) -> None:
        self.depth = depth
        self.blunder_rate = blunder_rate

    def choose_move(self, board: chess.Board) -> chess.Move | None:
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return None

        # Keep AI imperfect: occasionally choose a random legal move.
        if random.random() < self.blunder_rate:
            return random.choice(legal_moves)

        maximizing = board.turn == chess.WHITE
        best_score = float("-inf") if maximizing else float("inf")
        best_move: chess.Move | None = None

        for move in legal_moves:
            board.push(move)
            score = self._minimax(board, self.depth - 1, float("-inf"), float("inf"), not maximizing)
            board.pop()

            if maximizing and score > best_score:
                best_score = score
                best_move = move
            if not maximizing and score < best_score:
                best_score = score
                best_move = move

        return best_move

    def _minimax(self, board: chess.Board, depth: int, alpha: float, beta: float, maximizing: bool) -> float:
        if depth == 0 or board.is_game_over(claim_draw=True):
            return self._evaluate(board)

        if maximizing:
            value = float("-inf")
            for move in board.legal_moves:
                board.push(move)
                value = max(value, self._minimax(board, depth - 1, alpha, beta, False))
                board.pop()
                alpha = max(alpha, value)
                if beta <= alpha:
                    break
            return value

        value = float("inf")
        for move in board.legal_moves:
            board.push(move)
            value = min(value, self._minimax(board, depth - 1, alpha, beta, True))
            board.pop()
            beta = min(beta, value)
            if beta <= alpha:
                break
        return value

    def _evaluate(self, board: chess.Board) -> float:
        if board.is_checkmate():
            return -99999 if board.turn == chess.WHITE else 99999
        if board.is_stalemate() or board.is_insufficient_material() or board.can_claim_draw():
            return 0

        score = 0
        for piece_type, value in PIECE_VALUES.items():
            score += len(board.pieces(piece_type, chess.WHITE)) * value
            score -= len(board.pieces(piece_type, chess.BLACK)) * value

        # Small mobility bonus.
        score += 0.1 * len(list(board.legal_moves)) * (1 if board.turn == chess.WHITE else -1)
        return score


def ai_for_level(level: str) -> ChessAI:
    normalized = (level or "medium").lower()
    if normalized == "easy":
        return ChessAI(depth=1, blunder_rate=0.25)
    if normalized == "hard":
        return ChessAI(depth=3, blunder_rate=0.02)
    return ChessAI(depth=2, blunder_rate=0.10)
