import { validateConfirmPassword } from '../validateConfirmPassword';
import { validateDisplayName } from '../validateDisplayName';
import validateEmail from '../validateEmail';
import validatePassword from '../validatePassword';
import { validateUsername } from '../validateUsername';

export default function validateRegisterForm(form)
{
	const { email, username, displayName, password, confirmPassword } = form;

	
	const emailError = validateEmail(email.trim());

	if (emailError)
		return {
			message: emailError,
			field: 'email'
		};

	const usernameError = validateUsername(username.trim());

	if (usernameError)
		return {
			message: usernameError,
			field: 'username'
		};

	const displayNameError = validateDisplayName(displayName.trim());

	if (displayNameError)
		return {
			message: displayNameError,
			field: 'displayName'
		};

	const passwordError = validatePassword(password);

	if (passwordError)
		return {
			message: passwordError,
			field: 'password'
		};

	const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
	
	if (confirmPasswordError)
		return {
			message: confirmPasswordError,
			field: 'confirmPassword'
		};

	return null;
}
