import { useProfile } from './hooks/useProfile';
import { ProfileSummary } from './components/ProfileSummary';
import { ProfileEditForm } from './components/ProfileEditForm';
import { ProfileAvatarForm } from './components/ProfileAvatarForm';

export default function ProfilePage()
{
	const profile = useProfile();

	if (profile.loading)
		return (
			<section className="card profile-card">
				<p>Loading profile...</p>
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
						Retry
					</button>
				</article>
			</section>
		);
	}

	return (
		<section className="profile-layout">
			<article className="card intro-card profile-card">
				<p className="section-kicker">
					Profile Settings
				</p>

				<h1 className="card-title">
					Profile
				</h1>

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
				
				<div className="profile-left">
					<ProfileAvatarForm profile={profile} />
					<ProfileSummary user={profile.user} />
				</div>

				<div className="profile-right">
					<ProfileEditForm profile={profile} />
				</div>
			</article>
		</section>
	);
}
