import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api, clearTokens, getAccessToken } from './api';
import FriendsPage from './pages/FriendsPage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LobbyPage from './pages/LobbyPage';
import LoginPage from './pages/LoginPage';
import PrivacyPage from './pages/PrivacyPage';
import ProfilePage from './pages/ProfilePage';
import GameRoomPage from './pages/GameRoomPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';

function PrivateRoute({ children }) {
  const token = getAccessToken();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthed = Boolean(getAccessToken());
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  // ── Global presence heartbeat ──────────────────────────────────────────────
  // Keep a /ws/presence socket open for the entire authenticated session so
  // the backend can track online status independently of any game WebSocket.
  useEffect(() => {
    if (!isAuthed) return undefined;

    const token = getAccessToken();
    if (!token) return undefined;

    const wsBase = (import.meta.env.VITE_WS_BASE_URL || window.location.origin)
      .replace(/^http/, 'ws');

    let ws = null;
    let heartbeatId = null;
    let reconnectId = null;
    let stopped = false;

    function connect() {
      if (stopped) return;
      ws = new WebSocket(`${wsBase}/ws/presence?token=${encodeURIComponent(token)}`);

      ws.onopen = () => {
        // Send a ping every 30 s to keep proxies from closing idle connections.
        heartbeatId = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30_000);
      };

      ws.onclose = () => {
        clearInterval(heartbeatId);
        // Auto-reconnect after 3 s unless the hook is being torn down.
        if (!stopped) {
          reconnectId = setTimeout(connect, 3_000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      stopped = true;
      clearInterval(heartbeatId);
      clearTimeout(reconnectId);
      if (ws) ws.close();
    };
  }, [isAuthed]);

  // ── Matchmaking poll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthed) return undefined;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      if (location.pathname.startsWith('/games/')) return;

      try {
        const { data } = await api.get('/matchmaking/status');
        if (!cancelled && data?.status === 'matched' && data?.game_id) {
          navigate(`/games/${data.game_id}`);
        }
      } catch (err) {
        // Ignore transient polling errors; each page handles its own critical failures.
      }
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isAuthed, location.pathname, navigate]);

  const [toasts, setToasts] = useState([]);

  // ── Achievements checker ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthed) return undefined;

    let cancelled = false;

    async function checkAchievements() {
      if (cancelled) return;
      try {
        const { data: serverAchievements } = await api.get('/users/me/achievements');
        if (cancelled) return;

        const storedStr = localStorage.getItem('unlocked_achievements');
        const storedIds = storedStr ? JSON.parse(storedStr) : null;

        // If no stored state exists (first time loading achievements),
        // we cache the current list of unlocked achievements to avoid spamming
        // notifications for historical achievements.
        if (storedIds === null) {
          const currentUnlocked = serverAchievements
            .filter((a) => a.unlocked)
            .map((a) => a.id);
          localStorage.setItem('unlocked_achievements', JSON.stringify(currentUnlocked));
          return;
        }

        const newUnlocked = [];
        const nextStored = [...storedIds];

        for (const ach of serverAchievements) {
          if (ach.unlocked && !storedIds.includes(ach.id)) {
            newUnlocked.push(ach);
            nextStored.push(ach.id);
          }
        }

        if (newUnlocked.length > 0) {
          // Save new list to localStorage
          localStorage.setItem('unlocked_achievements', JSON.stringify(nextStored));

          // Display toast notifications
          newUnlocked.forEach((ach) => {
            const toastId = Math.random().toString();
            setToasts((prev) => [...prev, { ...ach, id: toastId, hide: false }]);

            // Animate out after 3.6s
            setTimeout(() => {
              setToasts((prev) =>
                prev.map((t) => (t.id === toastId ? { ...t, hide: true } : t))
              );
            }, 3600);

            // Remove completely after 4s
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toastId));
            }, 4000);
          });
        }
      } catch (err) {
        // Ignore transient connection issues
      }
    }

    // Check on mount (after a tiny delay so loading is smooth)
    const initialTimeout = setTimeout(checkAchievements, 1000);

    // Periodically check every 4 seconds
    const intervalId = setInterval(checkAchievements, 4000);

    return () => {
      cancelled = true;
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [isAuthed, location.pathname]);

  function logout() {
    clearTokens();
    localStorage.removeItem('unlocked_achievements');
    navigate('/login');
  }

  return (
    <div className={`app-shell${isAuthRoute ? ' auth-route' : ''}`}>
      <header className="topbar">
        <div className="brand-block">
          <p className="brand-kicker">Est. for Late-Night Tactics</p>
          <h1 className="brand-title">Checkmate Club</h1>
          <p className="brand-subtitle">A quiet room for sharp games, stubborn defenses and elegant blunders.</p>
        </div>
        <nav className="main-nav">
          {isAuthed ? (
            <>
              <Link to="/lobby">Lobby</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/friends">Friends</Link>
              <Link to="/history">History</Link>
              <Link to="/leaderboard">Leaderboard</Link>
              <button onClick={logout} type="button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/lobby" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms-of-service" element={<TermsPage />} />
          <Route
            path="/lobby"
            element={
              <PrivateRoute>
                <LobbyPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <PrivateRoute>
                <FriendsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <LeaderboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/games/:gameId"
            element={
              <PrivateRoute>
                <GameRoomPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-of-service">Terms of Service</Link>
      </footer>

      {/* Achievements Toast Container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`achievement-toast ${toast.hide ? 'hide' : ''}`}>
              <span className="toast-emoji">{toast.emoji}</span>
              <div className="toast-content">
                <span className="toast-kicker">¡Logro Completado!</span>
                <h4 className="toast-title">{toast.title}</h4>
                <p className="toast-desc">{toast.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
