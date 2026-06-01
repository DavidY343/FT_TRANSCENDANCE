export function validateConfirmPassword(password, confirm_password)
{
	if (confirm_password.trim().length === 0)
		return ('Please fill out this field: Confirm Password');
	if (password !== confirm_password)
		return ('Passwords do not match.');
	return ('');
}
