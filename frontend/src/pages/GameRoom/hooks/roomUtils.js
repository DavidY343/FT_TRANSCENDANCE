export function isMyTurn(state, myColor)
{
	if (!state || state.status === 'finished')
		return (false);

	if (state.turn === 'w' && myColor === 'white')
		return (true);

	if (state.turn === 'b' && myColor === 'black')
		return (true);

	return (false);
}

export function getPlayerColor(state, me)
{
	if (!state || !me)
		return ('white');

	if (state.players?.white_id === me.id)
		return ('white');

	return ('black');
}

export function getLoserColor(gameOver)
{
	if (!gameOver)
		return (null);

	if (gameOver.result === 'white_win')
		return ('black');

	if (gameOver.result === 'black_win')
		return ('white');

	return (null);
}

export function getKingSquareFromFen(fen, color)
{
	if (!fen || !color)
		return (null);

	const board = fen.split(' ')[0];
	const rows = board.split('/');
	const king = color === 'white' ? 'K' : 'k';

	for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1)
	{
		let fileIndex = 0;

		for (const char of rows[rowIndex])
		{
			if (/\d/.test(char))
			{
				fileIndex += Number(char);
				continue;
			}

			if (char === king)
			{
				const file = String.fromCharCode('a'.charCodeAt(0) + fileIndex);
				const rank = 8 - rowIndex;

				return (`${file}${rank}`);
			}

			fileIndex += 1;
		}
	}

	return (null);
}

export function formatClock(ms)
{
	const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return (`${minutes}:${String(seconds).padStart(2, '0')}`);
}
