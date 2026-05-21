import axios from 'axios';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const api = axios.create({
	baseURL: 'http://localhost:8080',
	timeout: 8000
});

export function setTokens(accessToken, refreshToken)
{
	localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken()
{
	return ( localStorage.getItem(ACCESS_TOKEN_KEY) );
}

export function getRefreshToken()
{
	return ( localStorage.getItem(REFRESH_TOKEN_KEY) );
}

export function clearTokens()
{
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getApiErrorMessage(error, fallbackMessage)
{
	if (error.response && error.response.data && error.response.data.detail)
		return ( error.response.data.detail );

	if (error.response && error.response.data && error.response.data.message)
		return ( error.response.data.message );

	return fallbackMessage;
}