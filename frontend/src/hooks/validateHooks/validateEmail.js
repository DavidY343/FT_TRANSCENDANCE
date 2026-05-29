function hasTextAroundChar(str, char)
{
	const index = str.indexOf(char);

	if (index < 0)
		return 1;

	if (index >= str.length - 1)
		return 2;

	return 0;
}

export default function validateEmail(email)
{
	const atSymbolPos = email.indexOf('@');

	if (atSymbolPos < 0)
		return `Please include an '@' in the email adrress. '${email}' is missing a '@'.`
	else if (atSymbolPos == 0)
		return (`Please enter a part followed by '@'. '${email}' is incomplete.`);
	else if (atSymbolPos >= email.length - 1)
		return (`Please enter a part following by '@'. '${email}' is incomplete.`);
	return ('');
}
