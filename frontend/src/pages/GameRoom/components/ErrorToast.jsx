import errorStyles from '../style/game-error.module.css';
export function ErrorToast({ error })
{
	if (!error)
		return null;

	return (
		<div className={`${errorStyles.gameRoomErrorToast}`} role="status" aria-live="polite">
			{error}
		</div>
	);
}
