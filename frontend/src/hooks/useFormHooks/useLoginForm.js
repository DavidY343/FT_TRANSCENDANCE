import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage, setTokens } from '../../api';

export function useLoginForm()
{
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	async function onSubmit(event)
	{
		event.preventDefault();

		if (submitting)
			return;

		setError('');
		setSubmitting(true);

		try
		{
			const response = await api.post('/auth/login', {
				email: email,
				password: password
			});

			const data = response.data;

			setTokens(data.access_token, data.refresh_token);
			navigate('/lobby');
		}
		catch (err)
		{
			if (err.code === 'ECONNABORTED')
			{
				setError('Login timeout. Please try again.');
			}
			else if (!err.response)
			{
				setError(
					'Cannot reach server. Check that Docker is running and localhost:8080 is available.'
				);
			}
			else
			{
				setError(getApiErrorMessage(err, 'Login failed'));
			}
		}
		finally
		{
			setSubmitting(false);
		}
	}

	return {
		email,
		setEmail,
		password,
		setPassword,
		error,
		submitting,
		onSubmit
	};
}
