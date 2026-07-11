import { useDisconnectGraceCountdown } from '../hooks/useDisconnectGraceCountdown';
import { useModalA11y } from '../../../hooks/useModalA11y';

import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import introCardsStyles from '../../../styles/cards/intro-cards.module.css';

export function DisconnectGraceModal({ room })
{
	const { t } = useTranslation();
	const disconnectGrace = room?.disconnectGrace;
	const { showGrace, secondsLeft } = useDisconnectGraceCountdown(
		disconnectGrace,
		room?.me?.id,
		room?.gameResult,
	);

	const onClose = () => {
		if (room?.cancelAction) {
			room.cancelAction();
		}
	};
	const { modalRef } = useModalA11y(showGrace, onClose);

	if (!showGrace)
		return (null);

	return (
		<div className={`${cardsStyles.card} result-card disconnect-grace-card`} role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<p className={`${introCardsStyles.sectionKicker}`}>
				{t('grace.opponent_disconnected')}
			</p>

			<h2 className="disconnect-grace-title">
				{secondsLeft}s
			</h2>

			<p className="disconnect-grace-copy">
				{secondsLeft > 0 ? t('grace.forfeit_countdown') : t('grace.resolving_result')}
			</p>
		</div>
	);
}
