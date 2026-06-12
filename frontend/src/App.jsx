import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { getAccessToken } from './api';

import LobbyPage from './pages/LobbyPage/LobbyPage.jsx';
import LoginPage from './pages/AuthPages/LoginPage';
import RegisterPage from './pages/AuthPages/RegisterPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import GameRoomPage from './pages/GameRoom/GameRoomPage.jsx';
import FriendsPage from './pages/FriendsPage/FriendsPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Footer from "./components/Footer.jsx"
import TopBar from './components/top-bar/TopBar.jsx';

function isDevAuthed()
{
	return (
		import.meta.env.DEV
		&& sessionStorage.getItem('dev_auth') === 'true'
	);
}

function PrivateRoute({ children })
{
	if (!getAccessToken() && !isDevAuthed())
		return <Navigate to="/login" replace />;

	return ( children );
}

function PublicAuthRoute({ children })
{
	if (getAccessToken() || isDevAuthed())
		return <Navigate to="/lobby" replace />;

	return ( children );
}

export default function App()
{
	const location = useLocation();
	const isAuthed = Boolean(getAccessToken()) || isDevAuthed();
	return (
		<div className="app-layout">
			<TopBar current={location.pathname} authed={isAuthed} />
			<main className="app-main">
				<div className="main-content">
					<Routes>
						<Route path="/" element={<Navigate to="/lobby" replace />} />
						<Route
							path="/login"
							element={
								<PublicAuthRoute>
									<LoginPage />
								</PublicAuthRoute>
							}
						/>
						<Route
							path="/register"
							element={
								<PublicAuthRoute>
									<RegisterPage />
								</PublicAuthRoute>
							}
						/>
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
				</div>
			</main>
			<Footer/>
		</div>
	);
}
