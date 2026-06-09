import { useParams } from 'react-router-dom';

import { GameRoomBoardArea } from './components/BoardZone/GameRoomBoardArea';
import { GameRoomChatCard } from './components/GameRoomChatCard';
import { GameRoomInfoCard } from './components/GameRoomInfoCard';
import { GameRoomErrorToast } from './components/GameRoomErrorToast';
import { GameRoomConfirmModal } from './components/GameRoomConfirmModal';
import { GameRoomResultModal } from './components/GameRoomResultModal';

import { useGameRoom } from './hooks/useGameRoom';

export default function GameRoomPage()
{
	const { gameId } = useParams();
	const room = useGameRoom(gameId);

	return (
		<section className="game-room">
			<GameRoomInfoCard gameId={gameId} room={room}/>
			<GameRoomBoardArea room={room}/>
			<GameRoomChatCard room={room} />
			<GameRoomErrorToast error={room?.moveError} />
			<GameRoomConfirmModal room={room} />
			<GameRoomResultModal room={room} />
		</section>
	);
}
