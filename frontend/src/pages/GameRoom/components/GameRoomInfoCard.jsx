import { GameStatus } from "./GameStatus";

export function GameRoomInfoCard({ gameId, room })
{
	const state = room?.state;
	const players = state?.players;
	const myId = room?.me?.id;

	const opponentId = players?.white_id === myId ? players?.black_id : players?.white_id;
	const opponentOnline = state?.presence?.[opponentId];
	const opponentDisconnectGrace = (
		state?.disconnect_grace?.active
		&& state.disconnect_grace.user_id === opponentId
	);
	let opponentLabel;

	if (state?.is_ai)
		opponentLabel = 'Playing vs AI';
	else if (opponentDisconnectGrace || opponentOnline === false)
		opponentLabel = 'Offline';
	else
		opponentLabel = 'Online';

	const wsStatus = room?.wsStatus;

	return (
		<aside className="card intro-card">
			<h2 className="card-title">
				Game Room #{gameId}
			</h2>

			{(wsStatus === 'reconnecting' || wsStatus === 'disconnected') && (
				<div className={`ws-status-badge ws-status-${wsStatus}`} style={{
					padding: '8px',
					marginBottom: '12px',
					borderRadius: '4px',
					backgroundColor: wsStatus === 'reconnecting' ? '#f59e0b' : '#ef4444',
					color: '#fff',
					textAlign: 'center',
					fontSize: '0.9rem',
					fontWeight: '600'
				}}>
					{wsStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected from server'}
				</div>
			)}

			<GameStatus room={room}/>

			<div className="game-room-info-notes">
				<div className="info-note">
					<span>Duration: </span>
					<p>{state?.time_control_minutes || '-'} min</p>
				</div>
				<div className="info-note">
					<span>Opponent: </span>
					<p> {opponentLabel} </p>
				</div>
			</div>
		</aside>
	);
}
