import { useTranslation } from '../../../contexts/LanguageContext';
import buttonStyles from '../../../styles/buttons/button.module.css';
import layoutStyles from '../../../styles/layout/layout.module.css';

export function ProfileEditForm({ profile })
{
	const { t } = useTranslation();
	return (
		<form className="profile-edit-form" onSubmit={profile.saveProfile} noValidate>
			<label className={`${layoutStyles.lab}`} htmlFor="profile-display-name">
				{t('profile.edit.display_name_label')}
			</label>

			<input
				id="profile-display-name"
				value={profile.displayName}
				onChange={(event) => profile.setDisplayName(event.target.value)}
				placeholder={t('profile.edit.display_name_placeholder')}
				required
			/>

			<button
				className={`${buttonStyles.btn} ${buttonStyles.submitBtn}`}
				type="submit"
				disabled={profile.saving}
			>
				{profile.saving ? t('profile.edit.saving') : t('profile.edit.save_btn')}
			</button>
		</form>
	);
}