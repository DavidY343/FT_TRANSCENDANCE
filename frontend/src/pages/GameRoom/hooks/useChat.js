import { useState } from 'react';
import { sendChatMessage } from './gameBoardHooks/socketActions';

export function useChat({ wsRef, setError })
{
	const [chatMessage, setChatMessage] = useState('');

	function submitChatMessage(event)
	{
		event?.preventDefault();

		const sent = sendChatMessage({
			wsRef,
			setError,
			message: chatMessage,
		});

		if (sent)
			setChatMessage('');
	}

	return {
		chatMessage,
		setChatMessage,
		submitChatMessage,
	};
}
