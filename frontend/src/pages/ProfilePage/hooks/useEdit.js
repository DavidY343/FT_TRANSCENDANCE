import { useEffect, useState } from 'react';

import { getApiErrorMessage } from '../../../api';
import { validateDisplayName } from '../../AuthPages/hooks/validateHooks/validateDisplayName';
import { updateProfile } from './profileApi';

export function useEdit({ user, setUser, setError })
{
	const [displayName, setDisplayName] = useState('');
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState('');

	useEffect(() => {
		setDisplayName(user?.display_name || '');
	}, [user]);

	async function saveProfile(event)
	{
		event?.preventDefault();

		const validationError = validateDisplayName(displayName.trim());

		if (validationError)
		{
			setError(validationError);
			setSuccess('');
			return;
		}

		setSaving(true);
		setError('');
		setSuccess('');

		try
		{
			const response = await updateProfile({
				display_name: displayName.trim(),
			});

			setUser(response.data);
			setSuccess('Profile updated');
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Unable to update profile'));
		}
		finally
		{
			setSaving(false);
		}
	}

	return {
		displayName,
		setDisplayName,
		saving,
		success,
		setSuccess,
		saveProfile,
	};
}