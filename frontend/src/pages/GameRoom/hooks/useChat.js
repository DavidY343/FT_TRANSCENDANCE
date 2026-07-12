import { useState } from 'react';
import { sendChatMessage } from './gameBoardHooks/socketActions';

export function useChat({ wsRef, setError })
{
	const [chatMessage, setChatMessage] = useState('');

	async function submitChatMessage(event)
	{
		event?.preventDefault();

		if (wsRef.current?.readyState !== WebSocket.OPEN)
			return;

		try {
			const sent = await sendChatMessage({
				wsRef,
				setError,
				message: chatMessage,
			});

			if (sent)
				setChatMessage('');
		} catch (e) {
			// Capturarlo silenciosamente para evitar Unhandled Promise Rejections
		}
	}

	return {
		chatMessage,
		setChatMessage,
		submitChatMessage,
	};
}
