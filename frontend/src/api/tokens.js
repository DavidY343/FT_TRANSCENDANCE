/*
	ACCESS_TOKEN_KEY → Clave usada para almacenar el access token.
	REFRESH_TOKEN_KEY → Clave usada para almacenar el refresh token.
*/
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/*
	readToken → Busca un token en el almacenamiento del navegador.

	key → Nombre del token que se quiere obtener.
	sessionValue → Token encontrado en sessionStorage.
	legacyValue → Token antiguo encontrado en localStorage.

	sessionStorage.getItem(key) → Lee el token de la sesión actual.
	localStorage.getItem(key) → Busca tokens guardados por la implementación antigua.
	sessionStorage.setItem(...) → Migra el token antiguo a sessionStorage.
	localStorage.removeItem(...) → Elimina la copia antigua.

	Return
	sessionValue → Si el token ya está en sessionStorage.
	legacyValue → Si se ha recuperado desde localStorage.
	'' → Si no existe ningún token.
*/
function readToken(key)
{
	const sessionValue = sessionStorage.getItem(key);

	if (sessionValue)
		return sessionValue;

	const legacyValue = localStorage.getItem(key);

	if (legacyValue)
	{
		sessionStorage.setItem(key, legacyValue);
		localStorage.removeItem(key);
		return legacyValue;
	}

	return '';
}

/*
	setTokens → Guarda los tokens de autenticación en el navegador.

	accessToken → Token utilizado para autorizar las peticiones.
	refreshToken → Token utilizado para renovar la sesión.

	sessionStorage.setItem(...) → Guarda los tokens durante la sesión actual.
	localStorage.removeItem(...) → Elimina posibles tokens de la implementación antigua.

	Return
	No devuelve ningún valor.
*/
export function setTokens(accessToken, refreshToken)
{
	sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/*
	getAccessToken → Obtiene el access token almacenado.

	readToken(ACCESS_TOKEN_KEY) → Busca el token identificado como access_token.

	Return
	Access token → Si existe un token almacenado.
	'' → Si no existe.
*/
export function getAccessToken()
{
	return readToken(ACCESS_TOKEN_KEY);
}

/*
	getRefreshToken → Obtiene el refresh token almacenado.

	readToken(REFRESH_TOKEN_KEY) → Busca el token identificado como refresh_token.

	Return
	Refresh token → Si existe un token almacenado.
	'' → Si no existe.
*/
export function getRefreshToken()
{
	return readToken(REFRESH_TOKEN_KEY);
}

/*
	clearTokens → Elimina los tokens de autenticación del navegador.

	sessionStorage.removeItem(...) → Elimina los tokens de la sesión actual.
	localStorage.removeItem(...) → Elimina posibles tokens antiguos.

	Return
	No devuelve ningún valor.
*/
export function clearTokens()
{
	sessionStorage.removeItem(ACCESS_TOKEN_KEY);
	sessionStorage.removeItem(REFRESH_TOKEN_KEY);

	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}