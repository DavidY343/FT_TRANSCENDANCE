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
					white: state?.players?.white?.display_name || state?.players?.white?.username || 'White',
					black: state?.players?.black?.display_name || state?.players?.black?.username || 'Black',
				}}
			/>

			<section className="card board-card">
				<div className="moves-strip">
					<span>
						Move
					</span>
					<strong>
						{state?.last_move || 'Opening position'}
					</strong>
				</div>

				<GameBoard room={room} />

				<GameRoomActions room={room}/>
			</section>
		</main>
	);
}
