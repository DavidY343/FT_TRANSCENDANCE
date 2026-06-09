import { api } from '../../../api';

export function fetchFriends()
{
	return ( api.get('/friends') );
}

export function searchUsers(query)
{
	return ( 
		api.get('/friends/search', {
			params: { q: query },
		})
	);
}

export function sendFriendRequest(userId)
{
	return ( api.post(`/friends/${userId}`) );
}

export function fetchIncomingRequests()
{
	return ( api.get('/friends/requests/incoming') );
}

export function fetchOutgoingRequests()
{
	return ( api.get('/friends/requests/outgoing') );
}

export function acceptFriendRequest(requesterId)
{
	return ( api.post(`/friends/requests/${requesterId}/accept`) );
}

export function rejectFriendRequest(requesterId)
{
	return ( api.post(`/friends/requests/${requesterId}/reject`) );
}

export function removeFriend(userId)
{
	return ( api.delete(`/friends/${userId}`) );
}