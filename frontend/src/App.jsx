import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { getAccessToken } from './api';

import { AchievementToastContainer } from './components/AchievementToastContainer.jsx';
import { usePresenceHeartbeat } from './hooks/usePresenceHeartbeat';
import { useAchievementToasts } from './hooks/useAchievementToasts';

import LobbyPage from './pages/LobbyPage/LobbyPage.jsx';
import LoginPage from './pages/AuthPages/LoginPage';
import RegisterPage from './pages/AuthPages/RegisterPage';
import PrivacyPage from './pages/LegalPages/PrivacyPage';
import TermsPage from './pages/LegalPages/TermsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import PublicProfilePage from './pages/PublicProfilePage/PublicProfilePage.jsx';
import GameRoomPage from './pages/GameRoom/GameRoomPage.jsx';
import FriendsPage from './pages/FriendsPage/FriendsPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage/LeaderboardPage';
import Footer from "./components/Footer.jsx"
import TopBar from './components/top-bar/TopBar.jsx';
import layoutStyles from './styles/layout/layout.module.css';
import appMainStyles from './styles/layout/app-main.module.css';

function PrivateRoute({ children })
{
	if (!getAccessToken())
		return <Navigate to="/login" replace />;

	return ( children );
}

function PublicAuthRoute({ children })
{
	if (getAccessToken())
		return <Navigate to="/lobby" replace />;

	return ( children );
}

export default function App()
{
	const location = useLocation();
	const [authTick, setAuthTick] = useState(0);
	const isAuthed = Boolean(getAccessToken());

	useEffect(() => {
		function handleStorage(e) {
			if (e.key === 'access_token') {
				setAuthTick(prev => prev + 1);
			}
		}
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, []);

	const achievementToasts = useAchievementToasts(isAuthed);

	usePresenceHeartbeat(isAuthed);
	return (
		<div className={`${layoutStyles.appLayout}`}>
			<TopBar current={location.pathname} authed={isAuthed} />
			<main className={`${appMainStyles.appMain}`}>
				<div className={`${appMainStyles.mainContent}`}>
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
							path="/profile/:id"
							element={
								<PrivateRoute>
									<PublicProfilePage />
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
			<AchievementToastContainer toasts={achievementToasts} />
		</div>
	);
}
