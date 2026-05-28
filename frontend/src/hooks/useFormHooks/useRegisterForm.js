import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage, setTokens } from '../../api';

function validatePassword(password)
{
	if (password.length < 8)
		return 'Password must be at least 8 characters long.';

	if (!/[a-z]/.test(password))
		return 'Password must include at least one lowercase letter.';

	if (!/[A-Z]/.test(password))
		return 'Password must include at least one uppercase letter.';

	if (!/\d/.test(password))
		return 'Password must include at least one number.';

	if (!/[^A-Za-z0-9]/.test(password))
		return 'Password must include at least one special character.';

	return '';
}

export function useRegisterForm()
{
	const navigate = useNavigate();

	const [form, setForm] = useState({
		email: '',
		username: '',
		display_name: '',
		password: '',
		confirmPassword: ''
	});

	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	function updateField(field, value)
	{
		setForm({
			...form,
			[field]: value
		});
	}

	async function onSubmit(event)
	{
		let passwordError;

		event.preventDefault();

		if (submitting)
			return;

		setError('');

		passwordError = validatePassword(form.password);

		if (passwordError)
		{
			setError(passwordError);
			return;
		}

		if (form.password !== form.confirmPassword)
		{
			setError('Passwords do not match.');
			return;
		}

		setSubmitting(true);

		try
		{
			const { confirmPassword, ...registerPayload } = form;
			const response = await api.post('/auth/register', registerPayload);
			const data = response.data;

			setTokens(data.access_token, data.refresh_token);
			navigate('/lobby');
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Register failed'));
		}
		finally
		{
			setSubmitting(false);
		}
	}

	return {
		form,
		error,
		submitting,
		updateField,
		onSubmit
	};
}
