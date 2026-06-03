export function buildSquareStyles({ selectedSquare, legalTargets, loserKingSquare })
{
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

	if (loserKingSquare)
	{
		styles[loserKingSquare] = {
			...styles[loserKingSquare],
			boxShadow: 'inset 0 0 0 4px #dc2626',
		};
	}

	return (styles);
}
