export function LobbyStatusStrip({ status, position, timeMinutes })
{
	return (
		<div className="lobby-status-strip">
			<div className="lobby-status-item">
				<span>Status</span>
				<strong>{status}</strong>
			</div>

			<div className="lobby-status-item">
				<span>Queue spot</span>
				<strong>{position ?? '-'}</strong>
			</div>

			<div className="lobby-status-item">
				<span>Time control</span>
				<strong>{timeMinutes} min</strong>
			</div>
		</div>
	);
}