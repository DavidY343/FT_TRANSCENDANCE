import { Chessboard } from "react-chessboard";

export function GameBoard({
	fen,
	orientation = 'white',
	onPieceDrop,
	onPieceClick,
	onPieceDragBegin,
	onPieceDragEnd,
	onPromotionPieceSelect,
	showPromotionDialog = false,
	promotionToSquare = null,
	onSquareClick,
	squareStyles = {},
	canMove = false,
	error,
})
{
	return (
		<div className="card game-board">
			<Chessboard
				position={fen || 'start'}
				boardOrientation={orientation}
				onPieceDragBegin={onPieceDragBegin}
				onPieceDragEnd={onPieceDragEnd}
				onPieceDrop={onPieceDrop}
				onPieceClick={onPieceClick}
				onPromotionPieceSelect={onPromotionPieceSelect}
				onPromotionCheck={() => false}
				showPromotionDialog={showPromotionDialog}
				promotionToSquare={promotionToSquare}
				onSquareClick={onSquareClick}
				customSquareStyles={squareStyles}
				arePiecesDraggable={canMove}
			/>
		</div>
	);
}
