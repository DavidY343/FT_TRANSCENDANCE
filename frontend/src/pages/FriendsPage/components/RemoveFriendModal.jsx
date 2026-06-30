import { useEffect } from 'react';

export function RemoveFriendModal({
	friend,
	actionLoading,
	onCancel,
	onConfirm,
})
{
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && friend && !actionLoading[friend.id]) {
				onCancel();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [friend, actionLoading, onCancel]);

	if (!friend)
		return null;

	const displayName = friend.display_name || friend.username || 'this friend';

	return (
		<div className="friends-modal-backdrop" role="dialog" aria-modal="true">
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
