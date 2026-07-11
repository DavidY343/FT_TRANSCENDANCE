import { useModalA11y } from '../../../hooks/useModalA11y';

import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import confirmStyles from '../style/confirm.module.css';

export function ConfirmModal({
	room,
	isOpen,
	questionKey,
	confirmLabelKey,
	onCancel,
	onConfirm,
	danger,
	warning
})
{
	const { t } = useTranslation();
	const roomActions = {
		resign: {
			questionKey: 'confirm.resign_question',
			confirmLabelKey: 'action.resign',
			onConfirm: room?.confirmResign,
			danger: true,
			warning: false,
		},
		draw: {
			questionKey: 'confirm.draw_question',
			confirmLabelKey: 'action.offer_draw',
			onConfirm: room?.confirmDrawOffer,
			danger: false,
			warning: true,
		},
	};
	const roomAction = roomActions[room?.confirmAction];
	const modalIsOpen = isOpen ?? Boolean(roomAction);
	const cancelAction = onCancel || room?.cancelAction;
	const confirmAction = onConfirm || roomAction?.onConfirm;
	const modalQuestionKey = questionKey || roomAction?.questionKey;
	const modalConfirmLabelKey = confirmLabelKey || roomAction?.confirmLabelKey;
	const isDanger = danger ?? roomAction?.danger;
	const isWarning = warning ?? roomAction?.warning;
	const confirmButtonClassName = `${buttonStyles.btn} confirm-btn${isDanger ? ` ${buttonStyles.confirmBtnDanger}` : isWarning ? ` ${buttonStyles.confirmBtnWarning}` : ''}` ;
	const { modalRef, cancelBtnRef } = useModalA11y(modalIsOpen, cancelAction);

	if (!modalIsOpen)
		return (null);

	return (
		<div className={`${confirmStyles.confirmBackdrop}`} role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<div className={`${cardsStyles.card} ${confirmStyles.confirmCard}`}>
				<p className="confirm-text">
					{t(modalQuestionKey)}
				</p>

				<div className={`${confirmStyles.confirmActions}`}>
					<button
						type="button"
						className={`${buttonStyles.btn} confirm-button`}
						onClick={cancelAction}
						ref={cancelBtnRef}
					>
						{t('action.cancel')}
					</button>

					<button
						type="button"
						className={confirmButtonClassName}
						onClick={confirmAction}
					>
						{t(modalConfirmLabelKey)}
					</button>
				</div>
			</div>
		</div>
	);
}
