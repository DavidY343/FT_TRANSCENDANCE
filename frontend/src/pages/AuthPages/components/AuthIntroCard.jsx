import { useTranslation } from '../../../contexts/LanguageContext';

export function RegisterIntroCard()
{
	const { t } = useTranslation();
	return (
		<article className="card auth-card intro-card">
			<p className="section-kicker">
				{t('auth.intro.register.kicker')}
			</p>

			<h2 className="intro-title">
				{t('auth.intro.register.title')}
			</h2>

			<p>
				{t('auth.intro.register.body')}
			</p>

			<div className="info-note">
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
		<article className="card auth-card intro-card">
			<p className="section-kicker">
				{t('auth.intro.login.kicker')}
			</p>

			<h2 className="intro-title">
				{t('auth.intro.login.title')}
			</h2>

			<p>
				{t('auth.intro.login.body')}
			</p>

			<div className="info-note">
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
