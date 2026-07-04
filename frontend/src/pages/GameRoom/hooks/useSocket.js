import { useEffect, useRef, useState } from 'react';

import { getAccessToken, getGameSocketUrl } from '../../../api';

function buildSocketUrl(gameId)
{
	const token = getAccessToken();

	return (`${getGameSocketUrl(gameId)}?token=${encodeURIComponent(token)}`);
}

export function useSocket({ gameId, setState, setError, setMoveError, setGameOver })
{
	const wsRef = useRef(null);
	const reconnectTimerRef = useRef(null);
	const shouldReconnectRef = useRef(true);

	const [wsStatus, setWsStatus] = useState('disconnected');

	useEffect(() => {
		if (!gameId || gameId == 'null')
			return undefined;

		shouldReconnectRef.current = true;

		function connectSocket()
		{
			if (!shouldReconnectRef.current)
				return;

			setWsStatus('connecting');

			const ws = new WebSocket(buildSocketUrl(gameId));
			wsRef.current = ws;
			window.__ACTIVE_WS__ = ws; // Expose for testing

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
				
				if (payload.type === 'PRESENCE')
				{
					setState((prev) => {
						if (!prev)
							return prev;

						return {
							...prev,
							presence:
							{
								...(prev.presence || {}),
								[payload.user_id]: payload.online,
							},
						};
					});
					return;
				}

				if (payload.type === 'DISCONNECT_GRACE')
				{
					setState((prev) => {
						if (!prev)
							return prev;

						return {
							...prev,
							disconnect_grace: payload.active ? payload : null,
						};
					});
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
					setState((prev) => ({
						...payload.state,
						presence: prev?.presence || {},
						disconnect_grace: prev?.disconnect_grace || null,
					}));
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
            
            const socketToClose = wsRef.current;
            if (socketToClose) {
                if (socketToClose.readyState === 0) {
                    socketToClose.onopen = () => {
                        socketToClose.close();
                    };
                } else {
                    socketToClose.close();
                }
            }
		};
	}, [gameId, setError, setGameOver, setMoveError, setState]);

	return {
		wsRef,
		wsStatus,
	};
}
