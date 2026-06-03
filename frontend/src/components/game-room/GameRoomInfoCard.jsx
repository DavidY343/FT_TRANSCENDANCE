import { GameStatus } from "./GameStatus";
import { GameRoomActions } from "./GameRoomActions";

export function GameRoomInfoCard({ gameId, room })
{
	const state = room?.state;

	return (
		<aside className="card intro-card game-info-card">
			<h2 className="card-title">
				Game Room #{gameId}
			</h2>

			<GameStatus room={room}/>
			<GameRoomActions room={room}/>

			<div className="game-room-info-row">
				<span>Duration</span>
				<strong>{state?.time_control_minutes || '-'} min</strong>
			</div>

			<div className="game-room-moves-strip">
				Last moves
			</div>

		</aside>
	);
}
