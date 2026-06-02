import { Chessboard } from "react-chessboard";

export function GameBoard({
	fen,
	orientation = 'white',
	onPieceDrop,
	onPieceClick,
	onSquareClick,
	squareStyles = {},
	canMove = false,
})
{
	return (
		<div className="card game-board">
			<Chessboard
				position={fen || 'start'}
				boardOrientation={orientation}
				onPieceDrop={onPieceDrop}
				onPieceClick={onPieceClick}
				onSquareClick={onSquareClick}
				customSquareStyles={squareStyles}
				arePiecesDraggable={canMove}
			/>
		</div>
	);
}