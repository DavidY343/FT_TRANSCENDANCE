import { useEffect, useMemo, useState } from 'react';

import { api, getApiErrorMessage } from '../../api';

import './style/leaderboard.css';

function LeaderboardRow({ row, rank })
{
	const displayName = row.display_name || row.username || 'Unknown player';

	return (
		<li className="leaderboard-item">
			<div className="leaderboard-rank">
				<span>#{rank}</span>
			</div>

			<div className="leaderboard-player">
				<strong>{displayName}</strong>
				<span>@{row.username || 'unknown'}</span>
			</div>

			<div className="leaderboard-rating">
				<span>Rating</span>
				<strong>{row.elo ?? '-'}</strong>
			</div>
		</li>
	);
}

export default function LeaderboardPage()
{
	const [rows, setRows] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		(async () => {
			try
			{
				const { data } = await api.get('/games/leaderboard');
				setRows(data);
			}
			catch (err)
			{
				setError(getApiErrorMessage(err, 'Failed to load leaderboard'));
			}
		})();
	}, []);

	const topPlayer = rows[0];
	const topRating = useMemo(() => (
		rows.reduce((best, row) => Math.max(best, Number(row.elo) || 0), 0)
	), [rows]);

	return (
		<section className="leaderboard-layout">
			<aside className="card intro-card leaderboard-hero">
				<p className="section-kicker">Ranking</p>

				<h2 className="intro-title">
					Leaderboard
				</h2>

				<p>
					Current standings sorted by rating across the club.
				</p>

				<div className="leaderboard-stats">
					<div className="info-note">
						<span>Players</span>
						<p>{rows.length}</p>
					</div>

					<div className="info-note">
						<span>Top rating</span>
						<p>{topRating || '-'}</p>
					</div>
				</div>

				<div className="leaderboard-champion">
					<span>Current leader</span>
					<strong>{topPlayer?.display_name || topPlayer?.username || '-'}</strong>
				</div>

				{error && <p className="form-error">{error}</p>}
			</aside>

			<aside className="card panel-card leaderboard-panel">
				<h3 className="panel-title">
					Standings
				</h3>

				{rows.length === 0 ? (
					<p className="leaderboard-empty">
						No ranking data available.
					</p>
				) : (
					<ol className="leaderboard-list">
						{rows.map((row, index) => (
							<LeaderboardRow
								key={row.id}
								row={row}
								rank={index + 1}
							/>
						))}
					</ol>
				)}
			</aside>
		</section>
	);
}
