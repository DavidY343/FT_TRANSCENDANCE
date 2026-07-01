import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '../../api';
import { useTranslation } from '../../contexts/LanguageContext';
import { ProfileSummary } from '../ProfilePage/components/ProfileSummary';

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
				<article className="card profile-card">
					<p>{t('profile.loading')}</p>
				</article>
			</section>
		);
	}

	if (error || !user)
	{
		return (
			<section className="profile-layout">
				<article className="card profile-card">
					<p className="form-error" role="alert">
						{error || "User not found"}
					</p>
					<button className="btn" type="button" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
						{t('action.cancel') || 'Go back'}
					</button>
				</article>
			</section>
		);
	}

	return (
		<section className="profile-layout">
			<article className="card intro-card profile-card" style={{ display: 'block' }}>
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<ProfileSummary user={user} />
				</div>
			</article>
		</section>
	);
}
