import { useTranslation } from '../contexts/LanguageContext';
import achievementToastStyles from './style/achievement-toast.module.css';
export function AchievementToastContainer({ toasts })
{
	const { t } = useTranslation();
	if (!toasts.length)
		return null;

	return (
		<div className={`${achievementToastStyles.toastContainer}`} aria-live="polite" aria-atomic="false">
			{toasts.map((toast) => (
				<article
					key={toast.toastId}
					className={`${achievementToastStyles.achievementToast}${toast.hiding ? ` ${achievementToastStyles.achievementToastHide}` : ''}`}
				>
					<span className={`${achievementToastStyles.toastEmoji}`} aria-hidden="true">
						{toast.emoji}
					</span>
					<div className={`${achievementToastStyles.toastContent}`}>
						<span className={`${achievementToastStyles.toastKicker}`}>{t('toast.achievementUnlocked')}</span>
						<strong className={`${achievementToastStyles.toastTitle}`}>{toast.title}</strong>
						<p className={`${achievementToastStyles.toastDesc}`}>{toast.description}</p>
					</div>
				</article>
			))}
		</div>
	);
}
