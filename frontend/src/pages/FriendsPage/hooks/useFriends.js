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

	const feedback = useScopedTimedMessage(1500);

	async function refresh()
	{
		setLoading(true);

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
			feedback.setError(getApiErrorMessage(err, 'Unable to load friends'), 'friends');
		}
		finally
		{
			setLoading(false);
		}
	}

	async function submitSearch(event)
	{
		event?.preventDefault();

		const query = searchQuery.trim();

		if (query.length < 2)
		{
			setSearchResults([]);
			setHasSearched(false);
			feedback.setError('Search requires at least 2 characters', 'search');
			return;
		}

		setSearching(true);
		feedback.clearMessage();

		try
		{
			const response = await searchUsers(query);
			setSearchResults(response.data);
			setHasSearched(true);
		}
		catch (err)
		{
			feedback.setError(getApiErrorMessage(err, 'Unable to search users'), 'search');
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

	async function removeFriendById(userId)
	{
		if (!window.confirm('Remove this friend?'))
			return;

		setActionLoading(true);
		feedback.clearMessage();

		try
		{
			await removeFriend(userId);
			feedback.setSuccess('Friend removed', 'friends');
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
		feedback: feedback.message,

		setSearchQuery,
		submitSearch,
		sendRequest,
		acceptRequest,
		rejectRequest,
		removeFriendById,
		refresh,
		getFeedback: feedback.getScopedMessage,
	};
}
