import { useEffect, useState } from 'react';

import { api, getAccessToken } from '../api';

const STORAGE_KEY = 'unlocked_achievements';

function readStoredAchievements()
{
	const stored = localStorage.getItem(STORAGE_KEY);

	if (!stored)
		return null;

	try
	{
		return JSON.parse(stored);
	}
	catch (_err)
	{
		localStorage.removeItem(STORAGE_KEY);
		return null;
	}
}

export function clearStoredAchievements()
{
	localStorage.removeItem(STORAGE_KEY);
}

export function useAchievementToasts(isAuthed)
{
	const [toasts, setToasts] = useState([]);

	useEffect(() => {
		if (!isAuthed)
			return undefined;

		let cancelled = false;
		const timeouts = [];

		async function checkAchievements()
		{
			if (cancelled)
				return;

            if (!getAccessToken())
                return;

			try
			{
				const { data } = await api.get('/users/me/achievements');

				if (cancelled || !Array.isArray(data))
					return;

				const storedIds = readStoredAchievements();

				if (storedIds === null)
				{
					const unlockedIds = data
						.filter((achievement) => achievement.unlocked)
						.map((achievement) => achievement.id);

					localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
					return;
				}

				const nextStoredIds = [...storedIds];
				const newAchievements = data.filter((achievement) => (
					achievement.unlocked && !storedIds.includes(achievement.id)
				));

				if (newAchievements.length === 0)
					return;

				newAchievements.forEach((achievement) => {
					nextStoredIds.push(achievement.id);
				});
				localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStoredIds));

				newAchievements.forEach((achievement) => {
					const toastId = `${achievement.id}-${Date.now()}-${Math.random()}`;
					setToasts((current) => [
						...current,
						{ ...achievement, toastId, hiding: false },
					]);

					timeouts.push(window.setTimeout(() => {
						setToasts((current) => current.map((toast) => (
							toast.toastId === toastId
								? { ...toast, hiding: true }
								: toast
						)));
					}, 3600));

					timeouts.push(window.setTimeout(() => {
						setToasts((current) => current.filter((toast) => (
							toast.toastId !== toastId
						)));
					}, 4000));
				});
			}
			catch (_err)
			{
				// Achievement checks are non-critical and should not disturb the app.
			}
		}

		const initialTimeout = window.setTimeout(checkAchievements, 1000);
		const intervalId = window.setInterval(checkAchievements, 4000);

		return () => {
			cancelled = true;
			window.clearTimeout(initialTimeout);
			window.clearInterval(intervalId);
			timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
		};
	}, [isAuthed]);

	return toasts;
}
