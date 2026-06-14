import { Chessboard } from "react-chessboard";

import { isOwnPiece } from '../../hooks/gameBoardHooks/boardRules';

export function GameBoard({ room })
{
	const state = room?.state;

	function isDraggablePiece({ piece })
	{
		return Boolean(
			room?.canInteractBoard
			&& isOwnPiece(piece, room?.myColor)
		);
	}

	return (
		<div className="chessboard">
			<Chessboard
				position={state?.fen || 'start'}
				boardOrientation={room?.myColor || 'white'}
				onPieceDragBegin={room?.beginDragPiece}
				onPieceDragEnd={room?.endDragPiece}
				onPieceDrop={room?.dropPiece}
				onPieceClick={room?.selectPiece}
				onPromotionPieceSelect={room?.confirmPromotion}
				onPromotionCheck={() => false}
				showPromotionDialog={Boolean(room?.pendingPromotion)}
				promotionToSquare={room?.pendingPromotion?.to || null}
				onSquareClick={room?.selectTarget}
				customSquareStyles={room?.squareStyles}
				arePiecesDraggable={room?.canInteractBoard}
				isDraggablePiece={isDraggablePiece}
			/>
		</div>
	);
}
