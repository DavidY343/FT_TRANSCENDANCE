import { useParams } from 'react-router-dom';

import { BoardArea } from './components/BoardZone/BoardArea';
import { ChatCard } from './components/ChatCard';
import { GameRoomInfoCard } from './components/GameRoomInfoCard';
import { ErrorToast } from './components/ErrorToast';
import { ConfirmModal } from './components/ConfirmModal';
import { ResultModal } from './components/ResultModal';
import { DisconnectGraceModal } from './components/DisconnectGraceModal';

import { useRoom } from './hooks/useRoom';
import './style/game-room.css';

export default function GameRoomPage()
{
	const { gameId } = useParams();
	const room = useRoom(gameId);

	return (
		<section
			className={`game-room${room.gameResult
				? ` game-room-has-result game-room-result-${room.gameResult}`
				: ''}`}
		>
			{room.gameResult && (
				<div
					className={`result-backdrop result-backdrop-${room.gameResult}`}
					aria-hidden="true"
				/>
			)}
			<div className="game-info-column">
				<GameRoomInfoCard gameId={gameId} room={room} />
				<DisconnectGraceModal room={room} />
				<ResultModal room={room} />
			</div>
			<BoardArea room={room}/>
			{!room?.state?.is_ai && <ChatCard room={room} />}
			<ErrorToast error={room?.moveError} />
			<ConfirmModal room={room} />
		</section>
	);
}
