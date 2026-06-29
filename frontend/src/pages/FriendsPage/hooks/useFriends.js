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
	const [actionLoading, setActionLoading] = useState(false);
	const [loadError, setLoadError] = useState('');
	const [pendingRemoveFriend, setPendingRemoveFriend] = useState(null);

	const feedback = useScopedTimedMessage(1500);

	function getFeedback(scope)
	{
		const scopedMessage = feedback.getScopedMessage(scope);

		if (scopedMessage)
			return scopedMessage;

		if (loadError && (scope === 'friends' || scope === 'requests'))
			return { scope, type: 'error', message: loadError };

		return null;
	}

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

	async function sendRequest(userId)
	{
		setActionLoading(true);
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
			setActionLoading(false);
		}
	}

	async function acceptRequest(requesterId)
	{
		setActionLoading(true);
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
			setActionLoading(false);
		}
	}

	async function rejectRequest(requesterId)
	{
		setActionLoading(true);
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
			setActionLoading(false);
		}
	}

	function requestRemoveFriend(friend)
	{
		setPendingRemoveFriend(friend);
	}

	function cancelRemoveFriend()
	{
		if (actionLoading)
			return;

		setPendingRemoveFriend(null);
	}

	async function confirmRemoveFriend()
	{
		if (!pendingRemoveFriend || actionLoading)
			return;

		setActionLoading(true);
		feedback.clearMessage();

		try
		{
			await removeFriend(pendingRemoveFriend.id);
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
			setActionLoading(false);
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
