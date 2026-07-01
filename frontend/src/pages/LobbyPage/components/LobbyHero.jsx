import { LobbyStatusStrip } from './LobbyStatusStrip';
import { useTranslation } from '../../../contexts/LanguageContext';

export function LobbyHero({ status, position, timeMinutes, error })
{
	const { t } = useTranslation();
	return (
		<article className="card intro-card lobby-hero">
			<div>
				<p className="section-kicker">{t('lobby.hero.kicker')}</p>
				<h2 className="intro-title">
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
				<p className="form-error" aria-live="polite">
					{error}
				</p>
			)}
		</article>
	);
}