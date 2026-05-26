import { Link, Navigate, Route, Routes } from 'react-router-dom';

import LobbyPage from './pages/LobbyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ProfilePage from './pages/ProfilePage';
import GameRoomPage from './pages/GameRoomPage';
import FriendsPage from './pages/FriendsPage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Footer from "./components/Footer.jsx"
import TopBar from './components/TopBar.jsx';

function PrivateRoute({ children })
{
	const token = localStorage.getItem('access_token');

	if (!token)
		return <Navigate to="/login" replace />;

	return children;
}

export default function App()
{
	return (
		<div className="app-layout">
			<TopBar/>
			<main className="app-main">
				<div className="main-content">
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
				</div>
			</main>
			<Footer/>
		</div>
	);
}