// api.js is responsible for centralizing communication
// with the backend and managing authentication tokens.


import axios from 'axios';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
	baseURL: API_BASE,
	timeout: 8000
});

function readToken(key)
{
	const sessionValue = sessionStorage.getItem(key);

	if (sessionValue)
		return ( sessionValue );

	const legacyValue = localStorage.getItem(key);

	if (legacyValue)
	{
		sessionStorage.setItem(key, legacyValue);
		localStorage.removeItem(key);
		return ( legacyValue );
	}

	return ( '' );
}

export function setTokens(accessToken, refreshToken)
{
	sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken()
{
	return ( readToken(ACCESS_TOKEN_KEY) );
}

export function getRefreshToken()
{
	return ( readToken(REFRESH_TOKEN_KEY) );
}

export function clearTokens()
{
	sessionStorage.removeItem(ACCESS_TOKEN_KEY);
	sessionStorage.removeItem(REFRESH_TOKEN_KEY);
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}


api.interceptors.request.use((config) => {
	const token = getAccessToken();

	if (token)
		config.headers.Authorization = `Bearer ${token}`;

	return ( config );
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401)
		{
			if (
				window.location.pathname !== '/login'
				&& window.location.pathname !== '/register'
			)
			{
				clearTokens();
				window.location.href = '/login';
			}
		}

		return ( Promise.reject(error) );
	}
);


function detailToMessage(detail)
{
	if (!detail)
		return null;

	if (typeof detail === 'string')
		return detail;

	if (Array.isArray(detail))
	{
		const first = detail[0];

		if (typeof first === 'string')
			return first;

		if (first && typeof first === 'object')
		{
			if (typeof first.msg === 'string')
				return first.msg;

			if (typeof first.message === 'string')
				return first.message;

			return JSON.stringify(first);
		}

		return JSON.stringify(detail);
	}

	if (typeof detail === 'object')
	{
		if (typeof detail.message === 'string')
			return detail.message;

		if (typeof detail.msg === 'string')
			return detail.msg;

		return JSON.stringify(detail);
	}

	return String(detail);
}

export function getApiErrorMessage(error, fallbackMessage)
{
	const data = error?.response?.data;
	const detailMessage = detailToMessage(data?.detail);

	if (detailMessage)
		return detailMessage;

	if (typeof data?.message === 'string')
		return data.message;

	return fallbackMessage;
}

export function getAuthErrorMessage(error, fallbackMessage)
{
	if (error.code === 'ECONNABORTED')
		return ('Request timeout. Please try again.');

	if (!error.response)
		return (
			'Cannot reach server. Check that Docker is running and localhost:8080 is available.'
		);

	return ( getApiErrorMessage(error, fallbackMessage) );
}
