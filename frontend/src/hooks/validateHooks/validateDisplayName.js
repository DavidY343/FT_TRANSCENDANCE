export function validateDisplayName(displayName)
{
	if (displayName.trim().length === 0)
		return ('Please fill out this field: Display Name');
	return ('');
}
