export function GameRoomShell({ loading, error, onRetry, children })
{
	if (loading)
		return (
			<p className="game-room-loading">
				Loading Page
			</p>
		);

	if (error)
	{
		return (
			<section className="card game-room-error">
				<p>{error}</p>
				<button type="button" className="btn" onClick={onRetry}>
					Retry
				</button>
			</section>
		);
	}

	return (
		<section className="card game-room-shell">
			{children}
		</section>
	);
}