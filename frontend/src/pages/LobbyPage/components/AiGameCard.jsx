import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import layoutStyles from '../../../styles/layout/layout.module.css';
import lobbyStyles from '../style/lobby.module.css';

export function AiGameCard({
	status,
	difficulty,
	setDifficulty,
	timeMinutes,
	setTimeMinutes,
	onPlay,
	actionState
})
{
	const { t } = useTranslation();
	const disableActions = status === 'waiting' || actionState !== 'idle';

	return (
		<article className={`${cardsStyles.card} ${lobbyStyles.lobbyActionCard}`}>

			<h3 className={`${lobbyStyles.lobbyCardTitle} ${lobbyStyles.lobbyCardPlay}`}>
				{t('lobby.ai.title')}
			</h3>

			<p className={`${lobbyStyles.lobbyCardCopy}`}>
				{t('lobby.ai.copy')}
			</p>

			<label className={`${layoutStyles.lab}`} htmlFor="ai-difficulty">
				{t('lobby.ai.difficulty_label')}
			</label>

			<select
				id="ai-difficulty"
				value={difficulty}
				onChange={(event) => setDifficulty(event.target.value)}
				disabled={disableActions}
			>
				<option value="easy">{t('lobby.ai.diff_easy')}</option>
				<option value="medium">{t('lobby.ai.diff_medium')}</option>
				<option value="hard">{t('lobby.ai.diff_hard')}</option>
			</select>

			<label className={`${layoutStyles.lab}`} htmlFor="ai-time-control">
				{t('lobby.ai.time_label')}
			</label>

			<select
				id="ai-time-control"
				value={timeMinutes}
				onChange={(event) => setTimeMinutes(Number(event.target.value))}
				disabled={disableActions}
			>
				<option value={5}>5 {t('lobby.ai.minutes')}</option>
				<option value={10}>10 {t('lobby.ai.minutes')}</option>
				<option value={30}>30 {t('lobby.ai.minutes')}</option>
			</select>

			<div className={`${lobbyStyles.lobbyCardActions}`}>
				<button className={`${buttonStyles.btn}`} type="button" onClick={onPlay} disabled={disableActions}>
					{t('lobby.ai.start_btn')}
				</button>
			</div>
		</article>
	);
}