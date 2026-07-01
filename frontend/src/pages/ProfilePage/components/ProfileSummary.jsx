export function ProfileSummary({ user })
{
	const getLevelDetails = (elo) => {
		const value = elo || 0;
		if (value < 1100) {
			const progress = Math.min(100, Math.max(0, (value / 1100) * 100));
			return { level: 1, rank: 'Novice', color: '#cd7f32', progress };
		}
		if (value < 1300) {
			const progress = Math.min(100, Math.max(0, ((value - 1100) / 200) * 100));
			return { level: 2, rank: 'Intermediate', color: '#c0c0c0', progress };
		}
		if (value < 1500) {
			const progress = Math.min(100, Math.max(0, ((value - 1300) / 200) * 100));
			return { level: 3, rank: 'Advanced', color: '#ffd700', progress };
		}
		return { level: 4, rank: 'Master', color: '#d946ef', progress: 100 };
	};

	const { level: calculatedLevel, rank: calculatedRank, color: levelColor, progress } = getLevelDetails(user?.elo);

	return (
		<div className="profile-summary">
			<div className="profile-avatar">
				{user?.avatar_url ? (
					<img
						src={user.avatar_url}
						alt={`Avatar of ${user?.display_name || user?.username || 'user'}`}
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
						Level {calculatedLevel} - {calculatedRank}
					</span>
					<div className="profile-progress-bar" title={`${Math.round(progress)}% to next level`}>
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
