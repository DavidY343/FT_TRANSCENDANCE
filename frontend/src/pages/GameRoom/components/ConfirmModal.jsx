import { useModalA11y } from '../../../hooks/useModalA11y';

import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';

export function ConfirmModal({ room })
{
	const { t } = useTranslation();
	const isOpen = room.confirmAction === 'resign';
	const { modalRef, cancelBtnRef } = useModalA11y(isOpen, room.cancelAction);

	if (!isOpen)
		return (null);

	return (
		<div className="confirm-backdrop" role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<div className={`${cardsStyles.card} confirm-card`}>
				<p className="confirm-text">
					{t('confirm.resign_question')}
				</p>

				<div className="confirm-actions">
					<button
						type="button"
						className={`${buttonStyles.btn} confirm-button`}
						onClick={room.cancelAction}
						ref={cancelBtnRef}
					>
						{t('action.cancel')}
					</button>

					<button
						type="button"
						className={`${buttonStyles.btn} confirm-btn ${buttonStyles.confirmBtnDanger}`}
						onClick={room.confirmResign}
					>
						{t('action.resign')}
					</button>
				</div>
			</div>
		</div>
	);
}
