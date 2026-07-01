import { GameStatus } from "./GameStatus";

import { useTranslation } from '../../../contexts/LanguageContext';

export function GameRoomInfoCard({ gameId, room })
{
	const { t } = useTranslation();
	const state = room?.state;
	const players = state?.players;
	const myId = room?.me?.id;

	const opponentId = players?.white_id === myId ? players?.black_id : players?.white_id;
	const opponentOnline = state?.presence?.[opponentId];
	const opponentDisconnectGrace = (
		state?.disconnect_grace?.active
		&& state.disconnect_grace.user_id === opponentId
	);
	let opponentLabel;

	if (state?.is_ai)
		opponentLabel = t('opponent.playing_vs_ai');
	else if (opponentDisconnectGrace || opponentOnline === false)
		opponentLabel = t('opponent.offline');
	else
		opponentLabel = t('opponent.online');

	const wsStatus = room?.wsStatus;

	return (
		<aside className="card intro-card">
			<h2 className="card-title">
				{t('game.room_number')}#{gameId}
			</h2>

			{(wsStatus === 'reconnecting' || wsStatus === 'disconnected') && (
				<div role="alert" className={`ws-status-badge ws-status-${wsStatus}`} style={{
					padding: '8px',
					marginBottom: '12px',
					borderRadius: '4px',
					backgroundColor: wsStatus === 'reconnecting' ? '#f59e0b' : '#ef4444',
					color: '#fff',
					textAlign: 'center',
					fontSize: '0.9rem',
					fontWeight: '600'
				}}>
					{wsStatus === 'reconnecting' ? t('status.reconnecting') : t('status.disconnected_server')}
				</div>
			)}

			<GameStatus room={room}/>

			<div className="game-room-info-notes">
				<div className="info-note">
					<span>{t('info.duration')}</span>
					<p>{state?.time_control_minutes || '-'} {t('info.min')}</p>
				</div>
				<div className="info-note">
					<span>{t('info.opponent')}</span>
					<p> {opponentLabel} </p>
				</div>
			</div>
		</aside>
	);
}
