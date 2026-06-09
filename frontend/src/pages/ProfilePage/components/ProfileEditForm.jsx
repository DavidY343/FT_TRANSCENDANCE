export function ProfileEditForm({ profile })
{
	return (
		<form className="profile-edit-form" onSubmit={profile.saveProfile} noValidate>
			<label className="lab" htmlFor="profile-display-name">
				Display name
			</label>

			<input
				id="profile-display-name"
				value={profile.displayName}
				onChange={(event) => profile.setDisplayName(event.target.value)}
				placeholder="Display name"
				required
			/>

			<button
				className="btn submit-btn"
				type="submit"
				disabled={profile.saving}
			>
				{profile.saving ? 'Saving...' : 'Save profile'}
			</button>
		</form>
	);
}