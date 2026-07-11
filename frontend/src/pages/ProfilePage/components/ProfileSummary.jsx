import { useTranslation } from '../../../contexts/LanguageContext';
import avatarStyles from '../style/avatar.module.css';
import summaryStyles from '../style/summary.module.css';

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
		<div className={`${summaryStyles.profileSummary}`}>
			<div className={`${avatarStyles.profileAvatar}`}>
				{user?.avatar_url ? (
					<img
						src={user.avatar_url}
						alt={`${t('profile.summary.avatar_alt')} ${user?.display_name || user?.username || t('profile.summary.user')}`}
					/>
				) : (
					<span
						className={`${avatarStyles.defaultAvatar}`}
						style={{
							filter: `hue-rotate(${((user?.username?.length || 0) * 47) % 360}deg)`,
						}}
					>
						{user?.display_name?.[0] || user?.username?.[0] || '?'}
					</span>
				)}
			</div>

			<div>
				<h2 className={`${summaryStyles.profileName}`}>
					{user?.display_name}
				</h2>

				<p className={`${summaryStyles.profileUsername}`}>
					@{user?.username}
				</p>

				<p className={`${summaryStyles.profileElo}`}>
					ELO {user?.elo}
				</p>

				<div className={`${summaryStyles.profileLevel}`}>
					<span className={`${summaryStyles.profileLevelText}`} style={{ color: levelColor }}>
						{t('profile.summary.level')} {calculatedLevel} - {calculatedRank}
					</span>
					<div className={`${summaryStyles.profileProgressBar}`} title={`${Math.round(progress)}% ${t('profile.summary.to_next_level')}`}>
						<div 
							className={`${summaryStyles.profileProgressFill}`} 
							style={{ width: `${progress}%`, backgroundColor: levelColor }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
