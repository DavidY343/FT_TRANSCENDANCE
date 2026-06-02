import { getAccessToken } from '../../api';

export function isMyTurn(state, myColor)
{
	if (!state || state.status === 'finished')
		return (false);

	if (state.turn === 'w' && myColor === 'white')
		return (true);

	if (state.turn === 'b' && myColor === 'black')
		return (true);

	return (false);
}

export function getWsUrl(gameId)
{
	const token = getAccessToken();
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

	return (`${protocol}//${window.location.host}/ws/${gameId}?token=${encodeURIComponent(token)}`);
}

export function getPlayerColor(state, me)
{
	if (!state || !me)
		return ('white');

	if (state.players?.white_id === me.id)
		return ('white');

	return ('black');
}

export function formatClock(ms)
{
	const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return (`${minutes}:${String(seconds).padStart(2, '0')}`);
}