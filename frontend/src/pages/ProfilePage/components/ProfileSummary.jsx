export function ProfileSummary({ user })
{
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
			</div>
		</div>
	);
}
