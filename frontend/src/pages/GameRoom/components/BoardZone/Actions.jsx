import { useTranslation } from '../../../../contexts/LanguageContext';

export function Actions({ room })
{
	const { t } = useTranslation();
	const state = room?.state;
	const isAi = state?.is_ai;
	const drawOfferedBy = state?.draw_offered_by;
	const myId = room?.me?.id;
	const isFinished = state?.status === 'finished';

	const hasOfferedDraw = drawOfferedBy === myId;
	const isDrawOfferedToMe = drawOfferedBy && drawOfferedBy !== myId;

	if (isFinished)
		return null;

	return (
		<div className="game-room-actions">
			<button
				type="button"
				className="btn"
				onClick={room.requestResign}
			>
				{t('action.resign')}
			</button>

			{!isAi && !drawOfferedBy && (
				<button
					type="button"
					className="btn"
					onClick={room.offerDraw}
				>
					{t('action.offer_draw')}
				</button>
			)}

			{!isAi && hasOfferedDraw && (
				<button
					type="button"
					className="btn"
					disabled
				>
					{t('action.draw_offered')}
				</button>
			)}

			{!isAi && isDrawOfferedToMe && (
				<>
					<button
						type="button"
						className="btn"
						style={{ backgroundColor: '#2ecc71', color: 'white' }}
						onClick={room.acceptDraw}
					>
						{t('action.accept_draw')}
					</button>
					<button
						type="button"
						className="btn"
						style={{ backgroundColor: '#e74c3c', color: 'white' }}
						onClick={room.declineDraw}
					>
						{t('action.decline_draw')}
					</button>
				</>
			)}
		</div>
	);
}
