export function buildSquareStyles({ selectedSquare, legalTargets, checkedKingSquare, loserKingSquare })
{
	const styles = {};

	if (selectedSquare)
	{
		styles[selectedSquare] = {
			background: 'rgba(255, 218, 77, 0.6)',
		};
	}

	if (checkedKingSquare)
		styles[checkedKingSquare] = {
			background: 'rgb(239, 123, 123)',
		};

	legalTargets.forEach((square) => {
		styles[square] = {
			background: 'radial-gradient(circle, rgba(47, 139, 87, 0.65) 25%, transparent 50%)',
		};
	});

	if (loserKingSquare)
	{
		styles[loserKingSquare] = {
			...styles[loserKingSquare],
			boxShadow: 'inset 0 0 0 32px rgb(255, 0, 0)',
		};
	}

	return (styles);
}
