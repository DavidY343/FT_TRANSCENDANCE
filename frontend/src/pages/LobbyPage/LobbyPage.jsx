import { useEffect } from 'react';
import { ActiveGameCard } from './components/ActiveGameCard';
import { AiGameCard } from './components/AiGameCard';
import { LobbyHero } from './components/LobbyHero';
import { MatchmakingCard } from './components/MatchmakingCard';
import { useLobby } from './hooks/useLobby';
import { useModalA11y } from '../../hooks/useModalA11y';


export default function LobbyPage()
{
	const lobby = useLobby();

	const { modalRef, cancelBtnRef } = useModalA11y(lobby.confirmResignModal, lobby.cancelResign);

	return (
		<section className="lobby-layout">
			{lobby.confirmResignModal && (
				<div className="confirm-backdrop" role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
					<div className="card confirm-card">
						<p className="confirm-text">
							Resign this game? Your opponent will win.
						</p>

						<div className="confirm-actions">
							<button
								type="button"
								className="btn confirm-button"
								onClick={lobby.cancelResign}
								ref={cancelBtnRef}
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
