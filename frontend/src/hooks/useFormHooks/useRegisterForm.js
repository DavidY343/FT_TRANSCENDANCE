import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getAuthErrorMessage, setTokens } from '../../api';
import validateRegisterForm from '../validateHooks/validateForm/validateRegisterForm';

export function useRegisterForm()
{
	const navigate = useNavigate();

	const [form, setForm] = useState({
		email: '',
		username: '',
		displayName: '',
		password: '',
		confirmPassword: ''
	});

	const [error, setError] = useState('');
	const [errorField, setErrorField] = useState('');
	const [submitting, setSubmitting] = useState(false);

	function updateField(field, value)
	{
		if (!errorField)
			setError('');

		if (errorField === field)
		{
			setErrorField('');
			setError('');
		}

		setForm({
			...form,
			[field]: value
		});
	}

	async function onSubmit(event)
	{
		let trimmedForm;
		let validationError;

		event.preventDefault();

		if (submitting)
			return;

		setError('');
		setErrorField('');

		trimmedForm = {
			...form,
			email: form.email.trim(),
			username: form.username.trim(),
			displayName: form.displayName.trim()
		};

		validationError = validateRegisterForm(trimmedForm);

		if (validationError)
		{
			setError(validationError.message);
			setErrorField(validationError.field);
			return;
		}


		setSubmitting(true);

		try
		{
			const { confirmPassword, ...registerPayload } = trimmedForm;
			const response = await api.post('/auth/register', registerPayload);
			const data = response.data;

			setTokens(data.access_token, data.refresh_token);
			navigate('/lobby');
		}
		catch (err)
		{
			setErrorField('');
			setError(getAuthErrorMessage(err, 'Register failed'));
		}
		finally
		{
			setSubmitting(false);
		}
	}

	return {
		form,
		error,
		errorField,
		submitting,
		updateField,
		onSubmit
	};
}
