import { Link } from 'react-router-dom';
import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import friendsStyles from '../style/friends.module.css';
import { StatusBadge } from '../../../components/StatusBadge';

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
		<article className={`${cardsStyles.card} ${cardsStyles.panelCard}`}>
			<h2 className={`${cardsStyles.panelTitle}`}>
				{t('friends.list.title')}
			</h2>

			{feedback && (
				<p
					className={`${friendsStyles.friendsMessage} ${feedback.type === 'error' ? friendsStyles.friendsMessageError : friendsStyles.friendsMessageSuccess}`}
					role={feedback.type === 'error' ? 'alert' : 'status'}
					aria-live="polite"
				>
					{feedback.message}
				</p>
			)}
			
			{loading ? (
				<p className={`${friendsStyles.friendsEmpty}`}>
					{t('friends.list.loading')}
				</p>
			) : friends.length > 0 ? (
				<div className={`${friendsStyles.friendsList}`}>
					{friends.map((friend) => (
						<div className={`${friendsStyles.friendRow}`} key={friend.id}>
							<div className={`${friendsStyles.friendIdentity}`}>
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

								<StatusBadge 
									isOnline={friend.online} 
									text={friend.online ? t('friends.list.status_online') : t('friends.list.status_offline')} 
								/>
							</div>

							<button
								className={`${buttonStyles.btn}`}
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
				<p className={`${friendsStyles.friendsEmpty}`}>
					{t('friends.list.empty')}
				</p>
			)}
		</article>
	);
}
