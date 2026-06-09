import { useData } from './useData';
import { useEdit } from './useEdit';
import { useAvatar } from './useAvatar';
import { useTimedMessage } from '../../../hooks/useTimedMessage';

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
	useTimedMessage(data.error, data.setError);
	useTimedMessage(edit.success, edit.setSuccess);

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
