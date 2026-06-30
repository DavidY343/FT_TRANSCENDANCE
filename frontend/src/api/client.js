import axios from 'axios';

import {
	clearTokens,
	getAccessToken,
	getRefreshToken,
	setTokens,
} from './tokens';

/*
	API_BASE → Dirección base utilizada para las peticiones HTTP.
*/
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/*
	api → Cliente Axios compartido por toda la aplicación.

	baseURL → Ruta añadida delante de cada endpoint.
	timeout → Tiempo máximo de espera de una petición.
*/
export const api = axios.create({
	baseURL: API_BASE,
	timeout: 8000,
});

/*
	getSocketBaseUrl → Construye la dirección base de los WebSockets.

	apiUrl → URL absoluta creada a partir de API_BASE.
	wsProtocol → Protocolo WebSocket adecuado: ws o wss.
	basePath → Ruta sin el sufijo /api/v1.

	new URL(...) → Convierte API_BASE en una URL absoluta.
	replace(...) → Elimina la parte de la API que no pertenece al WebSocket.

	Return
	URL base del servidor WebSocket.
*/
function getSocketBaseUrl()
{
	const apiUrl = new URL(API_BASE, window.location.origin);
	const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
	const basePath = apiUrl.pathname
		.replace(/\/api\/v\d+\/?$/, '')
		.replace(/\/api\/?$/, '')
		.replace(/\/$/, '');

	return `${wsProtocol}//${apiUrl.host}${basePath}`;
}

/*
	getGameSocketUrl → Construye la dirección WebSocket de una partida.

	gameId → Identificador de la partida.

	getSocketBaseUrl() → Obtiene la dirección base de los WebSockets.

	Return
	URL WebSocket correspondiente a la partida.
*/
export function getGameSocketUrl(gameId)
{
	return `${getSocketBaseUrl()}/ws/${gameId}`;
}

/*
	getPresenceSocketUrl → Construye la dirección WebSocket de presencia.

	getSocketBaseUrl() → Obtiene la dirección base de los WebSockets.

	Return
	URL WebSocket utilizada para comunicar el estado online.
*/
export function getPresenceSocketUrl()
{
	return `${getSocketBaseUrl()}/ws/presence`;
}

/*
	Interceptor de petición → Añade el access token a cada petición.

	config → Configuración de la petición antes de enviarla.
	token → Access token almacenado.

	getAccessToken() → Obtiene el token actual.

	Return
	config → Petición preparada con la cabecera Authorization.
*/
api.interceptors.request.use((config) => {
	const token = getAccessToken();

	if (token)
		config.headers.Authorization = `Bearer ${token}`;

	return config;
});

/*
	Interceptor de respuesta → Renueva la sesión cuando una petición devuelve 401.

	error → Error recibido desde Axios.
	originalRequest → Configuración de la petición que falló.
	refreshToken → Token utilizado para renovar la sesión.
	response → Respuesta del endpoint de renovación.

	axios.post(...) → Solicita nuevos tokens sin utilizar los interceptores de api.
	setTokens(...) → Guarda los tokens nuevos.
	api(originalRequest) → Repite la petición que había fallado.
	clearTokens() → Elimina la sesión si la renovación falla.

	Return
	response → Si la petición original termina correctamente.
	api(originalRequest) → Resultado de la petición repetida.
	Promise.reject(error) → Error que no pudo recuperarse.
*/
window.addEventListener('unhandledrejection', (event) => {
	if (event.reason && event.reason.isSafe)
		event.preventDefault();
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (
			error.response?.status === 401
			&& originalRequest
			&& !originalRequest._retry
		)
		{
			originalRequest._retry = true;

			try
			{
				const refreshToken = getRefreshToken();

				if (!refreshToken)
					throw new Error('Missing refresh token');

				const response = await axios.post(
					`${API_BASE}/auth/refresh`,
					{ refresh_token: refreshToken }
				);

				setTokens(
					response.data.access_token,
					response.data.refresh_token
				);

				originalRequest.headers = originalRequest.headers || {};
				originalRequest.headers.Authorization =
					`Bearer ${response.data.access_token}`;

				return api(originalRequest);
			}
			catch (_refreshError)
			{
				clearTokens();

				if (
					window.location.pathname !== '/login'
					&& window.location.pathname !== '/register'
				)
					window.location.href = '/login';
			}
		}

		const safeError = new Error(error.message);
		safeError.isSafe = true;
		safeError.config = error.config;
		safeError.code = error.code;
		safeError.response = error.response;

		return Promise.reject(safeError);
	}
);