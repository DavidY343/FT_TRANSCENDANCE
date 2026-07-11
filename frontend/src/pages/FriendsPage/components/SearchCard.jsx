import { Link } from 'react-router-dom';
import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import friendsStyles from '../style/friends.module.css';

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
		<article className={`${cardsStyles.card} ${cardsStyles.panelCard}`}>
			<h2 className={`${cardsStyles.panelTitle}`}>
				{t('friends.search.title')}
			</h2>

			<form className={`${friendsStyles.friendsSearchForm}`} onSubmit={onSubmit}>
				<input
					type="search"
					aria-label={t('friends.search.aria_label')}
					placeholder={t('friends.search.placeholder')}
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>

				<button
					className={`${buttonStyles.btn}`}
					type="submit"
					disabled={searching}
				>
					{searching ? t('friends.search.btn_searching') : t('friends.search.btn')}
				</button>
			</form>

			{feedback && (
				<p
					className={`${friendsStyles.friendsMessage} ${feedback.type === 'error' ? friendsStyles.friendsMessageError : friendsStyles.friendsMessageSuccess}`}
					role={feedback.type === 'error' ? 'alert' : 'status'}
					aria-live="polite"
				>
					{feedback.message}
				</p>
			)}
			{results.length > 0 && (
				<div className={`${friendsStyles.friendsList}`}>
					{results.map((user) => (
						<div className={`${friendsStyles.friendRow}`} key={user.id}>
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

								<span className={user.online ? friendsStyles.friendOnline : friendsStyles.friendOffline}>
									{user.online ? t('friends.search.status_online') : t('friends.search.status_offline')}
								</span>
							</div>

							<button
								className={`${buttonStyles.btn}`}
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
				<p className={`${friendsStyles.friendsEmpty}`}>
					{t('friends.search.no_players')}
				</p>
			)}
		</article>
	);
}
