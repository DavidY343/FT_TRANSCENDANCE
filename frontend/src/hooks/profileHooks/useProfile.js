import { useEffect } from 'react';

import { useData } from './useData';
import { useEdit } from './useEdit';
import { useAvatar } from './useAvatar';

export function useProfile()
{
	const data = useData();
	const edit = useEdit({
		user: data.user,
		setUser: data.setUser,
		setError: data.setError,
	});
	const avatar = useAvatar({
		setUser: data.setUser,
		setError: data.setError,
		setSuccess: edit.setSuccess,
	});

	useEffect(() => {
		if (!data.error)
			return undefined;

		const timeoutId = window.setTimeout(() => {
			data.setError('');
		}, 1500);

		return () => window.clearTimeout(timeoutId);
	}, [data.error, data.setError]);

	useEffect(() => {
		if (!edit.success)
			return undefined;

		const timeoutId = window.setTimeout(() => {
			edit.setSuccess('');
		}, 1500);

		return () => window.clearTimeout(timeoutId);
	}, [edit.success, edit.setSuccess]);

	return {
		user: data.user,
		loading: data.loading,
		error: data.error,
		setError: data.setError,
		loadProfile: data.loadProfile,

		displayName: edit.displayName,
		setDisplayName: edit.setDisplayName,
		saving: edit.saving,
		success: edit.success,
		setSuccess: edit.setSuccess,
		saveProfile: edit.saveProfile,

		uploading: avatar.uploading,
		uploadAvatar: avatar.uploadAvatar,
	};
}