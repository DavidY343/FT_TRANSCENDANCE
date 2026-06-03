import { useMemo, useState } from 'react';
import { getLegalTargets } from './boardRules';
import { sendMove } from './socketActions';
import { buildSquareStyles } from './boardStyles';
import { usePromotion } from './usePromotion';
import { useBoardMoves } from './useBoardMoves';

export function useGameBoard({
	wsRef,
	setError,
	canInteractBoard,
	myColor,
	legalMoves = [],
	loserKingSquare,
})
{
	const [selectedSquare, setSelectedSquare] = useState(null);

	const legalTargets = useMemo(() => (
		getLegalTargets(legalMoves, selectedSquare)
	), [legalMoves, selectedSquare]);

	const squareStyles = useMemo(() => (
		buildSquareStyles({
			selectedSquare,
			legalTargets,
			loserKingSquare,
		})
	), [legalTargets, loserKingSquare, selectedSquare]);

	function submitMove(from, to, promotion = '')
	{
		return sendMove({
			wsRef,
			setError,
			from,
			to,
			promotion,
		});
	}

	const promotion = usePromotion({
		legalMoves,
		submitMove,
	});

	const moves = useBoardMoves({
		canInteractBoard,
		myColor,
		legalMoves,
		legalTargets,
		selectedSquare,
		setSelectedSquare,
		submitMove,
		promotion,
	});

	return {
		selectedSquare,
		squareStyles,

		selectPiece: moves.selectPiece,
		beginDragPiece: moves.beginDragPiece,
		endDragPiece: moves.endDragPiece,
		selectTarget: moves.selectTarget,
		dropPiece: moves.dropPiece,

		submitMove,

		pendingPromotion: promotion.pendingPromotion,
		confirmPromotion: promotion.confirmPromotion,
		cancelPromotion: promotion.cancelPromotion,
	};
}
