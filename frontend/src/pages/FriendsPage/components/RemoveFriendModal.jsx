import { useModalA11y } from '../../../hooks/useModalA11y';
import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import friendsStyles from '../style/friends.module.css';

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
		<div className={`${friendsStyles.friendsModalBackdrop}`} role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<div
				className={`${cardsStyles.card} ${friendsStyles.friendsModalCard}`}
				aria-labelledby="remove-friend-title"
			>
				<h2 id="remove-friend-title" className={`${cardsStyles.panelTitle}`}>
					{t('friends.modal.title')}
				</h2>

				<p className={`${friendsStyles.friendsModalCopy}`}>
					{t('friends.modal.copy').replace('{name}', displayName)}
				</p>

				<div className={`${friendsStyles.friendsModalActions}`}>
					<button
						className={`${buttonStyles.btn}`}
						type="button"
						disabled={actionLoading[friend.id]}
						onClick={onCancel}
						ref={cancelBtnRef}
					>
						{t('friends.modal.cancel')}
					</button>

					<button
						className={`${buttonStyles.btn} ${friendsStyles.friendsDangerBtn}`}
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
