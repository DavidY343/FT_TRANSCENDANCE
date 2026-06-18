/*
	detailToMessage → Convierte diferentes formatos de error en un texto legible.

	detail → Detalle del error recibido desde el backend.
	first → Primer elemento cuando detail es una lista.

	Array.isArray(detail) → Comprueba si el detalle es una lista.
	JSON.stringify(...) → Convierte objetos o listas en texto.
	String(detail) → Convierte valores simples en texto.

	Return
	null → Si no existe ningún detalle.
	detail → Si ya es una cadena de texto.
	first.msg o first.message → Si el primer error contiene un mensaje.
	Texto JSON → Si el detalle tiene una estructura desconocida.
*/
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

/*
	getApiErrorMessage → Obtiene un mensaje legible de un error de la API.

	error → Error recibido desde Axios.
	fallbackMessage → Mensaje utilizado si el backend no proporciona uno.
	data → Cuerpo de la respuesta del backend.
	detailMessage → Mensaje extraído de la propiedad detail.

	detailToMessage(...) → Normaliza el detalle enviado por el backend.

	Return
	detailMessage → Si la respuesta contiene un detalle válido.
	data.message → Si el backend proporciona una propiedad message.
	fallbackMessage → Si no se encuentra otro mensaje.
*/
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

/*
	getAuthErrorMessage → Traduce errores relacionados con autenticación.

	error → Error recibido durante el login o registro.
	fallbackMessage → Mensaje utilizado si no hay información específica.

	getApiErrorMessage(...) → Busca un mensaje enviado por el backend.

	Return
	Mensaje de timeout → Si la petición tardó demasiado.
	Mensaje de conexión → Si el servidor no respondió.
	Mensaje de la API → Para el resto de errores.
*/
export function getAuthErrorMessage(error, fallbackMessage)
{
	if (error.code === 'ECONNABORTED')
		return 'Request timeout. Please try again.';

	if (!error.response)
	{
		return (
			'Cannot reach server. Check that Docker is running and localhost:8080 is available.'
		);
	}

	return getApiErrorMessage(error, fallbackMessage);
}