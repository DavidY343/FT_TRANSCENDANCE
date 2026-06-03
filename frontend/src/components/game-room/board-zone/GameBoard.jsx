import { Chessboard } from "react-chessboard";

export function GameBoard({ room })
{
	const state = room?.state;

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
			/>
		</div>
	);
}