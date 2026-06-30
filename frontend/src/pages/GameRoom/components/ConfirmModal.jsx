import { useEffect } from 'react';

export function ConfirmModal({ room })
{
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && room.confirmAction === 'resign') {
				room.cancelAction();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [room]);

	if (room.confirmAction !== 'resign')
		return (null);

	return (
		<div className="confirm-backdrop" role="dialog" aria-modal="true">
			<div className="card confirm-card">
				<p className="confirm-text">
					Are you sure you want to resign?
				</p>

				<div className="confirm-actions">
					<button
						type="button"
						className="btn confirm-button"
						onClick={room.cancelAction}
					>
						Cancel
					</button>

					<button
						type="button"
						className="btn confirm-btn confirm-btn-danger"
						onClick={room.confirmResign}
					>
						Resign
					</button>
				</div>
			</div>
		</div>
	);
}
