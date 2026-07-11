import { useParams } from 'react-router-dom';

import { BoardArea } from './components/BoardZone/BoardArea';
import { ChatCard } from './components/ChatCard';
import { GameRoomInfoCard } from './components/GameRoomInfoCard';
import { ErrorToast } from './components/ErrorToast';
import { ConfirmModal } from './components/ConfirmModal';
import { ResultModal } from './components/ResultModal';
import { DisconnectGraceModal } from './components/DisconnectGraceModal';

import { useRoom } from './hooks/useRoom';
import gameRoomStyles from './style/game-room.module.css';
import resultStyles from './style/result.module.css';

export default function GameRoomPage()
{
	const { gameId } = useParams();
	const room = useRoom(gameId);

	return (
		<section
			className={`${gameRoomStyles.gameRoom}${room.gameResult
				? ` ${resultStyles.gameRoomHasResult} ${resultStyles[`gameRoomResult${room.gameResult.charAt(0).toUpperCase() + room.gameResult.slice(1)}`] || ''}`
				: ''}`}
		>
			{room.gameResult && (
				<div
					className={`${resultStyles.resultBackdrop} ${resultStyles[`resultBackdrop${room.gameResult.charAt(0).toUpperCase() + room.gameResult.slice(1)}`] || ''}`}
					aria-hidden="true"
				/>
			)}
			<div className={`${gameRoomStyles.gameInfoColumn}`}>
				<GameRoomInfoCard gameId={gameId} room={room} />
				<DisconnectGraceModal room={room} />
				<ResultModal room={room} />
			</div>
			<BoardArea room={room}/>
			<ChatCard room={room} />
			<ErrorToast error={room?.moveError} />
			<ConfirmModal room={room} />
		</section>
	);
}
