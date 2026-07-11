import { useTranslation } from '../../../../contexts/LanguageContext';
import buttonStyles from '../../../../styles/buttons/button.module.css';
import boardStyles from '../../style/board.module.css';

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
		<div className={`${boardStyles.gameRoomActions}`}>
			<button
				type="button"
				className={`${buttonStyles.btn}`}
				onClick={room.requestResign}
			>
				{t('action.resign')}
			</button>

			{!isAi && !drawOfferedBy && (
				<button
					type="button"
					className={`${buttonStyles.btn}`}
					onClick={room.offerDraw}
				>
					{t('action.offer_draw')}
				</button>
			)}

			{!isAi && hasOfferedDraw && (
				<button
					type="button"
					className={`${buttonStyles.btn}`}
					disabled
				>
					{t('action.draw_offered')}
				</button>
			)}

			{!isAi && isDrawOfferedToMe && (
				<>
					<button
						type="button"
						className={`${buttonStyles.btn}`}
						style={{ backgroundColor: '#2ecc71', color: 'white' }}
						onClick={room.acceptDraw}
					>
						{t('action.accept_draw')}
					</button>
					<button
						type="button"
						className={`${buttonStyles.btn}`}
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
