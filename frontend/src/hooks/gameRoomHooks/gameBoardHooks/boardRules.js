export function isOwnPiece(piece, myColor)
{
	if (!piece)
		return (false);

	if (myColor === 'white')
		return (piece[0] === 'w');

	return (piece[0] === 'b');
}

export function isLegalMove(legalMoves, from, to, promotion = '')
{
	const move = `${from}${to}${promotion}`.toLowerCase();

	return legalMoves.map((legalMove) => legalMove.toLowerCase()).includes(move);
}

export function isLegalTarget(legalMoves, from, to)
{
	const prefix = `${from}${to}`.toLowerCase();

	return legalMoves.some((move) => (
		move.toLowerCase() === prefix
		|| (
			move.toLowerCase().startsWith(prefix)
			&& move.length === 5
		)
	));
}

export function getLegalTargets(legalMoves, selectedSquare)
{
	if (!selectedSquare)
		return ([]);

	return [...new Set(
		legalMoves
			.map((move) => move.toLowerCase())
			.filter((move) => move.startsWith(selectedSquare.toLowerCase()))
			.map((move) => move.slice(2, 4))
	)];
}
