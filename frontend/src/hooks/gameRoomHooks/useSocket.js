import { useEffect, useRef, useState } from 'react';

import { getWsUrl } from './gameRoomUtils';

export function useSocket({ gameId, setState, setError, setMoveError, setGameOver })
{
	const wsRef = useRef(null);
	const reconnectTimerRef = useRef(null);
	const shouldReconnectRef = useRef(true);

	const [wsStatus, setWsStatus] = useState('disconnected');

	useEffect(() => {
		if (!gameId)
			return undefined;

		shouldReconnectRef.current = true;

		function connectSocket()
		{
			if (!shouldReconnectRef.current)
				return;

			setWsStatus('connecting');

			const ws = new WebSocket(getWsUrl(gameId));
			wsRef.current = ws;

			ws.onopen = () => {
				setWsStatus('connected');
				setError('');
			};

			ws.onmessage = (event) => {
				let payload;

				try
				{
					payload = JSON.parse(event.data);
				}
				catch
				{
					return;
				}
				
				if (payload.type === 'CHAT_MESSAGE')
				{
					setState((prev) => {
						if (!prev)
							return prev;

						return {
							...prev,
							chat_messages: [
								...(prev.chat_messages || []),
								payload.payload,
							],
						};
					});
					return;
				}

				if (payload.type === 'STATE_SYNC')
				{
					setState(payload.state);
					return;
				}

				if (payload.type === 'CLOCK_TICK')
				{
					setState((prev) => {
						if (!prev)
							return prev;

						return {
							...prev,
							clocks: payload.clocks,
						};
					});
					return;
				}

				if (payload.type === 'MOVE_REJECTED')
				{
					setMoveError(payload.reason || 'Invalid move');
					return;
				}

				if (payload.type === 'GAME_OVER')
				{
					if (payload.state)
						setState(payload.state);

					setGameOver(payload);
					sessionStorage.removeItem('active_game_id');
					return;
				}

				if (payload.type === 'ERROR')
				{
					setError(payload.reason || payload.message || 'WebSocket error');
				}
			};

			ws.onerror = () => {
				setError('WebSocket connection failed');
			};

			ws.onclose = () => {
				if (!shouldReconnectRef.current)
				{
					setWsStatus('disconnected');
					return;
				}

				setWsStatus('reconnecting');
				reconnectTimerRef.current = setTimeout(connectSocket, 1500);
			};
		}

		connectSocket();

		return () => {
			shouldReconnectRef.current = false;

			if (reconnectTimerRef.current)
				clearTimeout(reconnectTimerRef.current);

			if (wsRef.current)
				wsRef.current.close();
		};
	}, [gameId, setError, setGameOver, setMoveError, setState]);

	return {
		wsRef,
		wsStatus,
	};
}
