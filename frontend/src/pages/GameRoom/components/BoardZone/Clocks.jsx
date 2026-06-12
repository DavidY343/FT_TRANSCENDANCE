import { formatClock } from '../../hooks/roomUtils';

export function Clocks({ clocks, turn, players })
{
	return (
		<div className="clocks-banner">
			<article className={`clock clock-white ${turn === 'w' ? 'clock-active' : ''}`}>
				<span>
					{players?.white || 'White'}
				</span>
				<strong>
					{formatClock(clocks?.white_ms)}
				</strong>
			</article>

			<article className={`clock clock-black ${turn === 'b' ? 'clock-active' : ''}`}>
				<span>
					{players?.black || 'Black'}
				</span>
				<strong>
					{formatClock(clocks?.black_ms)}
				</strong>
			</article>
		</div>
	);
}
