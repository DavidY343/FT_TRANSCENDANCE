export function Actions({ room })
{
	return (
		<div className="game-room-actions">
			<button
				type="button"
				className="btn"
				onClick={room.requestResign}
			>
				Resign
			</button>
		</div>
	);
}
