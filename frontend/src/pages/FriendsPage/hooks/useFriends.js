import { useEffect, useState } from 'react';

import { getApiErrorMessage } from '../../../api';
import { useScopedTimedMessage } from '../../../hooks/useTimedMessage';
import {
	acceptFriendRequest,
	fetchFriends,
	fetchIncomingRequests,
	fetchOutgoingRequests,
	rejectFriendRequest,
	removeFriend,
	searchUsers,
	sendFriendRequest,
} from './friendsApi';

/*
	useFriends → Hook principal para gestionar la lista de amigos y peticiones.

	Return
	Estado y funciones para interactuar con la API de amigos.
*/
export function useFriends()
{
	const [friends, setFriends] = useState([]);
	const [incomingRequests, setIncomingRequests] = useState([]);
	const [outgoingRequests, setOutgoingRequests] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [hasSearched, setHasSearched] = useState(false);

	const [loading, setLoading] = useState(true);
	const [searching, setSearching] = useState(false);
	const [actionLoading, setActionLoading] = useState({});
	const [loadError, setLoadError] = useState('');
	const [pendingRemoveFriend, setPendingRemoveFriend] = useState(null);

	const feedback = useScopedTimedMessage(1500);

	/*
		getFeedback → Obtiene mensajes de éxito o error según el contexto.

		scope → Identificador del contexto (ej: 'friends', 'requests').

		Return
		Objeto con el mensaje o null si no hay ninguno.
	*/
	function getFeedback(scope)
	{
		const scopedMessage = feedback.getScopedMessage(scope);

		if (scopedMessage)
			return scopedMessage;

		if (loadError && (scope === 'friends' || scope === 'requests'))
			return { scope, type: 'error', message: loadError };

		return null;
	}

	/*
		refresh → Actualiza la lista de amigos y peticiones pendientes.

		Return
		Promesa vacía.
	*/
	async function refresh()
	{
		setLoading(true);
		setLoadError('');

		try
		{
			const [
				friendsResponse,
				incomingResponse,
				outgoingResponse,
			] = await Promise.all([
				fetchFriends(),
				fetchIncomingRequests(),
				fetchOutgoingRequests(),
			]);

			setFriends(friendsResponse.data);
			setIncomingRequests(incomingResponse.data);
			setOutgoingRequests(outgoingResponse.data);
		}
		catch (err)
		{
			const message = getApiErrorMessage(err, 'Unable to load friends');

			setLoadError(message);
		}
		finally
		{
			setLoading(false);
		}
	}

	/*
		submitSearch → Busca usuarios por su nombre.

		event → Evento opcional de envío del formulario.

		Return
		Promesa vacía.
	*/
	async function submitSearch(event)
	{
		event?.preventDefault();

		const normalizedQuery = searchQuery.trim();

		if (normalizedQuery.length < 2)
		{
			feedback.setError('Search must contain at least 2 characters.', 'search');
			setSearchResults([]);
			setHasSearched(false);
			return;
		}


		setSearching(true);
		feedback.clearMessage();

		try
		{
			const response = await searchUsers(normalizedQuery);
			setSearchResults(response.data);
			setHasSearched(true);
		}
		catch (err)
		{
			feedback.setError(getApiErrorMessage(err, 'Unable to search users'), 'search');
			setSearchResults([]);
			setHasSearched(true);
		}
		finally
		{
			setSearching(false);
		}
	}

	/*
		sendRequest → Envía una petición de amistad a otro usuario.

		userId → ID del usuario al que se le envía la petición.

		Return
		Promesa vacía.
	*/
	async function sendRequest(userId)
	{
		setActionLoading((prev) => ({ ...prev, [userId]: true }));
		feedback.clearMessage();

		try
		{
			await sendFriendRequest(userId);
			feedback.setSuccess('Friend request sent', 'search');
			setSearchResults((results) => (
				results.filter((user) => user.id !== userId)
			));
			await refresh();
		}
		catch (err)
		{
			feedback.setError(getApiErrorMessage(err, 'Unable to send request'), 'search');
		}
		finally
		{
			setActionLoading((prev) => ({ ...prev, [userId]: false }));
		}
	}

	/*
		acceptRequest → Acepta una petición de amistad entrante.

		requesterId → ID del usuario que envió la petición.

		Return
		Promesa vacía.
	*/
	async function acceptRequest(requesterId)
	{
		setActionLoading((prev) => ({ ...prev, [requesterId]: true }));
		feedback.clearMessage();

		try
		{
			await acceptFriendRequest(requesterId);
			feedback.setSuccess('Friend request accepted', 'requests');
			await refresh();
		}
		catch (err)
		{
			feedback.setError(getApiErrorMessage(err, 'Unable to accept request'), 'requests');
		}
		finally
		{
			setActionLoading((prev) => ({ ...prev, [requesterId]: false }));
		}
	}

	/*
		rejectRequest → Rechaza una petición de amistad entrante.

		requesterId → ID del usuario que envió la petición.

		Return
		Promesa vacía.
	*/
	async function rejectRequest(requesterId)
	{
		setActionLoading((prev) => ({ ...prev, [requesterId]: true }));
		feedback.clearMessage();

		try
		{
			await rejectFriendRequest(requesterId);
			feedback.setSuccess('Friend request rejected', 'requests');
			await refresh();
		}
		catch (err)
		{
			feedback.setError(getApiErrorMessage(err, 'Unable to reject request'), 'requests');
		}
		finally
		{
			setActionLoading((prev) => ({ ...prev, [requesterId]: false }));
		}
	}

	/*
		requestRemoveFriend → Prepara la eliminación de un amigo (abre el modal).

		friend → Objeto del amigo a eliminar.
	*/
	function requestRemoveFriend(friend)
	{
		setPendingRemoveFriend(friend);
	}

	/*
		cancelRemoveFriend → Cancela la eliminación y cierra el modal.
	*/
	function cancelRemoveFriend()
	{
		if (pendingRemoveFriend && actionLoading[pendingRemoveFriend.id])
			return;

		setPendingRemoveFriend(null);
	}

	/*
		confirmRemoveFriend → Ejecuta la eliminación del amigo en la API.

		Return
		Promesa vacía.
	*/
	async function confirmRemoveFriend()
	{
		if (!pendingRemoveFriend || actionLoading[pendingRemoveFriend.id])
			return;

		const targetId = pendingRemoveFriend.id;
		setActionLoading((prev) => ({ ...prev, [targetId]: true }));
		feedback.clearMessage();

		try
		{
			await removeFriend(targetId);
			feedback.setSuccess('Friend removed', 'friends');
			setPendingRemoveFriend(null);
			await refresh();
		}
		catch (err)
		{
			feedback.setError(getApiErrorMessage(err, 'Unable to remove friend'), 'friends');
		}
		finally
		{
			setActionLoading((prev) => ({ ...prev, [targetId]: false }));
		}
	}

	useEffect(() => {
		refresh();
	}, []);

	return {
		friends,
		incomingRequests,
		outgoingRequests,
		searchQuery,
		searchResults,
		hasSearched,
		loading,
		searching,
		actionLoading,
		pendingRemoveFriend,
		feedback: feedback.message,

		setSearchQuery,
		submitSearch,
		sendRequest,
		acceptRequest,
		rejectRequest,
		requestRemoveFriend,
		cancelRemoveFriend,
		confirmRemoveFriend,
		refresh,
		getFeedback,
	};
}
