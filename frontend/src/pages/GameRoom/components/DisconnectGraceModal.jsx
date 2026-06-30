import { useEffect } from 'react';
import { useDisconnectGraceCountdown } from '../hooks/useDisconnectGraceCountdown';

export function DisconnectGraceModal({ room })
{
	const disconnectGrace = room?.disconnectGrace;
	const { showGrace, secondsLeft } = useDisconnectGraceCountdown(
		disconnectGrace,
		room?.me?.id,
		room?.gameResult,
	);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && showGrace && room?.cancelAction) {
				room.cancelAction();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [showGrace, room]);

	if (!showGrace)
		return (null);

	return (
		<div className="card result-card disconnect-grace-card" role="dialog" aria-modal="true">
			<p className="section-kicker">
				Opponent disconnected
			</p>

			<h2 className="disconnect-grace-title">
				{secondsLeft}s
			</h2>

			<p className="disconnect-grace-copy">
				{secondsLeft > 0 ? 'Forfeit countdown' : 'Resolving result'}
			</p>
		</div>
	);
}
