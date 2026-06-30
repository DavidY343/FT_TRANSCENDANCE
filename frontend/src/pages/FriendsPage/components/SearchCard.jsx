export function SearchCard({
	query,
	setQuery,
	results,
	hasSearched,
	searching,
	actionLoading,
	feedback,
	onSubmit,
	onSendRequest,
})
{
	return (
		<article className="card panel-card">
			<h2 className="panel-title">
				Find players
			</h2>

			<form className="friends-search-form" onSubmit={onSubmit}>
				<input
					type="search"
					aria-label="Search players by username or display name"
					placeholder="Username or display name"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>

				<button
					className="btn"
					type="submit"
					disabled={searching}
				>
					{searching ? 'Searching...' : 'Search'}
				</button>
			</form>

			{feedback && (
				<p
					className={`friends-message friends-message-${feedback.type}`}
					role={feedback.type === 'error' ? 'alert' : 'status'}
					aria-live="polite"
				>
					{feedback.message}
				</p>
			)}
			{results.length > 0 && (
				<div className="friends-list">
					{results.map((user) => (
						<div className="friend-row" key={user.id}>
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

							<button
								className="btn"
								type="button"
								disabled={actionLoading[user.id]}
								onClick={() => onSendRequest(user.id)}
							>
								Add
							</button>
						</div>
					))}
				</div>
			)}
			{hasSearched && !searching && results.length === 0 && (
				<p className="friends-empty">
					No players found
				</p>
			)}
		</article>
	);
}
