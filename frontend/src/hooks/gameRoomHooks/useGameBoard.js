import { useMemo, useState } from 'react';
import { sendMove } from './socketActions';

function isOwnPiece(piece, myColor)
{
	if (!piece)
		return (false);

	if (myColor === 'white')
		return (piece[0] === 'w');

	return (piece[0] === 'b');
}

export function useGameBoard({ wsRef, setError, canInteractBoard, myColor, legalMoves = [] })
{
	const [selectedSquare, setSelectedSquare] = useState(null);

	const legalTargets = useMemo(() => {
		if (!selectedSquare)
			return ([]);

		return legalMoves
			.filter((move) => move.startsWith(selectedSquare))
			.map((move) => move.slice(2, 4));
	}, [legalMoves, selectedSquare]);

	const squareStyles = useMemo(() => {
		const styles = {};

		if (selectedSquare)
		{
			styles[selectedSquare] = {
				background: 'rgba(255, 218, 77, 0.6)',
			};
		}

		legalTargets.forEach((square) => {
			styles[square] = {
				background: 'radial-gradient(circle, rgba(47, 139, 87, 0.65) 25%, transparent 50%)',
			};
		});

		return (styles);
	}, [legalTargets, selectedSquare]);

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

		if (!legalTargets.includes(square))
		{
			setSelectedSquare(null);
			return;
		}

		submitMove(selectedSquare, square, '');
		setSelectedSquare(null);
	}

	return {
		selectedSquare,
		squareStyles,
		selectPiece,
		selectTarget,
		submitMove,
	};
}
