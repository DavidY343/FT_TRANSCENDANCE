import { GameRoomBoardArea } from './GameRoomBoardArea';
import { GameRoomChatCard } from './GameRoomChatCard';
import { GameRoomInfoCard } from './GameRoomInfoCard';

export function GameRoomLayout({ gameId, room })
{
	return (
		<section className="game-room">
			<GameRoomInfoCard gameId={gameId} room={room}/>
			<GameRoomBoardArea room={room}/>
			<GameRoomChatCard />
		</section>
	)
}
