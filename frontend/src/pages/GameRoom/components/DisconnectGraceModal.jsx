import { useDisconnectGraceCountdown } from '../hooks/useDisconnectGraceCountdown';
import { useModalA11y } from '../../../hooks/useModalA11y';

export function DisconnectGraceModal({ room })
{
	const disconnectGrace = room?.disconnectGrace;
	const { showGrace, secondsLeft } = useDisconnectGraceCountdown(
		disconnectGrace,
		room?.me?.id,
		room?.gameResult,
	);

	const onClose = () => {
		if (room?.cancelAction) {
			room.cancelAction();
		}
	};
	const { modalRef } = useModalA11y(showGrace, onClose);

	if (!showGrace)
		return (null);

	return (
		<div className="card result-card disconnect-grace-card" role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
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
