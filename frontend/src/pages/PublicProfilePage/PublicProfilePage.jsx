import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '../../api';
import { useTranslation } from '../../contexts/LanguageContext';
import { ProfileSummary } from '../ProfilePage/components/ProfileSummary';
import { AchievementsPanel } from '../ProfilePage/ProfilePage';
import '../ProfilePage/style/achievements.css';
import cardsStyles from '../../styles/cards/cards.module.css';
import introCardsStyles from '../../styles/cards/intro-cards.module.css';
import buttonStyles from '../../styles/buttons/button.module.css';

export default function PublicProfilePage()
{
	const { id } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let cancelled = false;

		async function loadProfile()
		{
			setLoading(true);
			setError('');
			try
			{
				const userRes = await api.get(`/users/${id}`);
				if (!cancelled) setUser(userRes.data);
			}
			catch (err)
			{
				if (!cancelled)
					setError(getApiErrorMessage(err, t('profile.loading')));
			}
			finally
			{
				if (!cancelled) setLoading(false);
			}
		}

		loadProfile();

		return () => { cancelled = true; };
	}, [id, t]);

	if (loading)
	{
		return (
			<section className="profile-layout">
				<article className={`${cardsStyles.card} profile-card`}>
					<p>{t('profile.loading')}</p>
				</article>
			</section>
		);
	}

	if (error || !user)
	{
		return (
			<section className="profile-layout">
				<article className={`${cardsStyles.card} profile-card`}>
					<p className={`${introCardsStyles.formError}`} role="alert">
						{error || "User not found"}
					</p>
					<button className={`${buttonStyles.btn}`} type="button" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
						{t('action.cancel') || 'Go back'}
					</button>
				</article>
			</section>
		);
	}

	return (
		<section className="profile-layout">
			<article className={`${cardsStyles.card} ${introCardsStyles.introCard} profile-card`} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
				<div className="profile-left" style={{ margin: '0 auto', width: '100%', maxWidth: '400px', gridColumn: 'unset' }}>
					<ProfileSummary user={user} />
				</div>
				<div style={{ width: '100%' }}>
					<AchievementsPanel userId={id} onError={setError} />
				</div>
			</article>
		</section>
	);
}
