import { LobbyStatusStrip } from './LobbyStatusStrip';

export function LobbyHero({ status, position, timeMinutes, error })
{
	return (
		<article className="card intro-card lobby-hero">
			<div>
				<p className="section-kicker">Game Lobby</p>
				<h2 className="intro-title">
					Choose your table.
				</h2>
				<p>
					Join live matchmaking, start a training game against the engine,
					or resume the board you left waiting.
				</p>
			</div>

			<LobbyStatusStrip
				status={status}
				position={position}
				timeMinutes={timeMinutes}
			/>

			{error && (
				<p className="form-error" aria-live="polite">
					{error}
				</p>
			)}
		</article>
	);
}