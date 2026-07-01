import { useModalA11y } from '../../../hooks/useModalA11y';
import { useTranslation } from '../../../contexts/LanguageContext';

export function RemoveFriendModal({
	friend,
	actionLoading,
	onCancel,
	onConfirm,
})
{
	const { t } = useTranslation();
	const isOpen = !!friend;
	const onClose = () => {
		if (friend && !actionLoading[friend.id]) {
			onCancel();
		}
	};
	const { modalRef, cancelBtnRef } = useModalA11y(isOpen, onClose);

	if (!isOpen)
		return null;

	const displayName = friend.display_name || friend.username || t('friends.modal.default_friend');

	return (
		<div className="friends-modal-backdrop" role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<div
				className="card friends-modal-card"
				aria-labelledby="remove-friend-title"
			>
				<h2 id="remove-friend-title" className="panel-title">
					{t('friends.modal.title')}
				</h2>

				<p className="friends-modal-copy">
					{t('friends.modal.copy').replace('{name}', displayName)}
				</p>

				<div className="friends-modal-actions">
					<button
						className="btn"
						type="button"
						disabled={actionLoading[friend.id]}
						onClick={onCancel}
						ref={cancelBtnRef}
					>
						{t('friends.modal.cancel')}
					</button>

					<button
						className="btn friends-danger-btn"
						type="button"
						disabled={actionLoading[friend.id]}
						onClick={onConfirm}
					>
						{actionLoading[friend.id] ? t('friends.modal.removing') : t('friends.modal.remove')}
					</button>
				</div>
			</div>
		</div>
	);
}
