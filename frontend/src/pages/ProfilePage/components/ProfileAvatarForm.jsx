export function ProfileAvatarForm({ profile })
{
	return (
		<div className="profile-avatar-form">
			<label className="btn profile-avatar-button" htmlFor="profile-avatar">
				{profile.uploading ? 'Uploading...' : 'Change avatar'}
			</label>

			<input
				className="profile-avatar-input"
				id="profile-avatar"
				type="file"
				accept="image/png,image/jpeg,image/webp"
				onChange={profile.uploadAvatar}
				disabled={profile.uploading}
			/>
		</div>
	);
}
