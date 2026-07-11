import { useTranslation } from '../../../../contexts/LanguageContext';
import { formatClock } from '../../hooks/roomUtils';
import clocksStyles from '../../style/clocks.module.css';
import gameRoomStyles from '../../style/game-room.module.css';

export function Clocks({ clocks, turn, players })
{
	const { t } = useTranslation();
	return (
		<div className={`${gameRoomStyles.clocksBanner}`}>
			<article className={`${clocksStyles.clock} ${clocksStyles.clockWhite} ${turn === 'w' ? clocksStyles.clockActive : ''}`}>
				<span>
					{players?.white || t('color.white')}
				</span>
				<strong>
					{formatClock(clocks?.white_ms)}
				</strong>
			</article>

			<article className={`${clocksStyles.clock} ${clocksStyles.clockBlack} ${turn === 'b' ? clocksStyles.clockActive : ''}`}>
				<span>
					{players?.black || t('color.black')}
				</span>
				<strong>
					{formatClock(clocks?.black_ms)}
				</strong>
			</article>
		</div>
	);
}
