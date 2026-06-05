import { useEffect, useRef } from 'react';

export function GameRoomChatCard({ room })
{
	const messagesRef = useRef(null);

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
			<div className="chat-table">
				<div className="chat-messages" ref={messagesRef}>
					{room.chatMessages.length > 0 ? (
						room.chatMessages.map((chatMessage, index) => {
							const isMine = chatMessage.user_id === room.me?.id;

							return (
								<div
									className={`chat-message ${isMine ? 'chat-message-mine' : 'chat-message-rival'}`}
									key={`${chatMessage.user_id}-${chatMessage.at}-${index}`}
								>
									<span className="chat-message-user">
										{isMine ? 'You' : `Player #${chatMessage.user_id}`}
									</span>

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
				<form className="chat-form" onSubmit={room.submitChatMessage}>
					<input
						className="chat-input"
						placeholder="Message"
						value={room.chatMessage}
						onChange={(event) => room.setChatMessage(event.target.value)}
					/>
					<button className="btn" type="submit">Send</button>
				</form>
			</div>
		</aside>
	);
}
