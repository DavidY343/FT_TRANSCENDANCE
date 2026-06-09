export function validateUsername(username)
{
	if (username.trim().length === 0)
		return ('Please fill out this field: Username');
	if (username.length < 3)
		return ('Username must be at least 3 characters long.');
	if (username.length > 80)
		return ('Username must be at most 80 characters long.');
	return ('');
}
