import { useModalA11y } from '../../../hooks/useModalA11y';

export function ConfirmModal({ room })
{
	const isOpen = room.confirmAction === 'resign';
	const { modalRef, cancelBtnRef } = useModalA11y(isOpen, room.cancelAction);

	if (!isOpen)
		return (null);

	return (
		<div className="confirm-backdrop" role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<div className="card confirm-card">
				<p className="confirm-text">
					Are you sure you want to resign?
				</p>

				<div className="confirm-actions">
					<button
						type="button"
						className="btn confirm-button"
						onClick={room.cancelAction}
						ref={cancelBtnRef}
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
