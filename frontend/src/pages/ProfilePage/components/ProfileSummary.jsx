import { useTranslation } from '../../../contexts/LanguageContext';

export function ProfileSummary({ user })
{
	const { t } = useTranslation();

	const getLevelDetails = (elo) => {
		const value = elo || 0;
		if (value < 1100) {
			const progress = Math.min(100, Math.max(0, (value / 1100) * 100));
			return { level: 1, rank: t('profile.rank.novice'), color: '#cd7f32', progress };
		}
		if (value < 1300) {
			const progress = Math.min(100, Math.max(0, ((value - 1100) / 200) * 100));
			return { level: 2, rank: t('profile.rank.intermediate'), color: '#c0c0c0', progress };
		}
		if (value < 1500) {
			const progress = Math.min(100, Math.max(0, ((value - 1300) / 200) * 100));
			return { level: 3, rank: t('profile.rank.advanced'), color: '#ffd700', progress };
		}
		return { level: 4, rank: t('profile.rank.master'), color: '#d946ef', progress: 100 };
	};

	const { level: calculatedLevel, rank: calculatedRank, color: levelColor, progress } = getLevelDetails(user?.elo);

	return (
		<div className="profile-summary">
			<div className="profile-avatar">
				{user?.avatar_url ? (
					<img
						src={user.avatar_url}
						alt={`${t('profile.summary.avatar_alt')} ${user?.display_name || user?.username || t('profile.summary.user')}`}
					/>
				) : (
					<span>
						{user?.display_name?.[0] || user?.username?.[0] || '?'}
					</span>
				)}
			</div>

			<div>
				<h2 className="profile-name">
					{user?.display_name}
				</h2>

				<p className="profile-username">
					@{user?.username}
				</p>

				<p className="profile-elo">
					ELO {user?.elo}
				</p>

				<div className="profile-level">
					<span className="profile-level-text" style={{ color: levelColor }}>
						{t('profile.summary.level')} {calculatedLevel} - {calculatedRank}
					</span>
					<div className="profile-progress-bar" title={`${Math.round(progress)}% ${t('profile.summary.to_next_level')}`}>
						<div 
							className="profile-progress-fill" 
							style={{ width: `${progress}%`, backgroundColor: levelColor }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
