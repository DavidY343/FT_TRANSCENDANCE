export function validateDisplayName(display_name)
{
	if (display_name.trim().length === 0)
		return ('Please fill out this field: Display Name');
	if (display_name.length < 2)
		return ('Display Name must be at least 2 characters long.');
	if (display_name.length > 120)
		return ('Display Name must be at most 120 characters long.');
	return ('');
}
