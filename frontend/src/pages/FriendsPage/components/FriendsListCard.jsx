export function FriendsListCard({
	friends,
	loading,
	actionLoading,
	feedback,
	onRemoveFriend,
})
{
	return (
		<article className="card panel-card">
			<h2 className="panel-title">
				Your friends
			</h2>

			{feedback && (
				<p className={`friends-message friends-message-${feedback.type}`}>
					{feedback.message}
				</p>
			)}

			{loading ? (
				<p className="friends-empty">
					Loading friends...
				</p>
			) : friends.length > 0 ? (
				<div className="friends-list">
					{friends.map((friend) => (
						<div className="friend-row" key={friend.id}>
							<div className="friend-identity">
								<strong>
									{friend.display_name}
								</strong>

								<span>
									@{friend.username}
								</span>

								<span className={friend.online ? 'friend-online' : 'friend-offline'}>
									{friend.online ? 'Online' : 'Offline'}
								</span>
							</div>

							<button
								className="btn"
								type="button"
								disabled={actionLoading}
								onClick={() => onRemoveFriend(friend.id)}
							>
								Remove
							</button>
						</div>
					))}
				</div>
			) : (
				<p className="friends-empty">
					No friends yet
				</p>
			)}
		</article>
	);
}
