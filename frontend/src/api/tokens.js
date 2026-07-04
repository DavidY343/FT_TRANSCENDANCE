/*
	ACCESS_TOKEN_KEY → Clave usada para almacenar el access token.
	REFRESH_TOKEN_KEY → Clave usada para almacenar el refresh token.
*/
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/*
	readToken → Busca un token en el almacenamiento del navegador.

	key → Nombre del token que se quiere obtener.
	
	localStorage.getItem(key) → Lee el token almacenado.
	sessionStorage.getItem(key) → Busca tokens guardados por la implementación antigua.

	Return
	localValue → Si el token ya está en localStorage.
	sessionValue → Si se ha recuperado desde sessionStorage (migración).
	'' → Si no existe ningún token.
*/
function readToken(key)
{
	const localValue = localStorage.getItem(key);

	if (localValue)
		return localValue;

	const sessionValue = sessionStorage.getItem(key);

	if (sessionValue)
	{
		localStorage.setItem(key, sessionValue);
		sessionStorage.removeItem(key);
		return sessionValue;
	}

	return '';
}

/*
	setTokens → Guarda los tokens de autenticación en el navegador.

	accessToken → Token utilizado para autorizar las peticiones.
	refreshToken → Token utilizado para renovar la sesión.

	localStorage.setItem(...) → Guarda los tokens de forma persistente.
*/
export function setTokens(accessToken, refreshToken)
{
	localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

	sessionStorage.removeItem(ACCESS_TOKEN_KEY);
	sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

/*
	getAccessToken → Obtiene el access token almacenado.
*/
export function getAccessToken()
{
	return readToken(ACCESS_TOKEN_KEY);
}

/*
	getRefreshToken → Obtiene el refresh token almacenado.
*/
export function getRefreshToken()
{
	return readToken(REFRESH_TOKEN_KEY);
}

/*
	clearTokens → Elimina los tokens de autenticación del navegador.
*/
export function clearTokens()
{
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);

	sessionStorage.removeItem(ACCESS_TOKEN_KEY);
	sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}