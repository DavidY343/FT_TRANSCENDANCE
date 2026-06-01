import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getAuthErrorMessage, setTokens } from '../../api';

import validateEmail from '../validateHooks/validateEmail';

export function useLoginForm()
{
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [errorField, setErrorField] = useState('');
	const [submitting, setSubmitting] = useState(false);

	function updateEmail(value)
	{
		if (!errorField)
			setError('');

		if (errorField === 'email')
		{
			setErrorField('');
			setError('');
		}

		setEmail(value);
	}

	function updatePassword(value)
	{
		if (!errorField)
			setError('');

		if (errorField === 'password')
		{
			setErrorField('');
			setError('');
		}

		setPassword(value);
	}

	async function onSubmit(event)
	{
		event.preventDefault();

		if (submitting)
			return;

		setError('');
		setErrorField('');

		const trimmedEmail = email.trim();
		let emailError;

		emailError = validateEmail(trimmedEmail);

		if (emailError)
		{
			setError(emailError);
			setErrorField('email');
			return;
		}

		if (password.trim().length === 0)
		{
			setError('Please fill out this field: Password');
			setErrorField('password');
			return;
		}

		setSubmitting(true);

		try
		{
			const response = await api.post('/auth/login', {
				email: trimmedEmail,
				password: password
			});

			const data = response.data;

			setTokens(data.access_token, data.refresh_token);
			navigate('/lobby');
		}
		catch (err)
		{
			setErrorField('');
			setError(getAuthErrorMessage(err, 'Login failed'));
		}
		finally
		{
			setSubmitting(false);
		}
	}

	return {
		email,
		setEmail: updateEmail,
		password,
		setPassword: updatePassword,
		error,
		errorField,
		submitting,
		onSubmit
	};
}
