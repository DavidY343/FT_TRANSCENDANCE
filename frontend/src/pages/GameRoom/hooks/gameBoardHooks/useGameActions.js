import { useState } from 'react';
import { sendResign } from './socketActions';

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

	return ({
		confirmAction,
		requestResign,
		cancelAction,
		confirmResign,
	});
}
