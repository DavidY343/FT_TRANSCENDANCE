import { useEffect, useState } from 'react';

export function useDisconnectGraceCountdown(disconnectGrace, meId, gameResult)
{
	const [visibleGrace, setVisibleGrace] = useState(null);
	const [deadlineMs, setDeadlineMs] = useState(null);
	const [secondsLeft, setSecondsLeft] = useState(0);

	useEffect(() => {
		if (gameResult || disconnectGrace?.active === false)
		{
			setVisibleGrace(null);
			setDeadlineMs(null);
			setSecondsLeft(0);
			return undefined;
		}

		const shouldShow = Boolean(
			disconnectGrace?.active
			&& disconnectGrace.user_id !== meId
		);

		if (!shouldShow)
		{
			const timeoutId = window.setTimeout(() => {
				setVisibleGrace(null);
				setDeadlineMs(null);
				setSecondsLeft(0);
			}, 1200);

			return () => window.clearTimeout(timeoutId);
		}

		const nextSeconds = Math.max(0, Number(disconnectGrace.seconds) || 0);

		setVisibleGrace(disconnectGrace);
		setDeadlineMs(Date.now() + (nextSeconds * 1000));
		setSecondsLeft(nextSeconds);
		return undefined;
	}, [
		disconnectGrace?.active,
		disconnectGrace?.seconds,
		disconnectGrace?.user_id,
		gameResult,
		meId,
	]);

	useEffect(() => {
		if (!visibleGrace || !deadlineMs)
			return undefined;

		function updateSecondsLeft()
		{
			setSecondsLeft(Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)));
		}

		updateSecondsLeft();
		const intervalId = window.setInterval(() => {
			updateSecondsLeft();
		}, 250);

		return () => window.clearInterval(intervalId);
	}, [deadlineMs, visibleGrace]);

	return {
		showGrace: Boolean(visibleGrace && secondsLeft > 0),
		secondsLeft,
	};
}
