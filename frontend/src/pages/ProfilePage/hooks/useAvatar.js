import { useState } from 'react';

import { getApiErrorMessage } from '../../../api';
import { uploadProfileAvatar } from './profileApi';

export function useAvatar({ setUser, setError, setSuccess })
{
	const [uploading, setUploading] = useState(false);

	async function uploadAvatar(event)
	{
		const file = event.target.files?.[0];

		if (!file)
			return;

		const formData = new FormData();
		formData.append('file', file);

		setUploading(true);
		setError('');
		setSuccess('');

		try
		{
			const response = await uploadProfileAvatar(formData);

			setUser(response.data);
			setSuccess('Avatar updated');
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Unable to upload avatar'));
		}
		finally
		{
			setUploading(false);
			event.target.value = '';
		}
	}

	return {
		uploading,
		uploadAvatar,
	};
}