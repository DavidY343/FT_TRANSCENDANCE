import { useTranslation } from '../../../contexts/LanguageContext';

export function ActiveGameCard({
	activeGameId,
	onResume,
	onResign,
	actionState
})
{
	const { t } = useTranslation();
	return (
		<article className="card lobby-action-card">
			<p className="section-kicker">{t('lobby.active.kicker')}</p>

			<h3 className="lobby-card-title">
				{t('lobby.active.title')}
			</h3>

			<p className="lobby-card-copy">
				{t('lobby.active.copy')}
			</p>

			<div className="lobby-card-actions">
				<button className="btn" type="button" onClick={onResume} disabled={actionState !== 'idle'}>
					{t('lobby.active.resume_btn')} #{activeGameId}
				</button>
				<button
					className="btn"
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
