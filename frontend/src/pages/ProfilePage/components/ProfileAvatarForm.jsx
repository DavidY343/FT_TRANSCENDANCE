import { useTranslation } from '../../../contexts/LanguageContext';
import buttonStyles from '../../../styles/buttons/button.module.css';
import avatarStyles from '../style/avatar.module.css';

export function ProfileAvatarForm({ profile })
{
	const { t } = useTranslation();
	return (
		<div className={`${avatarStyles.profileAvatarForm}`}>
			<input
				className={`${avatarStyles.profileAvatarInput}`}
				id="profile-avatar"
				type="file"
				accept="image/png,image/jpeg,image/webp"
				aria-describedby="profile-avatar-help"
				onChange={profile.uploadAvatar}
				disabled={profile.uploading}
			/>
			<p id="profile-avatar-help" className={`${avatarStyles.profileAvatarHelp}`}>
				{t('profile.avatar.help')}
			</p>
			<label className={`${buttonStyles.btn} ${avatarStyles.profileAvatarButton}`} htmlFor="profile-avatar">
				{profile.uploading ? t('profile.avatar.uploading') : t('profile.avatar.change_btn')}
			</label>

		</div>
	);
}
