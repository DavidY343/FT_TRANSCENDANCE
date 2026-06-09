import { useEffect, useState } from 'react';

export function useTimedMessage(message, clearMessage, duration = 1500)
{
	useEffect(() => {
		if (!message)
			return undefined;

		const timeoutId = window.setTimeout(() => {
			clearMessage('');
		}, duration);

		return () => window.clearTimeout(timeoutId);
	}, [clearMessage, duration, message]);
}

export function useScopedTimedMessage(duration = 1500)
{
	const [message, setMessage] = useState(null);

	useEffect(() => {
		if (!message)
			return undefined;

		const timeoutId = window.setTimeout(() => {
			setMessage(null);
		}, duration);

		return () => window.clearTimeout(timeoutId);
	}, [duration, message]);

	function clearMessage()
	{
		setMessage(null);
	}

	function setError(messageText, scope = null)
	{
		setMessage({ scope, type: 'error', message: messageText });
	}

	function setSuccess(messageText, scope = null)
	{
		setMessage({ scope, type: 'success', message: messageText });
	}

	function getScopedMessage(scope)
	{
		if (message?.scope !== scope)
			return null;

		return message;
	}

	return {
		message,
		setMessage,
		clearMessage,
		setError,
		setSuccess,
		getScopedMessage,
	};
}
