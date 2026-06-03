import { GameBoard } from "./GameBoard";
import { GameRoomClocks } from "./GameRoomClocks";

export function GameRoomBoardArea({room})
{
	const state = room?.state;

	return (
		<main className="game-board-area">
			<GameRoomClocks
				clocks={state?.clocks}
				turn={state?.turn}
				players={{
					white: state?.players?.white_id ? `Player #${state.players.white_id}` : `White`,
					black: state?.players?.black_id ? `Player #${state.players.black_id}` : `Black`,
				}}
			/>
			<GameBoard
				fen={state?.fen}
				orientation={room?.myColor || 'white'}
				onPieceDragBegin={room?.beginDragPiece}
				onPieceDragEnd={room?.endDragPiece}
				onPieceDrop={room?.dropPiece}
				onPieceClick={room?.selectPiece}
				onPromotionPieceSelect={room?.confirmPromotion}
				showPromotionDialog={Boolean(room?.pendingPromotion)}
				promotionToSquare={room?.pendingPromotion?.to || null}
				onSquareClick={room?.selectTarget}
				squareStyles={room?.squareStyles}
				canMove={room?.canInteractBoard}
			/>
		</main>
	);
}
