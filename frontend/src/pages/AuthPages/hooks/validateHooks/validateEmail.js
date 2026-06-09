export default function validateEmail(email)
{
	const atSymbolPos = email.indexOf('@');

	if (email.length === 0)
		return ('Please fill out this field: Email');
	if (atSymbolPos < 0)
		return `Please include an '@' in the email address. '${email}' is missing an '@'.`;
	else if (atSymbolPos == 0)
		return (`Please enter a part followed by '@'. '${email}' is incomplete.`);
	else if (atSymbolPos >= email.length - 1)
		return (`Please enter a part following '@'. '${email}' is incomplete.`);
	return ('');
}
