import { GameBoard } from "./GameBoard";
import { GameRoomActions } from "./GameRoomActions";
import { GameRoomClocks } from "./GameRoomClocks";

export function GameRoomBoardArea({ room })
{
	const state = room?.state;

	return (
		<main className="game-board-area">
			<GameRoomClocks
				clocks={state?.clocks}
				turn={state?.turn}
				players={{
					white: state?.players?.white_id ? `Player #${state.players.white_id}` : `White`,
					black: state?.players?.black_id ? `Player #${state.players.black_id}` : `Black`,
				}}
			/>

			<section className="card board-card">
				<div className="moves-strip">
					<span>
						Last moves | 
					</span>
					<strong>
						movement
					</strong>
				</div>

				<GameBoard room={room} />

				<GameRoomActions room={room}/>
			</section>
		</main>
	);
}
