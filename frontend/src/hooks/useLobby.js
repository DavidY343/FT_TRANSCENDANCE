import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api, getApiErrorMessage } from '../api';

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

	function clearPolling()
	{
		if (pollRef.current)
		{
			clearInterval(pollRef.current);
			pollRef.current = null;
		}
	}

	async function loadActiveGame()
	{
		const stored = sessionStorage.getItem('active_game_id');

		if (!stored)
		{
			setActiveGameId(null);
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
			setActiveGameId(null);
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
			setError(getApiErrorMessage(err, 'Unable to join queue'));
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
			setError(getApiErrorMessage(err, 'Unable to start AI game'));
		}
	}

	function resumeActiveGame()
	{
		if (activeGameId)
			navigate(`/games/${activeGameId}`);
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
		joinQueue,
		leaveQueue,
		playVsAi,
		resumeActiveGame
	};
}