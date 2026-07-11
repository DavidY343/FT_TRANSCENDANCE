import { Link } from 'react-router-dom';
import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import friendsStyles from '../style/friends.module.css';
import { StatusBadge } from '../../../components/StatusBadge';

export function RequestsCard({
	incomingRequests,
	outgoingRequests,
	loading,
	actionLoading,
	feedback,
	onRefresh,
	onAccept,
	onReject,
})
{
	const { t } = useTranslation();

	return (
		<article className={`${cardsStyles.card} ${cardsStyles.panelCard}`}>
			<div className={`${friendsStyles.friendsCardHeader}`}>
				<h2 className={`${cardsStyles.panelTitle}`}>
					{t('friends.requests.title')}
				</h2>
				<button
					className={`${buttonStyles.btn} ${friendsStyles.friendsRefreshBtn}`}
					type="button"
					disabled={loading}
					onClick={onRefresh}
				>
					{t('friends.requests.refresh')}
				</button>
			</div>

			{feedback && (
				<p
					className={`${friendsStyles.friendsMessage} ${feedback.type === 'error' ? friendsStyles.friendsMessageError : friendsStyles.friendsMessageSuccess}`}
					role={feedback.type === 'error' ? 'alert' : 'status'}
					aria-live="polite"
				>
					{feedback.message}
				</p>
			)}
			
			<div className={`${friendsStyles.friendsRequestBlock}`}>
				<h4>
					{t('friends.requests.incoming')}
				</h4>

				{incomingRequests.length > 0 ? (
					<div className={`${friendsStyles.friendsList}`}>
						{incomingRequests.map((request) => {
							const user = request.requester;

							if (!user)
								return null;

							return (
								<div className={`${friendsStyles.friendRow}`} key={request.id}>
									<div className={`${friendsStyles.friendIdentity}`}>
										<strong>
											<Link to={`/profile/${user.id}`} className="profile-link">
												{user.display_name}
											</Link>
										</strong>

										<span>
											<Link to={`/profile/${user.id}`} className="profile-link">
												@{user.username}
											</Link>
										</span>

										<StatusBadge 
											isOnline={user.online} 
											text={user.online ? t('friends.requests.status_online') : t('friends.requests.status_offline')} 
										/>
									</div>

									<div className={`${friendsStyles.friendActions}`}>
										<button
											className={`${buttonStyles.btn}`}
											type="button"
											disabled={actionLoading[request.requester_id]}
											onClick={() => onAccept(request.requester_id)}
										>
											{t('friends.requests.accept')}
										</button>

										<button
											className={`${buttonStyles.btn}`}
											type="button"
											disabled={actionLoading[request.requester_id]}
											onClick={() => onReject(request.requester_id)}
										>
											{t('friends.requests.reject')}
										</button>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<p className={`${friendsStyles.friendsEmpty}`}>
						{t('friends.requests.no_incoming')}
					</p>
				)}
			</div>

			<div className={`${friendsStyles.friendsRequestBlock}`}>
				<h4>
					{t('friends.requests.outgoing')}
				</h4>

				{outgoingRequests.length > 0 ? (
					<div className={`${friendsStyles.friendsList}`}>
						{outgoingRequests.map((request) => {
							const user = request.addressee;

							if (!user)
								return null;

							return (
								<div className={`${friendsStyles.friendRow}`} key={request.id}>
									<div className={`${friendsStyles.friendIdentity}`}>
										<strong>
											<Link to={`/profile/${user.id}`} className="profile-link">
												{user.display_name}
											</Link>
										</strong>

										<span>
											<Link to={`/profile/${user.id}`} className="profile-link">
												@{user.username}
											</Link>
										</span>

										<StatusBadge 
											isOnline={user.online} 
											text={user.online ? t('friends.requests.status_online') : t('friends.requests.status_offline')} 
										/>
									</div>

									<span className={`${friendsStyles.friendPending}`}>
										{t('friends.requests.pending')}
									</span>
								</div>
							);
						})}
					</div>
				) : (
					<p className={`${friendsStyles.friendsEmpty}`}>
						{t('friends.requests.no_pending')}
					</p>
				)}
			</div>
		</article>
	);
}
