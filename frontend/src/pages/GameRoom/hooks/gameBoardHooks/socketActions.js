export function sendMove({ wsRef, setError, from, to, promotion = '' })
{
	const ws = wsRef.current;

	if (!ws || ws.readyState !== WebSocket.OPEN)
	{
		setError('WebSocket not connected');
		return (false);
	}

	ws.send(JSON.stringify({
		type: 'MOVE_SUBMIT',
		move: `${from}${to}${promotion}`.toLowerCase(),
		from,
		to,
		promotion,
	}));

	return (true);
}

export function sendResign({ wsRef, setError })
{
	const ws = wsRef.current;

	if (!ws || ws.readyState !== WebSocket.OPEN)
	{
		setError('WebSocket not connected');
		return (false);
	}

	ws.send(JSON.stringify({
		type: 'RESIGN',
	}));

	return (true);
}

export function sendDrawOffer({ wsRef, setError })
{
	const ws = wsRef.current;
	if (!ws || ws.readyState !== WebSocket.OPEN) { setError('WebSocket not connected'); return (false); }
	ws.send(JSON.stringify({ type: 'DRAW_OFFER' }));
	return (true);
}

export function sendDrawAccept({ wsRef, setError })
{
	const ws = wsRef.current;
	if (!ws || ws.readyState !== WebSocket.OPEN) { setError('WebSocket not connected'); return (false); }
	ws.send(JSON.stringify({ type: 'DRAW_ACCEPT' }));
	return (true);
}

export function sendDrawDecline({ wsRef, setError })
{
	const ws = wsRef.current;
	if (!ws || ws.readyState !== WebSocket.OPEN) { setError('WebSocket not connected'); return (false); }
	ws.send(JSON.stringify({ type: 'DRAW_DECLINE' }));
	return (true);
}

export function sendChatMessage({ wsRef, setError, message })
{
	const ws = wsRef.current;
	const text = String(message || '').trim();

	if (!text)
		return (false);

	if (!ws || ws.readyState !== WebSocket.OPEN)
	{
		setError('WebSocket not connected');
		return (false);
	}

	ws.send(JSON.stringify({
		type: 'CHAT_SEND',
		message: text,
	}));

	return (true);
}