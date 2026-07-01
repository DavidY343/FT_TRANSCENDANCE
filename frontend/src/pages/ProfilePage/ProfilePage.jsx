import { useEffect, useState } from 'react';

import { useProfile } from './hooks/useProfile';
import { ProfileSummary } from './components/ProfileSummary';
import { ProfileEditForm } from './components/ProfileEditForm';
import { ProfileAvatarForm } from './components/ProfileAvatarForm';
import { fetchAchievements } from './hooks/profileApi';
import { getApiErrorMessage } from '../../api';
import { useTranslation } from '../../contexts/LanguageContext';

function AchievementsPanel({ onError })
{
	const { t } = useTranslation();
	const [achievements, setAchievements] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function loadAchievements()
		{
			try
			{
				setLoading(true);
				const { data } = await fetchAchievements();

				if (!cancelled)
					setAchievements(Array.isArray(data) ? data : []);
			}
			catch (err)
			{
				if (!cancelled)
					onError(getApiErrorMessage(err, t('profile.achievements.error_load')));
			}
			finally
			{
				if (!cancelled)
					setLoading(false);
			}
		}

		loadAchievements();

		return () => {
			cancelled = true;
		};
	}, [onError]);

	return (
		<div className="achievements-panel">
			<header className="achievements-header">
				<p className="section-kicker">{t('profile.achievements.kicker')}</p>
				<h2 className="card-title">{t('profile.achievements.title')}</h2>
				<p>{t('profile.achievements.copy')}</p>
			</header>

			{loading ? (
				<p>{t('profile.achievements.loading')}</p>
			) : (
				<div className="achievements-grid">
					{achievements.map((achievement) => (
						<article
							key={achievement.id}
							className={`achievement-card${achievement.unlocked ? '' : ' achievement-card-locked'}`}
						>
							<span className="achievement-emoji" aria-hidden="true">
								{achievement.emoji}
							</span>
							<div className="achievement-info">
								<h3>{achievement.title}</h3>
								<p>{achievement.description}</p>
								<span
									className={`achievement-badge${achievement.unlocked ? ' achievement-badge-unlocked' : ''}`}
								>
									{achievement.unlocked ? t('profile.achievements.completed') : t('profile.achievements.locked')}
								</span>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	);
}

export default function ProfilePage()
{
	const { t } = useTranslation();
	const profile = useProfile();
	const [activeTab, setActiveTab] = useState('settings');

	if (profile.loading)
		return (
			<section className="card profile-card">
				<p>{t('profile.loading')}</p>
			</section>
		);
	if (profile.error && !profile.user)
	{
		return (
			<section className="profile-layout">
				<article className="card profile-card">
					<p className="form-error" role="alert">
						{profile.error}
					</p>

					<button
						className="btn"
						type="button"
						onClick={profile.loadProfile}
					>
						{t('profile.retry')}
					</button>
				</article>
			</section>
		);
	}

	return (
		<section className="profile-layout">
			<article className="card intro-card profile-card">
				<div className="profile-tabs">
					<button
						className={`profile-tab-btn${activeTab === 'settings' ? ' profile-tab-btn-active' : ''}`}
						type="button"
						onClick={() => setActiveTab('settings')}
					>
						{t('profile.tabs.settings')}
					</button>
					<button
						className={`profile-tab-btn${activeTab === 'achievements' ? ' profile-tab-btn-active' : ''}`}
						type="button"
						onClick={() => setActiveTab('achievements')}
					>
						{t('profile.tabs.achievements')}
					</button>
				</div>

				{profile.error && (
					<p className="form-error">
						{profile.error}
					</p>
				)}

				{profile.success && (
					<p className="profile-success">
						{profile.success}
					</p>
				)}

				{activeTab === 'settings' ? (
					<>
						<p className="section-kicker">
							{t('profile.settings.kicker')}
						</p>

						<h1 className="card-title">
							{t('profile.settings.title')}
						</h1>

						<div className="profile-left">
							<ProfileAvatarForm profile={profile} />
							<ProfileSummary user={profile.user} />
						</div>

						<div className="profile-right">
							<ProfileEditForm profile={profile} />
						</div>
					</>
				) : (
					<AchievementsPanel onError={profile.setError} />
				)}
			</article>
		</section>
	);
}
