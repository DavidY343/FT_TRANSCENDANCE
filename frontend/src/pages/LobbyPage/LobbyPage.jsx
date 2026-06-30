import { useEffect } from 'react';
import { ActiveGameCard } from './components/ActiveGameCard';
import { AiGameCard } from './components/AiGameCard';
import { LobbyHero } from './components/LobbyHero';
import { MatchmakingCard } from './components/MatchmakingCard';
import { useLobby } from './hooks/useLobby';


export default function LobbyPage()
{
	const lobby = useLobby();

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && lobby.confirmResignModal) {
				lobby.cancelResign();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [lobby.confirmResignModal, lobby.cancelResign]);

	return (
		<section className="lobby-layout">
			{lobby.confirmResignModal && (
				<div className="confirm-backdrop" role="dialog" aria-modal="true">
					<div className="card confirm-card">
						<p className="confirm-text">
							Resign this game? Your opponent will win.
						</p>

						<div className="confirm-actions">
							<button
								type="button"
								className="btn confirm-button"
								onClick={lobby.cancelResign}
							>
								Cancel
							</button>

							<button
								type="button"
								className="btn confirm-btn confirm-btn-danger"
								onClick={lobby.resignActiveGame}
							>
								Resign
							</button>
						</div>
					</div>
				</div>
			)}
			<LobbyHero
				status={lobby.status}
				position={lobby.position}
				timeMinutes={lobby.timeMinutes}
				error={lobby.error}
			/>

			<div className="lobby-actions-grid">
				{lobby.activeGameId ? (
					<div className="active-game-container" style={{ gridColumn: '1 / -1', maxWidth: '600px', margin: '0 auto' }}>
						<ActiveGameCard
							activeGameId={lobby.activeGameId}
							onResume={lobby.resumeActiveGame}
							onResign={lobby.requestResign}
							actionState={lobby.actionState}
						/>
					</div>
				) : (
					<>
						<MatchmakingCard
							status={lobby.status}
							timeMinutes={lobby.timeMinutes}
							setTimeMinutes={lobby.setTimeMinutes}
							onJoin={lobby.joinQueue}
							onLeave={lobby.leaveQueue}
							actionState={lobby.actionState}
						/>

						<AiGameCard
							difficulty={lobby.difficulty}
							setDifficulty={lobby.setDifficulty}
							timeMinutes={lobby.timeMinutes}
							setTimeMinutes={lobby.setTimeMinutes}
							onPlay={lobby.playVsAi}
							actionState={lobby.actionState}
						/>
					</>
				)}
			</div>
		</section>
	);
}
