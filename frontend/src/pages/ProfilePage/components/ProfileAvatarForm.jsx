export function ProfileAvatarForm({ profile })
{
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
				JPEG, PNG or WebP. Maximum size: 2 MB.
			</p>
			<label className="btn profile-avatar-button" htmlFor="profile-avatar">
				{profile.uploading ? 'Uploading...' : 'Change avatar'}
			</label>

		</div>
	);
}
