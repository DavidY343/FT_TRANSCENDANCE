import { formatClock } from '../../hooks/gameRoomHooks/gameRoomUtils';

export function GameRoomClocks({ clocks, turn, players })
{
	return (
		<div className="clocks-banner">
			<article className={`clock ${turn === 'w' ? 'clock-active' : ''}`}>
				<span>
					{players?.white || 'White'}
				</span>
				<strong>
					{formatClock(clocks?.white_ms)}
				</strong>
			</article>

			<article className={`clock ${turn === 'b' ? 'clock-active' : ''}`}>
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
