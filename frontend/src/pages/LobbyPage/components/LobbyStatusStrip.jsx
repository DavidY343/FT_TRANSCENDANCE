import { useTranslation } from '../../../contexts/LanguageContext';

export function LobbyStatusStrip({ status, position, timeMinutes })
{
	const { t } = useTranslation();
	return (
		<div className="lobby-status-strip">
			<div className="lobby-status-item">
				<span>{t('lobby.status.status')}</span>
				<strong>{status}</strong>
			</div>

			<div className="lobby-status-item">
				<span>{t('lobby.status.queue_spot')}</span>
				<strong>{position ?? '-'}</strong>
			</div>

			<div className="lobby-status-item">
				<span>{t('lobby.status.time_control')}</span>
				<strong>{timeMinutes} {t('lobby.status.min')}</strong>
			</div>
		</div>
	);
}