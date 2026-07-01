import { useTranslation } from '../../../contexts/LanguageContext';

export function ProfileEditForm({ profile })
{
	const { t } = useTranslation();
	return (
		<form className="profile-edit-form" onSubmit={profile.saveProfile} noValidate>
			<label className="lab" htmlFor="profile-display-name">
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
				className="btn submit-btn"
				type="submit"
				disabled={profile.saving}
			>
				{profile.saving ? t('profile.edit.saving') : t('profile.edit.save_btn')}
			</button>
		</form>
	);
}