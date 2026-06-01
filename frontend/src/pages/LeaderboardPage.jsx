import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../api';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/games/leaderboard');
        setRows(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load leaderboard'));
      }
    })();
  }, []);

  return (
    <section className="card leaderboard-layout">
      <p className="section-kicker">Ranking</p>
      <h2>Leaderboard</h2>
      <p>Current standings sorted by rating.</p>
      {error && <p className="form-error">{error}</p>}
      <ol className="leaderboard-list">
        {rows.map((row, index) => (
          <li key={row.id} className="leaderboard-row">
            <div className="leaderboard-left">
              <span className="rank-badge">#{index + 1}</span>
              <strong>{row.display_name}</strong>
              <span>@{row.username}</span>
            </div>
            <span className="leaderboard-elo">{row.elo}</span>
          </li>
        ))}
      </ol>
      {rows.length === 0 ? <p className="empty-state">No ranking data available.</p> : null}
    </section>
  );
}
