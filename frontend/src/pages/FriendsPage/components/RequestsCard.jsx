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
	return (
		<article className="card panel-card">
			<div className="friends-card-header">
				<h2 className="panel-title">
					Requests
				</h2>
				<button
					className="btn friends-refresh-btn"
					type="button"
					disabled={loading}
					onClick={onRefresh}
				>
					Refresh
				</button>
			</div>

			{feedback && (
				<p className={`friends-message friends-message-${feedback.type}`}>
					{feedback.message}
				</p>
			)}

			<div className="friends-request-block">
				<h4>
					Incoming
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
											{user.online ? 'Online' : 'Offline'}
										</span>
									</div>

									<div className="friend-actions">
										<button
											className="btn"
											type="button"
											disabled={actionLoading}
											onClick={() => onAccept(request.requester_id)}
										>
											Accept
										</button>

										<button
											className="btn"
											type="button"
											disabled={actionLoading}
											onClick={() => onReject(request.requester_id)}
										>
											Reject
										</button>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<p className="friends-empty">
						No incoming requests
					</p>
				)}
			</div>

			<div className="friends-request-block">
				<h4>
					Outgoing
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
											{user.online ? 'Online' : 'Offline'}
										</span>
									</div>

									<span className="friend-pending">
										Pending
									</span>
								</div>
							);
						})}
					</div>
				) : (
					<p className="friends-empty">
						No pending requests
					</p>
				)}
			</div>
		</article>
	);
}
