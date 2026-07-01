import { useTranslation } from '../../../contexts/LanguageContext';

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
		<article className="card panel-card">
			<div className="friends-card-header">
				<h2 className="panel-title">
					{t('friends.requests.title')}
				</h2>
				<button
					className="btn friends-refresh-btn"
					type="button"
					disabled={loading}
					onClick={onRefresh}
				>
					{t('friends.requests.refresh')}
				</button>
			</div>

			{feedback && (
				<p
					className={`friends-message friends-message-${feedback.type}`}
					role={feedback.type === 'error' ? 'alert' : 'status'}
					aria-live="polite"
				>
					{feedback.message}
				</p>
			)}
			
			<div className="friends-request-block">
				<h4>
					{t('friends.requests.incoming')}
				</h4>

				{incomingRequests.length > 0 ? (
					<div className="friends-list">
						{incomingRequests.map((request) => {
							const user = request.requester;

							if (!user)
								return null;

							return (
								<div className="friend-row" key={request.id}>
									<div className="friend-identity">
										<strong>
											{user.display_name}
										</strong>

										<span>
											@{user.username}
										</span>

										<span className={user.online ? 'friend-online' : 'friend-offline'}>
											{user.online ? t('friends.requests.status_online') : t('friends.requests.status_offline')}
										</span>
									</div>

									<div className="friend-actions">
										<button
											className="btn"
											type="button"
											disabled={actionLoading[request.requester_id]}
											onClick={() => onAccept(request.requester_id)}
										>
											{t('friends.requests.accept')}
										</button>

										<button
											className="btn"
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
					<p className="friends-empty">
						{t('friends.requests.no_incoming')}
					</p>
				)}
			</div>

			<div className="friends-request-block">
				<h4>
					{t('friends.requests.outgoing')}
				</h4>

				{outgoingRequests.length > 0 ? (
					<div className="friends-list">
						{outgoingRequests.map((request) => {
							const user = request.addressee;

							if (!user)
								return null;

							return (
								<div className="friend-row" key={request.id}>
									<div className="friend-identity">
										<strong>
											{user.display_name}
										</strong>

										<span>
											@{user.username}
										</span>

										<span className={user.online ? 'friend-online' : 'friend-offline'}>
											{user.online ? t('friends.requests.status_online') : t('friends.requests.status_offline')}
										</span>
									</div>

									<span className="friend-pending">
										{t('friends.requests.pending')}
									</span>
								</div>
							);
						})}
					</div>
				) : (
					<p className="friends-empty">
						{t('friends.requests.no_pending')}
					</p>
				)}
			</div>
		</article>
	);
}
