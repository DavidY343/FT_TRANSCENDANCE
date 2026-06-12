import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../../api';
import { HistoryListCard } from './components/HistoryListCard';

import './style/history.css';

export default function HistoryPage()
{
	const [games, setGames] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get('/games/history');
				setGames(data);
			} catch (err) {
				setError(getApiErrorMessage(err, 'Failed to load history'));
			}
		})();
	}, []);

	return (
		<section className="history-layout">
			<aside className="card intro-card history-hero">
				<p className="section-kicker">Archive</p>

				<h2 className="intro-title">
					Match History
				</h2>

				<p>
					Recent completed and interrupted games from your account timeline.
				</p>

				<div className="history-stats">
					<div className="info-note">
						<span>Total games</span>
						<p>{games.length}</p>
					</div>

					<div className="info-note">
						<span>Last result</span>
						<p>{games[0]?.result_for_me?.replaceAll('_', ' ') || '-'}</p>
					</div>
				</div>

				{error && <p className="form-error">{error}</p>}
			</aside>

			<HistoryListCard games={games} />
		</section>
	);
}
