import { useTranslation } from '../../../contexts/LanguageContext';
import buttonStyles from '../../../styles/buttons/button.module.css';

export function GameStatus({ room })
{
	const { t } = useTranslation();
	if (room?.loading)
	{
		return (
			<div className="game-room__status game-room__status--loading">
				<p>{t('status.loading')}</p>
			</div>
		);
	}

	if (room?.error)
	{
		return (
			<div className="game-status game-status-error">
				<p>{room.error}</p>
				<button className={`${buttonStyles.btn}`} type="button" onClick={room.reload}>
					{t('action.retry')}
				</button>
			</div>
		);
	}

	return null;
}
