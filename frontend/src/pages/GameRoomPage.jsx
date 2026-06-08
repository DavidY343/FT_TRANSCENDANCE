import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { GameRoomLayout } from '../components/game-room/GameRoomLayout';
import { useGameRoom } from '../hooks/gameRoomHooks/useGameRoom';

export default function GameRoomPage()
{
	const { gameId } = useParams();
	const navigate = useNavigate();
	const room = useGameRoom(gameId);

	useEffect(() => {
		if (room.state?.status !== 'finished' || room.gameOver)
			return undefined;

		const timeoutId = window.setTimeout(() => {
			if (!room.gameOver)
				navigate('/lobby', { replace: true });
		}, 200);

		return () => window.clearTimeout(timeoutId);
	}, [room.state?.status, room.gameOver, navigate]);

	return (
		<GameRoomLayout gameId={gameId} room={room}/>
	);
}