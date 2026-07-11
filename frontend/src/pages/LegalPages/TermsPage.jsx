import { useTranslation } from '../../contexts/LanguageContext';
import cardsStyles from '../../styles/cards/cards.module.css';
import introCardsStyles from '../../styles/cards/intro-cards.module.css';
import legalStyles from './style/legal.module.css';

export default function TermsPage()
{
	const { t } = useTranslation();

	return (
		<section className={`${legalStyles.legalPage}`}>
			<div className={`${cardsStyles.card} ${introCardsStyles.introCard} ${legalStyles.legalCard}`}>
				<header className={`${legalStyles.legalHeader}`}>
					<p className={`${introCardsStyles.sectionKicker}`}>{t('legal.terms.kicker')}</p>
					<h1 className={`${introCardsStyles.introTitle}`}>{t('legal.terms.title')}</h1>
					<p className={`${legalStyles.legalIntro}`}>
						{t('legal.terms.intro1')}
						<strong> {t('legal.terms.intro_strong')}</strong>{t('legal.terms.intro2')}
					</p>
				</header>

				<div className={`${legalStyles.legalGrid}`}>
					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec1_title')}</h2>
						<p>{t('legal.terms.sec1_p1')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec2_title')}</h2>
						<p>{t('legal.terms.sec2_p1')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec3_title')}</h2>
						<p>{t('legal.terms.sec3_p1')}</p>
						<ul>
							<li>{t('legal.terms.sec3_li1')}</li>
							<li>{t('legal.terms.sec3_li2')}</li>
							<li>{t('legal.terms.sec3_li3')}</li>
							<li>{t('legal.terms.sec3_li4')}</li>
						</ul>
						<p>{t('legal.terms.sec3_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec4_title')}</h2>
						<p>{t('legal.terms.sec4_p1')}</p>
						<ul>
							<li><strong>{t('legal.terms.sec4_li1_strong')}</strong> {t('legal.terms.sec4_li1_text')}</li>
							<li><strong>{t('legal.terms.sec4_li2_strong')}</strong> {t('legal.terms.sec4_li2_text')}</li>
							<li><strong>{t('legal.terms.sec4_li3_strong')}</strong> {t('legal.terms.sec4_li3_text')}</li>
							<li><strong>{t('legal.terms.sec4_li4_strong')}</strong> {t('legal.terms.sec4_li4_text')}</li>
							<li><strong>{t('legal.terms.sec4_li5_strong')}</strong> {t('legal.terms.sec4_li5_text')}</li>
							<li><strong>{t('legal.terms.sec4_li6_strong')}</strong> {t('legal.terms.sec4_li6_text')}</li>
							<li><strong>{t('legal.terms.sec4_li7_strong')}</strong> {t('legal.terms.sec4_li7_text')}</li>
						</ul>
						<p>{t('legal.terms.sec4_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec5_title')}</h2>
						<p>{t('legal.terms.sec5_p1')}</p>
						<p>{t('legal.terms.sec5_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec6_title')}</h2>
						<p>{t('legal.terms.sec6_p1')}</p>
						<p>{t('legal.terms.sec6_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec7_title')}</h2>
						<p>
							{t('legal.terms.sec7_p1_1')} <strong>{t('legal.terms.sec7_p1_strong')}</strong>
							{t('legal.terms.sec7_p1_2')}
						</p>
						<p>{t('legal.terms.sec7_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec8_title')}</h2>
						<p>{t('legal.terms.sec8_p1')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec9_title')}</h2>
						<p>
							{t('legal.terms.sec9_p1_1')} <strong>{t('legal.terms.sec9_p1_strong')}</strong> {t('legal.terms.sec9_p1_2')}
						</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec10_title')}</h2>
						<p>{t('legal.terms.sec10_p1')}</p>
						<p>{t('legal.terms.sec10_p2')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec11_title')}</h2>
						<p>{t('legal.terms.sec11_p1')}</p>
					</article>

					<article className={`${legalStyles.legalItem}`}>
						<h2>{t('legal.terms.sec12_title')}</h2>
						<p>{t('legal.terms.sec12_p1')}</p>
					</article>
				</div>
			</div>
		</section>
	);
}
