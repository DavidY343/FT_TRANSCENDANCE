import { GameStatus } from "./GameStatus";

export function GameRoomInfoCard({ gameId, room })
{
	const state = room?.state;

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
		</aside>
	);
}
