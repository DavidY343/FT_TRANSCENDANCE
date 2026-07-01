import { useTranslation } from '../../../../contexts/LanguageContext';

export function Actions({ room })
{
	const { t } = useTranslation();
	return (
		<div className="game-room-actions">
			<button
				type="button"
				className="btn"
				onClick={room.requestResign}
			>
				{t('action.resign')}
			</button>
		</div>
	);
}
