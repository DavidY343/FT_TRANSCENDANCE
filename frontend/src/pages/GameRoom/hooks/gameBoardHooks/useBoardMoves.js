import { isLegalMove, isLegalTarget, isOwnPiece } from './boardRules';

export function useBoardMoves({
	canInteractBoard,
	myColor,
	legalMoves,
	legalTargets,
	selectedSquare,
	setSelectedSquare,
	submitMove,
	promotion,
})
{
	function selectPiece(piece, square)
	{
		if (!canInteractBoard)
		{
			setSelectedSquare(null);
			return;
		}

		if (!isOwnPiece(piece, myColor))
		{
			setSelectedSquare(null);
			return;
		}

		setSelectedSquare(square);
	}

	function selectTarget(square)
	{
		if (!canInteractBoard || !selectedSquare)
			return;

		const promotionCandidates = promotion.getPromotionCandidates(
			selectedSquare,
			square
		);

		if (
			promotionCandidates.length === 0
			&& !isLegalTarget(legalMoves, selectedSquare, square)
		)
		{
			setSelectedSquare(null);
			return;
		}

		if (promotionCandidates.length > 0)
		{
			promotion.openPromotion(
				selectedSquare,
				square,
				promotionCandidates
			);
			setSelectedSquare(null);
			return;
		}

		submitMove(selectedSquare, square, '');
		setSelectedSquare(null);
	}

	function beginDragPiece(piece, square)
	{
		selectPiece(piece, square);
	}

	function endDragPiece()
	{
		window.setTimeout(() => {
			setSelectedSquare(null);
		}, 0);
	}

	function dropPiece(from, to, piece)
	{
		if (!canInteractBoard)
		{
			setSelectedSquare(null);
			return (false);
		}

		if (!isOwnPiece(piece, myColor))
		{
			setSelectedSquare(null);
			return (false);
		}

		const promotionCandidates = promotion.getPromotionCandidates(from, to);

		if (promotionCandidates.length > 0)
		{
			promotion.openPromotion(from, to, promotionCandidates);
			setSelectedSquare(null);
			return (false);
		}

		if (!isLegalMove(legalMoves, from, to))
		{
			setSelectedSquare(null);
			return (false);
		}

		setSelectedSquare(null);
		return submitMove(from, to, '');
	}

	return {
		selectPiece,
		selectTarget,
		beginDragPiece,
		endDragPiece,
		dropPiece,
	};
}
