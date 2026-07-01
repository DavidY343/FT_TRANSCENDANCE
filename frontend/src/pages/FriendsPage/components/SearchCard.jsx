import { Link } from 'react-router-dom';
import { useTranslation } from '../../../contexts/LanguageContext';

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
	const { t } = useTranslation();

	return (
		<article className="card panel-card">
			<h2 className="panel-title">
				{t('friends.search.title')}
			</h2>

			<form className="friends-search-form" onSubmit={onSubmit}>
				<input
					type="search"
					aria-label={t('friends.search.aria_label')}
					placeholder={t('friends.search.placeholder')}
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>

				<button
					className="btn"
					type="submit"
					disabled={searching}
				>
					{searching ? t('friends.search.btn_searching') : t('friends.search.btn')}
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
									<Link to={`/profile/${user.id}`} className="profile-link">
										{user.display_name}
									</Link>
								</strong>

								<span>
									<Link to={`/profile/${user.id}`} className="profile-link">
										@{user.username}
									</Link>
								</span>

								<span className={user.online ? 'friend-online' : 'friend-offline'}>
									{user.online ? t('friends.search.status_online') : t('friends.search.status_offline')}
								</span>
							</div>

							<button
								className="btn"
								type="button"
								disabled={actionLoading[user.id]}
								onClick={() => onSendRequest(user.id)}
							>
								{t('friends.search.add_btn')}
							</button>
						</div>
					))}
				</div>
			)}
			{hasSearched && !searching && results.length === 0 && (
				<p className="friends-empty">
					{t('friends.search.no_players')}
				</p>
			)}
		</article>
	);
}
