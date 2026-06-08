import { useEffect, useState } from 'react';

import { getApiErrorMessage } from '../../api';
import { fetchProfile } from './profileApi';

export function useData()
{
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	async function loadProfile()
	{
		setLoading(true);
		setError('');

		try
		{
			const response = await fetchProfile();
			setUser(response.data);
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Unable to load profile'));
		}
		finally
		{
			setLoading(false);
		}
	}

	useEffect(() => {
		loadProfile();
	}, []);

	return {
		user,
		setUser,
		loading,
		error,
		setError,
		loadProfile,
	};
}