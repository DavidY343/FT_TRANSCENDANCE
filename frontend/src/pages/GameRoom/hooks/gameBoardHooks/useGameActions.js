import { useState } from 'react';
import { sendResign, sendDrawOffer, sendDrawAccept, sendDrawDecline } from './socketActions';

export function useGameActions({ wsRef, setError })
{
	const [confirmAction, setConfirmAction] = useState(null);

	function requestResign()
	{
		setConfirmAction('resign');
	}

	function requestDrawOffer()
	{
		setConfirmAction('draw');
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

	function confirmDrawOffer()
	{
		setConfirmAction(null);
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
		offerDraw: requestDrawOffer,
		confirmDrawOffer,
		acceptDraw,
		declineDraw,
	});
}
