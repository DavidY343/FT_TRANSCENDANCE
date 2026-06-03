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
