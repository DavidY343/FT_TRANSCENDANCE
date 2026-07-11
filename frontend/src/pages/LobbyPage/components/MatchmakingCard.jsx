import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import layoutStyles from '../../../styles/layout/layout.module.css';

export function MatchmakingCard({
	status,
	timeMinutes,
	setTimeMinutes,
	onJoin,
	onLeave,
	actionState
})
{
	const { t } = useTranslation();
	const waiting = status === 'waiting';
	const disableJoin = waiting || actionState !== 'idle';
	const disableLeave = !waiting || actionState !== 'idle';

	return (
		<article className={`${cardsStyles.card} lobby-action-card`}>
			<h3 className="lobby-card-title lobby-card-play">
				{t('lobby.matchmaking.title')}
			</h3>

			<p className="lobby-card-copy">
				{t('lobby.matchmaking.copy')}
			</p>

			<label className={`${layoutStyles.lab}`} htmlFor="matchmaking-time-control">
				{t('lobby.matchmaking.time_label')}
			</label>

			<select
				id="matchmaking-time-control"
				value={timeMinutes}
				onChange={(event) => setTimeMinutes(Number(event.target.value))}
				disabled={waiting || actionState !== 'idle'}
			>
				<option value={5}>5 {t('lobby.matchmaking.minutes')}</option>
				<option value={10}>10 {t('lobby.matchmaking.minutes')}</option>
				<option value={30}>30 {t('lobby.matchmaking.minutes')}</option>
			</select>

			<div className="lobby-card-actions">
				<button
					className={`${buttonStyles.btn}`}
					type="button"
					onClick={onJoin}
					disabled={disableJoin}
				>
					{waiting ? t('lobby.matchmaking.waiting') : t('lobby.matchmaking.join')}
				</button>

				<button
					className={`${buttonStyles.btn}`}
					type="button"
					onClick={onLeave}
					disabled={disableLeave}
				>
					{t('lobby.matchmaking.leave')}
				</button>
			</div>
		</article>
	);
}