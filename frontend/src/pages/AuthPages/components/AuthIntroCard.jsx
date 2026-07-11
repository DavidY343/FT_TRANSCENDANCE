import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import introCardsStyles from '../../../styles/cards/intro-cards.module.css';

export function RegisterIntroCard()
{
	const { t } = useTranslation();
	return (
		<article className={`${cardsStyles.card} ${cardsStyles.authCard} ${introCardsStyles.introCard}`}>
			<p className={`${introCardsStyles.sectionKicker}`}>
				{t('auth.intro.register.kicker')}
			</p>

			<h2 className={`${introCardsStyles.introTitle}`}>
				{t('auth.intro.register.title')}
			</h2>

			<p>
				{t('auth.intro.register.body')}
			</p>

			<div className={`${introCardsStyles.infoNote}`}>
				<span>
					{t('auth.intro.register.noteTitle')}
				</span>

				<p>
					{t('auth.intro.register.noteBody')}
				</p>
			</div>
		</article>
	);
}

export function LoginIntroCard()
{
	const { t } = useTranslation();
	return (
		<article className={`${cardsStyles.card} ${cardsStyles.authCard} ${introCardsStyles.introCard}`}>
			<p className={`${introCardsStyles.sectionKicker}`}>
				{t('auth.intro.login.kicker')}
			</p>

			<h2 className={`${introCardsStyles.introTitle}`}>
				{t('auth.intro.login.title')}
			</h2>

			<p>
				{t('auth.intro.login.body')}
			</p>

			<div className={`${introCardsStyles.infoNote}`}>
				<span>
					{t('auth.intro.login.noteTitle')}
				</span>

				<p>
					{t('auth.intro.login.noteBody')}
				</p>
			</div>
		</article>
	);
}
