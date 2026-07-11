import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import introCardsStyles from '../../../styles/cards/intro-cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import lobbyStyles from '../style/lobby.module.css';

export function ActiveGameCard({
	activeGameId,
	onResume,
	onResign,
	actionState
})
{
	const { t } = useTranslation();
	return (
		<article className={`${cardsStyles.card} ${lobbyStyles.lobbyActionCard}`}>
			<p className={`${introCardsStyles.sectionKicker}`}>{t('lobby.active.kicker')}</p>

			<h3 className={`${lobbyStyles.lobbyCardTitle}`}>
				{t('lobby.active.title')}
			</h3>

			<p className={`${lobbyStyles.lobbyCardCopy}`}>
				{t('lobby.active.copy')}
			</p>

			<div className={`${lobbyStyles.lobbyCardActions}`}>
				<button className={`${buttonStyles.btn}`} type="button" onClick={onResume} disabled={actionState !== 'idle'}>
					{t('lobby.active.resume_btn')} #{activeGameId}
				</button>
				<button
					className={`${buttonStyles.btn}`}
					type="button"
					onClick={onResign}
					disabled={actionState !== 'idle'}
				>
					{actionState === 'resigning' ? t('lobby.active.resigning') : `${t('lobby.active.resign_btn')} #${activeGameId}`}
				</button>
			</div>
		</article>
	);
}
