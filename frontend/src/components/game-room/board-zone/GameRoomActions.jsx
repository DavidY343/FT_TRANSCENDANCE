export function GameRoomActions({ room })
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
			<button
				type="button"
				className="btn"
			>
				Draw
			</button>
		</div>
	);
}
