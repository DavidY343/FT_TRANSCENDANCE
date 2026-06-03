export function buildSquareStyles({ selectedSquare, legalTargets })
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

	return (styles);
}