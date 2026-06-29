import { useState } from 'react';

import { getApiErrorMessage } from '../../../api';
import { uploadProfileAvatar } from './profileApi';

/*
	useAvatar → Gestiona la validación y subida del avatar del usuario.

	setUser → Actualiza los datos del usuario después de la subida.
	setError → Guarda mensajes de error.
	setSuccess → Guarda mensajes de confirmación.
	uploading → Indica si el archivo se está enviando.

	uploadAvatar(...) → Valida y envía el archivo seleccionado.

	Return
	Estado de subida y función para cambiar el avatar.
*/
export function useAvatar({ setUser, setError, setSuccess })
{
	const [uploading, setUploading] = useState(false);

	/*
		uploadAvatar → Valida y envía una nueva imagen de perfil.

		event → Evento generado por el input de archivo.
		file → Primer archivo seleccionado.
		allowedTypes → Tipos de imagen permitidos.
		maxFileSize → Tamaño máximo permitido en bytes.
		formData → Contenedor utilizado para enviar el archivo.
		response → Usuario actualizado recibido desde el backend.
		err → Error producido durante la subida.

		allowedTypes.includes(...) → Comprueba el tipo del archivo.
		uploadProfileAvatar(...) → Envía la imagen al backend.
		setUser(...) → Guarda el usuario con la nueva URL del avatar.

		Return
		Finaliza sin enviar si falta el archivo o la validación falla.
		No devuelve ningún valor tras completar la subida.
		
		El orden dentro de uploadAvatar será:
			Obtener el archivo.
			Comprobar que existe.
			Validar tipo.
			Validar tamaño.
			Crear FormData.
			Enviarlo al backend.
	*/
	async function uploadAvatar(event)
	{
		const file = event.target.files?.[0];

		if (!file)
			return;
		const allowedTypes = [
			'image/jpeg',
			'image/png',
			'image/webp',
		];

		const maxFileSize = 2 * 1024 * 1024;
		if (!allowedTypes.includes(file.type))
		{
			setError('Avatar must be a JPEG, PNG or WebP image.');
			setSuccess('');
			event.target.value = '';
			return;
		}
		if (file.size > maxFileSize)
		{
			setError('Avatar must be smaller than 2 MB.');
			setSuccess('');
			event.target.value = '';
			return;
		}

		const formData = new FormData();
		formData.append('file', file);

		setUploading(true);
		setError('');
		setSuccess('');

		try
		{
			const response = await uploadProfileAvatar(formData);

			setUser(response.data);
			setSuccess('Avatar updated');
		}
		catch (err)
		{
			setError(getApiErrorMessage(err, 'Unable to upload avatar'));
		}
		finally
		{
			setUploading(false);
			event.target.value = '';
		}
	}

	return {
		uploading,
		uploadAvatar,
	};
}