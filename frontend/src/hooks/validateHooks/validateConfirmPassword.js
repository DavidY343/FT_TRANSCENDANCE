export function validateConfirmPassword(password, confirmPassword)
{
	if (confirmPassword.trim().length === 0)
		return ('Please fill out this field: Confirm Password');
	if (password !== confirmPassword)
		return ('Passwords do not match.');
	return ('');
}
