import { useModalA11y } from '../../../hooks/useModalA11y';

import { useTranslation } from '../../../contexts/LanguageContext';

export function ConfirmModal({ room })
{
	const { t } = useTranslation();
	const isOpen = room.confirmAction === 'resign';
	const { modalRef, cancelBtnRef } = useModalA11y(isOpen, room.cancelAction);

	if (!isOpen)
		return (null);

	return (
		<div className="confirm-backdrop" role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<div className="card confirm-card">
				<p className="confirm-text">
					{t('confirm.resign_question')}
				</p>

				<div className="confirm-actions">
					<button
						type="button"
						className="btn confirm-button"
						onClick={room.cancelAction}
						ref={cancelBtnRef}
					>
						{t('action.cancel')}
					</button>

					<button
						type="button"
						className="btn confirm-btn confirm-btn-danger"
						onClick={room.confirmResign}
					>
						{t('action.resign')}
					</button>
				</div>
			</div>
		</div>
	);
}
