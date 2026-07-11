import { Link, useNavigate } from 'react-router-dom';
import { useModalA11y } from '../../../hooks/useModalA11y';
import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';

export function ResultModal({ room })
{
	const { t } = useTranslation();
	const navigate = useNavigate();
	const isOpen = !!room.gameResult;
	const onClose = () => navigate('/lobby');
	const { modalRef, cancelBtnRef } = useModalA11y(isOpen, onClose);

	if (!isOpen)
		return (null);

	const resultText = {
		win: t('result.win'),
		lost: t('result.lost'),
		draw: t('result.draw'),
	}[room.gameResult];

	return (
		<div className={`${cardsStyles.card} result-card result-modal-card`} role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<h2 className={`result-title result-title-${room.gameResult}`}>
				{resultText}
			</h2>
			<Link className={`${buttonStyles.btn}`} to="/lobby" ref={cancelBtnRef}>
				{t('action.lobby')}
			</Link>
		</div>
	);
}
