import { useTranslation } from '../../../../contexts/LanguageContext';
import { formatClock } from '../../hooks/roomUtils';

export function Clocks({ clocks, turn, players })
{
	const { t } = useTranslation();
	return (
		<div className="clocks-banner">
			<article className={`clock clock-white ${turn === 'w' ? 'clock-active' : ''}`}>
				<span>
					{players?.white || t('color.white')}
				</span>
				<strong>
					{formatClock(clocks?.white_ms)}
				</strong>
			</article>

			<article className={`clock clock-black ${turn === 'b' ? 'clock-active' : ''}`}>
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
