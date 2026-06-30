export function ActiveGameCard({
	activeGameId,
	onResume,
	onResign,
	actionState
})
{
	return (
		<article className="card lobby-action-card">
			<p className="section-kicker">Resume</p>

			<h3 className="lobby-card-title">
				Active game
			</h3>

			<p className="lobby-card-copy">
				You have an unfinished game. Return to the room before the clock
				gets ideas.
			</p>

			<div className="lobby-card-actions">
				<button className="btn" type="button" onClick={onResume} disabled={actionState !== 'idle'}>
					Resume game #{activeGameId}
				</button>
				<button
					className="btn"
					type="button"
					onClick={onResign}
					disabled={actionState !== 'idle'}
				>
					{actionState === 'resigning' ? 'Resigning...' : `Resign game #${activeGameId}`}
				</button>
			</div>
		</article>
	);
}
