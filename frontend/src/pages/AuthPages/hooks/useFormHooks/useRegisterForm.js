import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getAuthErrorMessage, setTokens } from '../../../../api';
import validateRegisterForm from '../validateHooks/validateForm/validateRegisterForm';

export function useRegisterForm()
{
	const navigate = useNavigate();

	const [form, setForm] = useState({
		email: '',
		username: '',
		display_name: '',
		password: '',
		confirm_password: ''
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
			display_name: form.display_name.trim()
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
			const { confirm_password, ...registerPayload } = trimmedForm;
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
