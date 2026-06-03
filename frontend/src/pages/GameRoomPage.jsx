import { useParams } from 'react-router-dom';

import { GameRoomLayout } from '../components/game-room/GameRoomLayout';
import { useGameRoom } from '../hooks/gameRoomHooks/useGameRoom';
import TopBar from '../components/TopBar';

export default function GameRoomPage()
{
	const { gameId } = useParams();
	const room = useGameRoom(gameId);

	return (
		<GameRoomLayout gameId={gameId} room={room}/>
	);
}
