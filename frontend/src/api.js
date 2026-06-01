// api.js is responsible for centralizing communication
// with the backend and managing authentication tokens.


import axios from 'axios';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
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

export function getApiErrorMessage(error, fallbackMessage)
{
	if (error.response && error.response.data && error.response.data.detail)
		return ( error.response.data.detail );

	if (error.response && error.response.data && error.response.data.message)
		return ( error.response.data.message );

	return ( fallbackMessage );
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
