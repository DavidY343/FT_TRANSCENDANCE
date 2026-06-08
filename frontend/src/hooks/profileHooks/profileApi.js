import { api } from '../../api';

export function fetchProfile()
{
	return api.get('/users/me');
}

export function updateProfile(payload)
{
	return api.put('/users/me', payload);
}

export function uploadProfileAvatar(formData)
{
	return api.post('/users/me/avatar', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
}