export function validateUsername(username)
{
	if (username.trim().length === 0)
		return ('Please fill out this field: Username');
	return ('');
}
