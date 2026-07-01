import { useTranslation } from '../../../contexts/LanguageContext';

export function ProfileAvatarForm({ profile })
{
	const { t } = useTranslation();
	return (
		<div className="profile-avatar-form">
			<input
				className="profile-avatar-input"
				id="profile-avatar"
				type="file"
				accept="image/png,image/jpeg,image/webp"
				aria-describedby="profile-avatar-help"
				onChange={profile.uploadAvatar}
				disabled={profile.uploading}
			/>
			<p id="profile-avatar-help" className="profile-avatar-help">
				{t('profile.avatar.help')}
			</p>
			<label className="btn profile-avatar-button" htmlFor="profile-avatar">
				{profile.uploading ? t('profile.avatar.uploading') : t('profile.avatar.change_btn')}
			</label>

		</div>
	);
}
