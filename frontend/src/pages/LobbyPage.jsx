import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '../api';

export default function LobbyPage() {
  const navigate = useNavigate();
  const pollRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [position, setPosition] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [error, setError] = useState('');
  const [activeGameId, setActiveGameId] = useState(null);

  async function loadActiveGame() {
    const stored = sessionStorage.getItem('active_game_id');
    if (!stored) {
      setActiveGameId(null);
      return;
    }

    try {
      const { data } = await api.get(`/games/${stored}`);
      if (data.status === 'finished') {
        sessionStorage.removeItem('active_game_id');
        setActiveGameId(null);
      } else {
        setActiveGameId(Number(stored));
      }
    } catch (_err) {
      sessionStorage.removeItem('active_game_id');
      setActiveGameId(null);
    }
  }

  function clearPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => {
    loadActiveGame();
    return () => clearPolling();
  }, []);

  async function pollStatus() {
    try {
      const { data } = await api.get('/matchmaking/status');
      if (data.status === 'matched' && data.game_id) {
        clearPolling();
        sessionStorage.setItem('active_game_id', String(data.game_id));
        navigate(`/games/${data.game_id}`);
        return;
      }

      setStatus(data.status || 'idle');
      setPosition(data.position ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to check queue status'));
    }
  }

  async function joinQueue() {
    setError('');
    try {
      const { data } = await api.post('/matchmaking/join', { time_minutes: timeMinutes });
      if (data.status === 'matched' && data.game_id) {
        sessionStorage.setItem('active_game_id', String(data.game_id));
        navigate(`/games/${data.game_id}`);
        return;
      }

      setStatus(data.status || 'waiting');
      setPosition(data.position ?? null);
      clearPolling();
      pollRef.current = setInterval(pollStatus, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to join queue'));
    }
  }

  async function leaveQueue() {
    setError('');
    try {
      await api.delete('/matchmaking/leave');
      clearPolling();
      setStatus('idle');
      setPosition(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to leave queue'));
    }
  }

  async function playVsAi() {
    setError('');
    clearPolling();
    try {
      const { data } = await api.post('/games/vs-ai', { difficulty, time_minutes: timeMinutes });
      sessionStorage.setItem('active_game_id', String(data.game_id));
      navigate(`/games/${data.game_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to start AI game'));
    }
  }

  return (
    <section className="lobby-layout">
      <article className="card lobby-hero">
        <p className="section-kicker">Game Lobby</p>
        <h2>Choose the kind of evening you want.</h2>
        <p>
          Jump into live matchmaking, play a calmer game against the engine, or sit in the queue while the club finds you an opponent worth your time.
        </p>
        <div className="lobby-status-strip">
          <div>
            <span>Status</span>
            <strong>{status}</strong>
          </div>
          <div>
            <span>Queue spot</span>
            <strong>{position ?? '-'}</strong>
          </div>
          <div>
            <span>Time control</span>
            <strong>{timeMinutes} min</strong>
          </div>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
      </article>

      <div className="lobby-actions-grid">
        {activeGameId ? (
          <article className="card lobby-action-card">
            <p className="section-kicker">Resume</p>
            <h3>Active Game</h3>
            <p>You have an ongoing game. Jump back before disconnect grace expires.</p>
            <div className="lobby-card-actions">
              <button type="button" onClick={() => navigate(`/games/${activeGameId}`)}>Resume game #{activeGameId}</button>
            </div>
          </article>
        ) : null}

        <article className="card lobby-action-card">
          <p className="section-kicker">Live Match</p>
          <h3>Play 1v1</h3>
          <p>Enter the queue and move straight into a real-time room when a rival appears.</p>
          <label htmlFor="time-control">Time control</label>
          <select id="time-control" value={timeMinutes} onChange={(e) => setTimeMinutes(Number(e.target.value))}>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
          <div className="lobby-card-actions">
            <button type="button" onClick={joinQueue}>Join matchmaking</button>
            <button type="button" onClick={leaveQueue}>Leave queue</button>
          </div>
        </article>

        <article className="card lobby-action-card">
          <p className="section-kicker">Practice Table</p>
          <h3>Play vs AI</h3>
          <p>Warm up with the engine and choose how punishing you want the room to feel tonight.</p>
          <label htmlFor="difficulty">AI difficulty</label>
          <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <label htmlFor="time-control-ai">Time control</label>
          <select id="time-control-ai" value={timeMinutes} onChange={(e) => setTimeMinutes(Number(e.target.value))}>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
          <div className="lobby-card-actions">
            <button type="button" onClick={playVsAi}>Start AI game</button>
          </div>
        </article>
      </div>
    </section>
  );
}
