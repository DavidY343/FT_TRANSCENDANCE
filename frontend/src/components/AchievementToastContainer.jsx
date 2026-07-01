import { useTranslation } from '../contexts/LanguageContext';

export function AchievementToastContainer({ toasts })
{
	const { t } = useTranslation();
	if (!toasts.length)
		return null;

	return (
		<div className="toast-container" aria-live="polite" aria-atomic="false">
			{toasts.map((toast) => (
				<article
					key={toast.toastId}
					className={`achievement-toast${toast.hiding ? ' achievement-toast-hide' : ''}`}
				>
					<span className="toast-emoji" aria-hidden="true">
						{toast.emoji}
					</span>
					<div className="toast-content">
						<span className="toast-kicker">{t('toast.achievementUnlocked')}</span>
						<strong className="toast-title">{toast.title}</strong>
						<p className="toast-desc">{toast.description}</p>
					</div>
				</article>
			))}
		</div>
	);
}
