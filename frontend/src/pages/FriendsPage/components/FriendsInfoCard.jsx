import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import introCardsStyles from '../../../styles/cards/intro-cards.module.css';

export function FriendsInfoCard()
{
	const { t } = useTranslation();

	return (
		<article className={`${cardsStyles.card} ${introCardsStyles.introCard}`}>
			<p className={`${introCardsStyles.sectionKicker}`}>
				{t('friends.info.kicker')}
			</p>
			<h2 className={`${introCardsStyles.introTitle}`}>
				{t('friends.info.title')}
			</h2>
			<p>
				{t('friends.info.description')}
			</p>

			<div className={`${introCardsStyles.infoNote}`}>
				<span>
					{t('friends.info.note_title')}
				</span>

				<p>
					{t('friends.info.note_desc')}
				</p>
			</div>
		</article>
	);
}
