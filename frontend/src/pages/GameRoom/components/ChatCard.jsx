import { useEffect, useRef } from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import chatStyles from '../style/chat.module.css';

function getChatAuthor(chatMessage, room, t)
{
	const players = room?.state?.players;

	if (!chatMessage || !players)
		return (t('chat.player'));

	if (chatMessage.user_id === room.me?.id)
		return (t('chat.you'));

	if (chatMessage.user_id === players.white_id)
		return (
			players.white?.display_name
			|| players.white?.username
			|| t('color.white')
		);

	if (chatMessage.user_id === players.black_id)
		return (
			players.black?.display_name
			|| players.black?.username
			|| t('color.black')
		);

	return (`${t('chat.player')} #${chatMessage.user_id}`);
}

function formatChatTime(value)
{
	if (!value)
		return ('');

	const date = new Date(value);

	if (Number.isNaN(date.getTime()))
		return ('');

	return date.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function ChatCard({ room })
{
	const { t } = useTranslation();
	const messagesRef = useRef(null);
	const isAiGame = Boolean(room?.state?.is_ai);

	useEffect(() => {
		const animationId = window.requestAnimationFrame(() => {
			if (!messagesRef.current)
				return;

			messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
		});

		return () => window.cancelAnimationFrame(animationId);
	}, [room.chatMessages.length]);

	return (
		<aside className={`${cardsStyles.card} ${chatStyles.gameChatCard}`}>
			<h2 className={`${chatStyles.cardTitle}`}>
				{t('chat.title')}
			</h2>
			{isAiGame ? (
				<p className={`${chatStyles.chatUnavailable}`}>
					{t('chat.unavailable_ai')}
				</p>
			) : (
				<div className={`${chatStyles.chatTable}`}>
					<div className={`${chatStyles.chatMessages}`} ref={messagesRef}>
					{room.chatMessages.length > 0 ? (
						room.chatMessages.map((chatMessage, index) => {
							const isMine = chatMessage.user_id === room.me?.id;
							const author = getChatAuthor(chatMessage, room, t);
							const time = formatChatTime(chatMessage.at);

							return (
								<div
									className={`${chatStyles.chatMessage} ${isMine ? chatStyles.chatMessageMine : chatStyles.chatMessageRival}`}
									key={`${chatMessage.user_id}-${chatMessage.at}-${index}`}
								>
									<div className={`${chatStyles.chatMessageMeta}`}>
										{time && (
											<span className={`${chatStyles.chatMessageTime}`}>
												{time}
											</span>
										)}
									</div>

									<p className={`${chatStyles.chatMessageText}`}>
										{chatMessage.message}
									</p>
								</div>
							);
						})
					) : (
						<p className={`${chatStyles.chatEmpty}`}>
							{t('chat.empty')}
						</p>
					)}
					</div>
					<div style={{
						fontSize: '0.85rem',
						fontWeight: 'bold',
						textAlign: 'center',
						paddingBottom: '8px',
						color: room.wsStatus === 'connected' ? '#4caf50' : room.wsStatus === 'reconnecting' ? '#ff9800' : '#f44336'
					}}>
						{room.wsStatus === 'connected' ? t('status.connected') : room.wsStatus === 'reconnecting' ? t('status.reconnecting') : t('status.disconnected')}
					</div>
					<form className={`${chatStyles.chatForm}`} onSubmit={room.submitChatMessage}>
						<input
							className={`${chatStyles.chatInput}`}
							placeholder={t('chat.placeholder')}
							aria-label={t('chat.aria_label')}
							maxLength={200}
							value={room.chatMessage}
							onChange={(event) => room.setChatMessage(event.target.value)}
							disabled={room.wsStatus !== 'connected'}
						/>
						<button className={`${buttonStyles.btn}`} type="submit" disabled={room.wsStatus !== 'connected'}>
							{t('chat.send')}
						</button>
					</form>
				</div>
			)}
		</aside>
	);
}
