export function AiGameCard({
	difficulty,
	setDifficulty,
	timeMinutes,
	setTimeMinutes,
	onPlay,
	actionState
})
{
	return (
		<article className="card lobby-action-card">

			<h3 className="lobby-card-title lobby-card-play">
				Play vs AI
			</h3>

			<p className="lobby-card-copy">
				Warm up with the engine and choose how sharp the room should feel.
			</p>

			<label className="lab" htmlFor="ai-difficulty">
				AI difficulty
			</label>

			<select
				id="ai-difficulty"
				value={difficulty}
				onChange={(event) => setDifficulty(event.target.value)}
				disabled={actionState !== 'idle'}
			>
				<option value="easy">Easy</option>
				<option value="medium">Medium</option>
				<option value="hard">Hard</option>
			</select>

			<label className="lab" htmlFor="ai-time-control">
				Time control
			</label>

			<select
				id="ai-time-control"
				value={timeMinutes}
				onChange={(event) => setTimeMinutes(Number(event.target.value))}
				disabled={actionState !== 'idle'}
			>
				<option value={5}>5 minutes</option>
				<option value={10}>10 minutes</option>
				<option value={30}>30 minutes</option>
			</select>

			<div className="lobby-card-actions">
				<button className="btn" type="button" onClick={onPlay} disabled={actionState !== 'idle'}>
					Start AI game
				</button>
			</div>
		</article>
	);
}