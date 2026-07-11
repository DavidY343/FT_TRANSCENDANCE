import { useEffect, useState } from 'react';

import { useProfile } from './hooks/useProfile';
import { ProfileSummary } from './components/ProfileSummary';
import { ProfileEditForm } from './components/ProfileEditForm';
import { ProfileAvatarForm } from './components/ProfileAvatarForm';
import { fetchAchievements, fetchUserAchievements } from './hooks/profileApi';
import { getApiErrorMessage } from '../../api';
import { useTranslation } from '../../contexts/LanguageContext';
import cardsStyles from '../../styles/cards/cards.module.css';
import introCardsStyles from '../../styles/cards/intro-cards.module.css';
import buttonStyles from '../../styles/buttons/button.module.css';
import profileStyles from './style/profile.module.css';
import achievementsStyles from './style/achievements.module.css';
import messagesStyles from './style/messages.module.css';

export function AchievementsPanel({ userId, onError })
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
				const { data } = userId ? await fetchUserAchievements(userId) : await fetchAchievements();

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
		<div className={`${achievementsStyles.achievementsPanel}`}>
			<header className={`${achievementsStyles.achievementsHeader}`}>
				<p className={`${introCardsStyles.sectionKicker}`}>{t('profile.achievements.kicker')}</p>
				<h2 className={`${profileStyles.cardTitle}`}>{t('profile.achievements.title')}</h2>
				<p>{t('profile.achievements.copy')}</p>
			</header>

			{loading ? (
				<p>{t('profile.achievements.loading')}</p>
			) : (
				<div className={`${achievementsStyles.achievementsGrid}`}>
					{achievements.map((achievement) => (
						<article
							key={achievement.id}
							className={`${achievementsStyles.achievementCard}${achievement.unlocked ? '' : ` ${achievementsStyles.achievementCardLocked}`}`}
						>
							<span className={`${achievementsStyles.achievementEmoji}`} aria-hidden="true">
								{achievement.emoji}
							</span>
							<div className={`${achievementsStyles.achievementInfo}`}>
								<h3>{achievement.title}</h3>
								<p>{achievement.description}</p>
								<span
									className={`${achievementsStyles.achievementBadge}${achievement.unlocked ? ` ${achievementsStyles.achievementBadgeUnlocked}` : ''}`}
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
			<section className={`${cardsStyles.card} ${profileStyles.profileCard}`}>
				<p>{t('profile.loading')}</p>
			</section>
		);
	if (profile.error && !profile.user)
	{
		return (
			<section className={`${profileStyles.profileLayout}`}>
				<article className={`${cardsStyles.card} ${profileStyles.profileCard}`}>
					<p className={`${introCardsStyles.formError}`} role="alert">
						{profile.error}
					</p>

					<button
						className={`${buttonStyles.btn}`}
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
		<section className={`${profileStyles.profileLayout}`}>
			<article className={`${cardsStyles.card} ${introCardsStyles.introCard} ${profileStyles.profileCard}`}>
				<div className={`${achievementsStyles.profileTabs}`}>
					<button
						className={`${achievementsStyles.profileTabBtn}${activeTab === 'settings' ? ` ${achievementsStyles.profileTabBtnActive}` : ''}`}
						type="button"
						onClick={() => setActiveTab('settings')}
					>
						{t('profile.tabs.settings')}
					</button>
					<button
						className={`${achievementsStyles.profileTabBtn}${activeTab === 'achievements' ? ` ${achievementsStyles.profileTabBtnActive}` : ''}`}
						type="button"
						onClick={() => setActiveTab('achievements')}
					>
						{t('profile.tabs.achievements')}
					</button>
				</div>

				{profile.error && (
					<p className={`${introCardsStyles.formError}`}>
						{profile.error}
					</p>
				)}

				{profile.success && (
					<p className={`${messagesStyles.profileSuccess}`}>
						{profile.success}
					</p>
				)}

				{activeTab === 'settings' ? (
					<>
						<p className={`${introCardsStyles.sectionKicker} ${profileStyles.centeredTitle}`}>
							{t('profile.settings.kicker')}
						</p>

						<h1 className={`${profileStyles.cardTitle} ${profileStyles.centeredTitle}`}>
							{t('profile.settings.title')}
						</h1>

						<div className={`${profileStyles.profileLeft}`}>
							<ProfileAvatarForm profile={profile} />
							<ProfileSummary user={profile.user} />
						</div>

						<div className={`${profileStyles.profileRight}`}>
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
