import { useTranslation } from '../../../contexts/LanguageContext';

export function AiGameCard({
	difficulty,
	setDifficulty,
	timeMinutes,
	setTimeMinutes,
	onPlay,
	actionState
})
{
	const { t } = useTranslation();
	return (
		<article className="card lobby-action-card">

			<h3 className="lobby-card-title lobby-card-play">
				{t('lobby.ai.title')}
			</h3>

			<p className="lobby-card-copy">
				{t('lobby.ai.copy')}
			</p>

			<label className="lab" htmlFor="ai-difficulty">
				{t('lobby.ai.difficulty_label')}
			</label>

			<select
				id="ai-difficulty"
				value={difficulty}
				onChange={(event) => setDifficulty(event.target.value)}
				disabled={actionState !== 'idle'}
			>
				<option value="easy">{t('lobby.ai.diff_easy')}</option>
				<option value="medium">{t('lobby.ai.diff_medium')}</option>
				<option value="hard">{t('lobby.ai.diff_hard')}</option>
			</select>

			<label className="lab" htmlFor="ai-time-control">
				{t('lobby.ai.time_label')}
			</label>

			<select
				id="ai-time-control"
				value={timeMinutes}
				onChange={(event) => setTimeMinutes(Number(event.target.value))}
				disabled={actionState !== 'idle'}
			>
				<option value={5}>5 {t('lobby.ai.minutes')}</option>
				<option value={10}>10 {t('lobby.ai.minutes')}</option>
				<option value={30}>30 {t('lobby.ai.minutes')}</option>
			</select>

			<div className="lobby-card-actions">
				<button className="btn" type="button" onClick={onPlay} disabled={actionState !== 'idle'}>
					{t('lobby.ai.start_btn')}
				</button>
			</div>
		</article>
	);
}