export function GameStatus({ room })
{
	if (room?.loading)
	{
		return (
			<div className="game-room__status game-room__status--loading">
				<p>Loading...</p>
			</div>
		);
	}

	if (room?.error)
	{
		return (
			<div className="game-status game-status-error">
				<p>{room.error}</p>
				<button className="btn" type="button" onClick={room.reload}>
					Retry
				</button>
			</div>
		);
	}

	return null;
}