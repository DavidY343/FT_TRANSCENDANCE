export function MatchmakingCard({
	status,
	timeMinutes,
	setTimeMinutes,
	onJoin,
	onLeave,
	actionState
})
{
	const waiting = status === 'waiting';
	const disableJoin = waiting || actionState !== 'idle';
	const disableLeave = !waiting || actionState !== 'idle';

	return (
		<article className="card lobby-action-card">
			<h3 className="lobby-card-title lobby-card-play">
				Play 1v1
			</h3>

			<p className="lobby-card-copy">
				Enter the queue and move into a real-time room when a rival appears.
			</p>

			<label className="lab" htmlFor="matchmaking-time-control">
				Time control
			</label>

			<select
				id="matchmaking-time-control"
				value={timeMinutes}
				onChange={(event) => setTimeMinutes(Number(event.target.value))}
				disabled={waiting || actionState !== 'idle'}
			>
				<option value={5}>5 minutes</option>
				<option value={10}>10 minutes</option>
				<option value={30}>30 minutes</option>
			</select>

			<div className="lobby-card-actions">
				<button
					className="btn"
					type="button"
					onClick={onJoin}
					disabled={disableJoin}
				>
					{waiting ? 'Waiting...' : 'Join matchmaking'}
				</button>

				<button
					className="btn"
					type="button"
					onClick={onLeave}
					disabled={disableLeave}
				>
					Leave queue
				</button>
			</div>
		</article>
	);
}