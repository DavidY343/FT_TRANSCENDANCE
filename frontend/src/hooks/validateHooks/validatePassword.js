export default function validatePassword(password)
{
	if (password.trim().length === 0)
		return ('Please fill out this field: Password');
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

	return ('');
}
