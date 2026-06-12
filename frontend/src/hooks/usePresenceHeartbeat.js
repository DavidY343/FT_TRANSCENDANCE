import { useEffect } from 'react';

import { getAccessToken, getPresenceSocketUrl } from '../api';

export function usePresenceHeartbeat(isAuthed)
{
	useEffect(() => {
		const token = getAccessToken();

		if (!isAuthed || !token)
			return undefined;

		let ws = null;
		let heartbeatId = null;
		let reconnectId = null;
		let stopped = false;

		function connect()
		{
			if (stopped)
				return;

			ws = new WebSocket(`${getPresenceSocketUrl()}?token=${encodeURIComponent(token)}`);
			const socket = ws;

			socket.onopen = () => {
				heartbeatId = setInterval(() => {
					if (socket.readyState === WebSocket.OPEN)
						socket.send(JSON.stringify({ type: 'ping' }));
				}, 30000);
			};

			socket.onclose = () => {
				clearInterval(heartbeatId);

				if (!stopped)
					reconnectId = setTimeout(connect, 3000);
			};

			socket.onerror = () => {
				if (socket.readyState === WebSocket.OPEN)
					socket.close();
			};
		}

		connect();

		return () => {
			stopped = true;
			clearInterval(heartbeatId);
			clearTimeout(reconnectId);

			if (!ws)
				return;

			ws.onclose = null;
			ws.onerror = null;

			if (ws.readyState === WebSocket.CONNECTING)
			{
				ws.onopen = () => ws.close();
				return;
			}

			if (ws.readyState === WebSocket.OPEN)
				ws.close();
		};
	}, [isAuthed]);
}
