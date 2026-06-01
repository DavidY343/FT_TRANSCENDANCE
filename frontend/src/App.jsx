import { useEffect } from 'react';
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

  useEffect(() => {
    if (!isAuthed) {
      return undefined;
    }

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

  function logout() {
    clearTokens();
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
    </div>
  );
}
