export function RemoveFriendModal({
	friend,
	actionLoading,
	onCancel,
	onConfirm,
})
{
	if (!friend)
		return null;

	const displayName = friend.display_name || friend.username || 'this friend';

	return (
		<div className="friends-modal-backdrop">
			<div
				className="card friends-modal-card"
				role="dialog"
				aria-modal="true"
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
						disabled={actionLoading}
						onClick={onCancel}
					>
						Cancel
					</button>

					<button
						className="btn friends-danger-btn"
						type="button"
						disabled={actionLoading}
						onClick={onConfirm}
					>
						{actionLoading ? 'Removing...' : 'Remove'}
					</button>
				</div>
			</div>
		</div>
	);
}
