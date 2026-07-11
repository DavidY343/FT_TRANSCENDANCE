import { useTranslation } from '../../contexts/LanguageContext';
import cardsStyles from '../../styles/cards/cards.module.css';
import introCardsStyles from '../../styles/cards/intro-cards.module.css';
import legalStyles from './style/legal.module.css';

export default function PrivacyPage()
{
	const { t } = useTranslation();

	return (
		<section className={`${legalStyles.legalPage}`}>
			<div className={`${cardsStyles.card} ${introCardsStyles.introCard} ${legalStyles.legalCard}`}>
				<header className={`${legalStyles.legalHeader}`}>
					<p className={`${introCardsStyles.sectionKicker}`}>{t('legal.privacy.kicker')}</p>
					<h1 className={`${introCardsStyles.introTitle}`}>{t('legal.privacy.title')}</h1>
					<p className={`${legalStyles.legalIntro}`}>
						{t('legal.privacy.intro1')}
						<strong> {t('legal.privacy.intro_strong')}</strong> {t('legal.privacy.intro2')}
					</p>
				</header>

				<div className={`${legalStyles.legalGrid}`}>
					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec1_title')}</h2>
						<p>{t('legal.privacy.sec1_p1')}</p>
						<ul>
							<li><strong>{t('legal.privacy.sec1_li1_strong')}</strong> {t('legal.privacy.sec1_li1_text')}</li>
							<li><strong>{t('legal.privacy.sec1_li2_strong')}</strong> {t('legal.privacy.sec1_li2_text')}</li>
							<li><strong>{t('legal.privacy.sec1_li3_strong')}</strong> {t('legal.privacy.sec1_li3_text')}</li>
							<li><strong>{t('legal.privacy.sec1_li4_strong')}</strong> {t('legal.privacy.sec1_li4_text')}</li>
						</ul>
						<p>
							{t('legal.privacy.sec1_p2_1')} <strong>{t('legal.privacy.not')}</strong> {t('legal.privacy.sec1_p2_2')}
						</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec2_title')}</h2>
						<p>{t('legal.privacy.sec2_p1')}</p>
						<ul>
							<li>{t('legal.privacy.sec2_li1')}</li>
							<li>{t('legal.privacy.sec2_li2')}</li>
							<li>{t('legal.privacy.sec2_li3')}</li>
							<li>{t('legal.privacy.sec2_li4')}</li>
							<li>{t('legal.privacy.sec2_li5')}</li>
						</ul>
						<p>
							{t('legal.privacy.sec2_p2_1')} <strong>{t('legal.privacy.not')}</strong> {t('legal.privacy.sec2_p2_2')}
						</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec3_title')}</h2>
						<p>{t('legal.privacy.sec3_p1')}</p>
						<p>{t('legal.privacy.sec3_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec4_title')}</h2>
						<p>
							{t('legal.privacy.sec4_p1_1')} <strong>{t('legal.privacy.not')}</strong> {t('legal.privacy.sec4_p1_2')}
							<code>sessionStorage</code>{t('legal.privacy.sec4_p1_3')}
						</p>
						<p>{t('legal.privacy.sec4_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec5_title')}</h2>
						<p>{t('legal.privacy.sec5_p1')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec6_title')}</h2>
						<p>{t('legal.privacy.sec6_p1')}</p>
						<ul>
							<li><strong>{t('legal.privacy.sec6_li1_strong')}</strong> {t('legal.privacy.sec6_li1_text')}</li>
							<li><strong>{t('legal.privacy.sec6_li2_strong')}</strong> {t('legal.privacy.sec6_li2_text')}</li>
							<li><strong>{t('legal.privacy.sec6_li3_strong')}</strong> {t('legal.privacy.sec6_li3_text')}</li>
						</ul>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec7_title')}</h2>
						<p>{t('legal.privacy.sec7_p1')}</p>
						<ul>
							<li>{t('legal.privacy.sec7_li1')}</li>
							<li>{t('legal.privacy.sec7_li2')}</li>
							<li>{t('legal.privacy.sec7_li3')}</li>
							<li>{t('legal.privacy.sec7_li4')}</li>
						</ul>
						<p>{t('legal.privacy.sec7_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec8_title')}</h2>
						<p>{t('legal.privacy.sec8_p1')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec9_title')}</h2>
						<p>{t('legal.privacy.sec9_p1')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.privacy.sec10_title')}</h2>
						<p>{t('legal.privacy.sec10_p1')}</p>
					</article>
				</div>
			</div>
		</section>
	);
}
