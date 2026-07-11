import { LobbyStatusStrip } from './LobbyStatusStrip';
import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import introCardsStyles from '../../../styles/cards/intro-cards.module.css';

export function LobbyHero({ status, position, timeMinutes, error })
{
	const { t } = useTranslation();
	return (
		<article className={`${cardsStyles.card} ${introCardsStyles.introCard} lobby-hero`}>
			<div>
				<p className={`${introCardsStyles.sectionKicker}`}>{t('lobby.hero.kicker')}</p>
				<h2 className={`${introCardsStyles.introTitle}`}>
					{t('lobby.hero.title')}
				</h2>
				<p>
					{t('lobby.hero.copy')}
				</p>
			</div>

			<LobbyStatusStrip
				status={status}
				position={position}
				timeMinutes={timeMinutes}
			/>

			{error && (
				<p className={`${introCardsStyles.formError}`} aria-live="polite">
					{error}
				</p>
			)}
		</article>
	);
}