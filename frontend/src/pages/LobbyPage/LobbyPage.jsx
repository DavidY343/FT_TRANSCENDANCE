import { ActiveGameCard } from './components/ActiveGameCard';
import { AiGameCard } from './components/AiGameCard';
import { LobbyHero } from './components/LobbyHero';
import { MatchmakingCard } from './components/MatchmakingCard';
import { useLobby } from './hooks/useLobby';


export default function LobbyPage()
{
	const lobby = useLobby();

	return (
		<section className="lobby-layout">
			<LobbyHero
				status={lobby.status}
				position={lobby.position}
				timeMinutes={lobby.timeMinutes}
				error={lobby.error}
			/>

			<div className="lobby-actions-grid">
				{lobby.activeGameId && (
					<ActiveGameCard
						activeGameId={lobby.activeGameId}
						onResume={lobby.resumeActiveGame}
						onResign={lobby.resignActiveGame}
						resigning={lobby.resigning}
					/>
				)}

				<MatchmakingCard
					status={lobby.status}
					timeMinutes={lobby.timeMinutes}
					setTimeMinutes={lobby.setTimeMinutes}
					onJoin={lobby.joinQueue}
					onLeave={lobby.leaveQueue}
				/>

				<AiGameCard
					difficulty={lobby.difficulty}
					setDifficulty={lobby.setDifficulty}
					timeMinutes={lobby.timeMinutes}
					setTimeMinutes={lobby.setTimeMinutes}
					onPlay={lobby.playVsAi}
				/>
			</div>
		</section>
	);
}
