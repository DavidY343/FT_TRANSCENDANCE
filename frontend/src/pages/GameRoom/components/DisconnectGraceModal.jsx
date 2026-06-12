import { useDisconnectGraceCountdown } from '../hooks/useDisconnectGraceCountdown';

export function DisconnectGraceModal({ room })
{
	const disconnectGrace = room?.state?.disconnect_grace;
	const { showGrace, secondsLeft } = useDisconnectGraceCountdown(
		disconnectGrace,
		room?.me?.id,
		room?.gameResult,
	);

	if (!showGrace)
		return (null);

	return (
		<div className="result-backdrop disconnect-grace-backdrop">
			<div className="card result-card disconnect-grace-card">
				<p className="section-kicker">
					Opponent disconnected
				</p>

				<h2 className="disconnect-grace-title">
					{secondsLeft}s
				</h2>

				<p className="disconnect-grace-copy">
					Forfeit countdown
				</p>
			</div>
		</div>
	);
}
