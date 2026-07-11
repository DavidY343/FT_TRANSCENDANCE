import { useTranslation } from '../../../contexts/LanguageContext';
import lobbyStyles from '../style/lobby.module.css';

export function LobbyStatusStrip({ status, position, timeMinutes })
{
	const { t } = useTranslation();
	return (
		<div className={`${lobbyStyles.lobbyStatusStrip}`}>
			<div className={`${lobbyStyles.lobbyStatusItem}`}>
				<span>{t('lobby.status.status')}</span>
				<strong>{status}</strong>
			</div>

			<div className={`${lobbyStyles.lobbyStatusItem}`}>
				<span>{t('lobby.status.queue_spot')}</span>
				<strong>{position ?? '-'}</strong>
			</div>

			<div className={`${lobbyStyles.lobbyStatusItem}`}>
				<span>{t('lobby.status.time_control')}</span>
				<strong>{timeMinutes} {t('lobby.status.min')}</strong>
			</div>
		</div>
	);
}