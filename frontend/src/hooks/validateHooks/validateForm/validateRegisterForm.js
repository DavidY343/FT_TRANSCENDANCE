import { validateConfirmPassword } from '../validateConfirmPassword';
import { validateDisplayName } from '../validateDisplayName';
import validateEmail from '../validateEmail';
import validatePassword from '../validatePassword';
import { validateUsername } from '../validateUsername';

export default function validateRegisterForm(form)
{
	const { email, username, display_name, password, confirm_password } = form;

	
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

	const display_nameError = validateDisplayName(display_name.trim());

	if (display_nameError)
		return {
			message: display_nameError,
			field: 'display_name'
		};

	const passwordError = validatePassword(password);

	if (passwordError)
		return {
			message: passwordError,
			field: 'password'
		};

	const confirm_passwordError = validateConfirmPassword(password, confirm_password);
	
	if (confirm_passwordError)
		return {
			message: confirm_passwordError,
			field: 'confirm_password'
		};

	return null;
}
