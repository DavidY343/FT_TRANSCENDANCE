import { GameRoomBoardArea } from './board-zone/GameRoomBoardArea';
import { GameRoomChatCard } from './GameRoomChatCard';
import { GameRoomInfoCard } from './GameRoomInfoCard';
import { GameRoomErrorToast } from './GameRoomErrorToast';
import { GameRoomConfirmModal } from './GameRoomConfirmModal';
import { GameRoomResultModal } from './GameRoomResultModal';

export function GameRoomLayout({ gameId, room })
{
	return (
		<section className="game-room">
			<GameRoomInfoCard gameId={gameId} room={room}/>
			<GameRoomBoardArea room={room}/>
			<GameRoomChatCard room={room} />
			<GameRoomErrorToast error={room?.moveError} />
			<GameRoomConfirmModal room={room} />
			<GameRoomResultModal room={room} />
		</section>
	)
}
