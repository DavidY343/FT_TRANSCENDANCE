function prettyResult(result)
{
	if (!result)
		return '-';

	return result.replaceAll('_', ' ');
}

function getResultClass(result)
{
	if (result === 'win')
		return 'history-result-win';
	if (result === 'loss')
		return 'history-result-loss';
	if (result === 'draw')
		return 'history-result-draw';

	return '';
}

function getOpponentName(game)
{
	return game.opponent?.display_name || game.opponent?.username || 'Unknown';
}

function getPlayersBySide(game)
{
	const opponent = getOpponentName(game);

	if (game.my_color === 'b' || game.my_color === 'black')
		return {
			white: opponent,
			black: 'You',
		};

	return {
		white: 'You',
		black: opponent,
	};
}

export function HistoryListCard({ games })
{
	if (games.length === 0)
		return (
			<p className="history-empty">
				No games recorded yet.
			</p>
		);

	return (
		<aside className="card panel-card history-panel">
			<h3 className="panel-title">
				Timeline
			</h3>
			<ul className="history-list">
				{games.map((game) => (
					<li key={game.id} className="history-item">
						<div className="history-row-main">
							<strong>Game #{game.id}</strong>

							<span className={`history-result ${getResultClass(game.result_for_me)}`}>
								{prettyResult(game.result_for_me)}
							</span>
						</div>

						<div className="history-sides">
							<div className="history-side history-side-white">
								<span>White</span>
								<strong>{getPlayersBySide(game).white}</strong>
							</div>

							<div className="history-side history-side-black">
								<span>Black</span>
								<strong>{getPlayersBySide(game).black}</strong>
							</div>
						</div>
					</li>
				))}
			</ul>
		</aside>
	);
}
