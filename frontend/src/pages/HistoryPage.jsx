import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../api';

export default function HistoryPage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');

  function prettyResult(result) {
    if (!result) return '-';
    return result.replaceAll('_', ' ');
  }

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
    <section className="card history-layout">
      <p className="section-kicker">Archive</p>
      <h2>Match History</h2>
      <p>Recent completed and interrupted games from your account timeline.</p>
      {error && <p className="form-error">{error}</p>}
      <ul className="history-list">
        {games.map((game) => (
          <li key={game.id} className="history-item">
            <div className="history-row-main">
              <strong>Game #{game.id}</strong>
              <span>{prettyResult(game.result_for_me)}</span>
            </div>
            <p className="history-row-sub">
              You ({game.my_color}) vs {game.opponent?.display_name || 'Unknown'}
              {' '}| mode: {game.mode}
              {' '}| game: {prettyResult(game.result || game.status)}
            </p>
          </li>
        ))}
      </ul>
      {games.length === 0 ? <p className="empty-state">No games recorded yet.</p> : null}
    </section>
  );
}
