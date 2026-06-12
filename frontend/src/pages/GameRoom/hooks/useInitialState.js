import { useCallback, useEffect, useState } from 'react';

import { api, getApiErrorMessage } from '../../../api';

export function useInitialState(gameId)
{
	const [state, setState] = useState(null);
	const [me, setMe] = useState(null);
	const [initialGame, setInitialGame] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const loadState = useCallback(async () => {
		if (!gameId)
			return;

		setLoading(true);
		setError('');

		try
		{
			const [{ data: stateData }, { data: meData }, { data: gameData }] = await Promise.all([
				api.get(`/games/${gameId}/state`),
				api.get('/users/me'),
				api.get(`/games/${gameId}`),
			]);

			setState(stateData);
			setMe(meData);
			setInitialGame(gameData);
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Unable to load game state'));
		}
		finally
		{
			setLoading(false);
		}
	}, [gameId]);

	useEffect(() => {
		loadState();
	}, [loadState]);

	return {
		state,
		setState,
		me,
		initialGame,
		loading,
		error,
		setError,
		reload: loadState,
	};
}
