import { useState } from 'react';
import { sendResign, sendDrawOffer, sendDrawAccept, sendDrawDecline } from './socketActions';

export function useGameActions({ wsRef, setError })
{
	const [confirmAction, setConfirmAction] = useState(null);

	function requestResign()
	{
		setConfirmAction('resign');
	}

	function cancelAction()
	{
		setConfirmAction(null);
	}

	function confirmResign()
	{
		setConfirmAction(null);
		return (sendResign({ wsRef, setError }));
	}

	function offerDraw()
	{
		return (sendDrawOffer({ wsRef, setError }));
	}

	function acceptDraw()
	{
		return (sendDrawAccept({ wsRef, setError }));
	}

	function declineDraw()
	{
		return (sendDrawDecline({ wsRef, setError }));
	}

	return ({
		confirmAction,
		requestResign,
		cancelAction,
		confirmResign,
		offerDraw,
		acceptDraw,
		declineDraw,
	});
}
