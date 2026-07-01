import { useEffect, useRef } from 'react';

function getChatAuthor(chatMessage, room)
{
	const players = room?.state?.players;

	if (!chatMessage || !players)
		return ('Player');

	if (chatMessage.user_id === room.me?.id)
		return ('You');

	if (chatMessage.user_id === players.white_id)
		return (
			players.white?.display_name
			|| players.white?.username
			|| 'White'
		);

	if (chatMessage.user_id === players.black_id)
		return (
			players.black?.display_name
			|| players.black?.username
			|| 'Black'
		);

	return (`Player #${chatMessage.user_id}`);
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
		<aside className="card game-chat-card">
			<h2 className="card-title">
				Chat
			</h2>
			{isAiGame ? (
				<p className="chat-unavailable">
					Chat unavailable in games against AI
				</p>
			) : (
				<div className="chat-table">
					<div className="chat-messages" ref={messagesRef}>
					{room.chatMessages.length > 0 ? (
						room.chatMessages.map((chatMessage, index) => {
							const isMine = chatMessage.user_id === room.me?.id;
							const author = getChatAuthor(chatMessage, room);
							const time = formatChatTime(chatMessage.at);

							return (
								<div
									className={`chat-message ${isMine ? 'chat-message-mine' : 'chat-message-rival'}`}
									key={`${chatMessage.user_id}-${chatMessage.at}-${index}`}
								>
									<div className="chat-message-meta">
										{time && (
											<span className="chat-message-time">
												{time}
											</span>
										)}
									</div>

									<p className="chat-message-text">
										{chatMessage.message}
									</p>
								</div>
							);
						})
					) : (
						<p className="chat-empty">
							No new messages
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
						{room.wsStatus === 'connected' ? 'Connected' : room.wsStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
					</div>
					<form className="chat-form" onSubmit={room.submitChatMessage}>
						<input
							className="chat-input"
							placeholder="Message"
							aria-label="Chat message"
							maxLength={200}
							value={room.chatMessage}
							onChange={(event) => room.setChatMessage(event.target.value)}
							disabled={room.wsStatus !== 'connected'}
						/>
						<button className="btn" type="submit" disabled={room.wsStatus !== 'connected'}>
							Send
						</button>
					</form>
				</div>
			)}
		</aside>
	);
}
