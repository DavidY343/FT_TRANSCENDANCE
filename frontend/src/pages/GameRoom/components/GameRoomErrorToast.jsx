export function GameRoomErrorToast({ error })
{
	if (!error)
		return null;

	return (
		<div className="game-room-error-toast" role="status" aria-live="polite">
			{error}
		</div>
	);
}