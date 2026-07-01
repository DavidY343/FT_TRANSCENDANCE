import { Link } from 'react-router-dom';
import { useTranslation } from '../../../contexts/LanguageContext';

export function FriendsListCard({
	friends,
	loading,
	actionLoading,
	feedback,
	onRequestRemoveFriend,
})
{
	const { t } = useTranslation();

	return (
		<article className="card panel-card">
			<h2 className="panel-title">
				{t('friends.list.title')}
			</h2>

			{feedback && (
				<p
					className={`friends-message friends-message-${feedback.type}`}
					role={feedback.type === 'error' ? 'alert' : 'status'}
					aria-live="polite"
				>
					{feedback.message}
				</p>
			)}
			
			{loading ? (
				<p className="friends-empty">
					{t('friends.list.loading')}
				</p>
			) : friends.length > 0 ? (
				<div className="friends-list">
					{friends.map((friend) => (
						<div className="friend-row" key={friend.id}>
							<div className="friend-identity">
								<strong>
									<Link to={`/profile/${friend.id}`} className="profile-link">
										{friend.display_name}
									</Link>
								</strong>

								<span>
									<Link to={`/profile/${friend.id}`} className="profile-link">
										@{friend.username}
									</Link>
								</span>

								<span className={friend.online ? 'friend-online' : 'friend-offline'}>
									{friend.online ? t('friends.list.status_online') : t('friends.list.status_offline')}
								</span>
							</div>

							<button
								className="btn"
								type="button"
								disabled={actionLoading[friend.id]}
								onClick={() => onRequestRemoveFriend(friend)}
							>
								{t('friends.list.remove_btn')}
							</button>
						</div>
					))}
				</div>
			) : (
				<p className="friends-empty">
					{t('friends.list.empty')}
				</p>
			)}
		</article>
	);
}
