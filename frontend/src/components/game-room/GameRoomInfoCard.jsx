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
	if (opponentDisconnectGrace || opponentOnline === false)
		opponentLabel = 'Offline';
	else if (opponentOnline === true)
		opponentLabel = 'Online';
	else
		opponentLabel = 'Checking...';

	return (
		<aside className="card intro-card game-info-card">
			<h2 className="card-title">
				Game Room #{gameId}
			</h2>

			<GameStatus room={room}/>

			<div className="game-room-info-row">
				<span>Duration: </span>
				<strong>{state?.time_control_minutes || '-'} min</strong>
			</div>
			<div className="game-room-info-row">
				<span>Opponent: </span>
				<strong>{opponentLabel}</strong>
			</div>
			{opponentDisconnectGrace && (
				<div className="game-room-info-row">
					<span>Forfeit in: </span>
					<strong>{state.disconnect_grace.seconds}s</strong>
				</div>
			)}
		</aside>
	);
}
