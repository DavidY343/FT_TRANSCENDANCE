import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api, getAccessToken, getApiErrorMessage, getGameSocketUrl } from '../../../api';
import { GAME_ROOM_EVENTS } from '../../../gameRoomContract';

export function useLobby()
{
	const navigate = useNavigate();
	const pollRef = useRef(null);

	const [status, setStatus] = useState('idle');
	const [position, setPosition] = useState(null);
	const [difficulty, setDifficulty] = useState('medium');
	const [timeMinutes, setTimeMinutes] = useState(10);
	const [error, setError] = useState('');
	const [activeGameId, setActiveGameId] = useState(null);
	const [resigning, setResigning] = useState(false);

	function clearPolling()
	{
		if (pollRef.current)
		{
			clearInterval(pollRef.current);
			pollRef.current = null;
		}
	}

	async function recoverActiveGame()
	{
		const response = await api.get('/games/history');
		const activeGame = response.data?.find((game) => (
			game.status !== 'finished'
			|| game.result_for_me === 'in_progress'
		));

		if (!activeGame)
		{
			sessionStorage.removeItem('active_game_id');
			setActiveGameId(null);
			return null;
		}

		sessionStorage.setItem('active_game_id', String(activeGame.id));
		setActiveGameId(activeGame.id);
		return activeGame.id;
	}

	async function loadActiveGame()
	{
		const stored = sessionStorage.getItem('active_game_id');

		if (!stored)
		{
			try
			{
				await recoverActiveGame();
			}
			catch (_err)
			{
				setActiveGameId(null);
			}
			return;
		}

		try
		{
			const response = await api.get(`/games/${stored}`);
			const data = response.data;

			if (data.status === 'finished')
			{
				sessionStorage.removeItem('active_game_id');
				setActiveGameId(null);
			}
			else
				setActiveGameId(Number(stored));
		}
		catch (_err)
		{
			sessionStorage.removeItem('active_game_id');
			try
			{
				await recoverActiveGame();
			}
			catch (_recoverErr)
			{
				setActiveGameId(null);
			}
		}
	}

	async function pollStatus()
	{
		try
		{
			const response = await api.get('/matchmaking/status');
			const data = response.data;

			if (data.status === 'matched' && data.game_id)
			{
				clearPolling();
				sessionStorage.setItem('active_game_id', String(data.game_id));
				navigate(`/games/${data.game_id}`);
				return;
			}

			setStatus(data.status || 'idle');
			setPosition(data.position ?? null);
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Unable to check queue status'));
		}
	}

	async function joinQueue()
	{
		setError('');

		try
		{
			const response = await api.post ( '/matchmaking/join', {
				time_minutes: timeMinutes
			});
			const data = response.data;

			if (data.status === 'matched' && data.game_id)
			{
				sessionStorage.setItem('active_game_id', String(data.game_id));
				navigate(`/games/${data.game_id}`);
				return;
			}

			setStatus(data.status || 'waiting');
			setPosition(data.position ?? null);
			clearPolling();
			pollRef.current = setInterval(pollStatus, 1500);
		}
		catch (err)
		{
			const message = getApiErrorMessage(err, 'Unable to join queue');

			if (message === 'You already have an active game in progress')
			{
				try
				{
					await recoverActiveGame();
					setError('You already have an active game. Resume or resign it first.');
				}
				catch (_recoverErr)
				{
					setError(message);
				}
				return;
			}

			setError(message);
		}
	}

	async function leaveQueue()
	{
		setError('');

		try
		{
			await api.delete('/matchmaking/leave');
			clearPolling();
			setStatus('idle');
			setPosition(null);
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Unable to leave queue'));
		}
	}

	async function playVsAi()
	{
		setError('');
		clearPolling();

		try
		{
			const response = await api.post('/games/vs-ai', {
				difficulty,
				time_minutes: timeMinutes
			});
			const data = response.data;

			sessionStorage.setItem('active_game_id', String(data.game_id));
			navigate(`/games/${data.game_id}`);
		}
		catch (err)
		{
			const message = getApiErrorMessage(err, 'Unable to start AI game');

			if (message === 'You already have an active game in progress')
			{
				try
				{
					await recoverActiveGame();
					setError('You already have an active game. Resume or resign it first.');
				}
				catch (_recoverErr)
				{
					setError(message);
				}
				return;
			}

			setError(message);
		}
	}

	function resumeActiveGame()
	{
		if (activeGameId)
			navigate(`/games/${activeGameId}`);
	}

	function sendResign(gameId)
	{
		return new Promise((resolve, reject) => {
			const token = getAccessToken();

			if (!token)
			{
				reject(new Error('You need to log in again before resigning.'));
				return;
			}

			const ws = new WebSocket(
				`${getGameSocketUrl(gameId)}?token=${encodeURIComponent(token)}`
			);
			const timeoutId = window.setTimeout(() => {
				ws.close();
				reject(new Error('Unable to confirm resignation. Please try again.'));
			}, 5000);

			ws.addEventListener('open', () => {
				ws.send(JSON.stringify({ type: GAME_ROOM_EVENTS.RESIGN }));
			});

			ws.addEventListener('message', (event) => {
				try
				{
					const payload = JSON.parse(event.data);

					if (payload.type === GAME_ROOM_EVENTS.GAME_OVER)
					{
						window.clearTimeout(timeoutId);
						ws.close();
						resolve();
					}
				}
				catch (_err)
				{
					window.clearTimeout(timeoutId);
					ws.close();
					reject(new Error('Unable to read server response.'));
				}
			});

			ws.addEventListener('error', () => {
				window.clearTimeout(timeoutId);
				reject(new Error('Unable to connect to the game room.'));
			});
		});
	}

	async function resignActiveGame()
	{
		if (!activeGameId || resigning)
			return;

		if (!window.confirm('Resign this game? Your opponent will win.'))
			return;

		setError('');
		setResigning(true);

		try
		{
			await sendResign(activeGameId);
			sessionStorage.removeItem('active_game_id');
			setActiveGameId(null);
		}
		catch (err)
		{
			setError(err.message || 'Unable to resign game');
		}
		finally
		{
			setResigning(false);
		}
	}

	useEffect(() => {
		loadActiveGame();

		return () => clearPolling();
	}, []);

	return {
		status,
		position,
		difficulty,
		setDifficulty,
		timeMinutes,
		setTimeMinutes,
		error,
		activeGameId,
		resigning,
		joinQueue,
		leaveQueue,
		playVsAi,
		resumeActiveGame,
		resignActiveGame
	};
}
