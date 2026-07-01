import { useModalA11y } from '../../../hooks/useModalA11y';

export function RemoveFriendModal({
	friend,
	actionLoading,
	onCancel,
	onConfirm,
})
{
	const isOpen = !!friend;
	const onClose = () => {
		if (friend && !actionLoading[friend.id]) {
			onCancel();
		}
	};
	const { modalRef, cancelBtnRef } = useModalA11y(isOpen, onClose);

	if (!isOpen)
		return null;

	const displayName = friend.display_name || friend.username || 'this friend';

	return (
		<div className="friends-modal-backdrop" role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<div
				className="card friends-modal-card"
				aria-labelledby="remove-friend-title"
			>
				<h2 id="remove-friend-title" className="panel-title">
					Remove friend?
				</h2>

				<p className="friends-modal-copy">
					Remove {displayName} from your friends list?
				</p>

				<div className="friends-modal-actions">
					<button
						className="btn"
						type="button"
						disabled={actionLoading[friend.id]}
						onClick={onCancel}
						ref={cancelBtnRef}
					>
						Cancel
					</button>

					<button
						className="btn friends-danger-btn"
						type="button"
						disabled={actionLoading[friend.id]}
						onClick={onConfirm}
					>
						{actionLoading[friend.id] ? 'Removing...' : 'Remove'}
					</button>
				</div>
			</div>
		</div>
	);
}
