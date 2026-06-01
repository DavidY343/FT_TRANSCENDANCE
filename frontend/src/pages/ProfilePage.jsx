import { useEffect, useState } from 'react';
import { api, getApiErrorMessage } from '../api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        setUser(data);
        setDisplayName(data.display_name);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load profile'));
      }
    })();
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl('');
      return;
    }
    const nextUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [avatarFile]);

  async function save() {
    if (saving) {
      return;
    }
    try {
      setSaving(true);
      const { data } = await api.put('/users/me', { display_name: displayName });
      setUser(data);
      setError('');
      setSuccess('Display name updated. Username remains unchanged.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update profile'));
      setSuccess('');
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar() {
    if (!avatarFile || uploading) {
      return;
    }

    const formData = new FormData();
    formData.append('file', avatarFile);

    try {
      setUploading(true);
      const { data } = await api.post('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(data);
      setAvatarFile(null);
      setError('');
      setSuccess('Avatar updated successfully.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to upload avatar'));
      setSuccess('');
    } finally {
      setUploading(false);
    }
  }

  if (!user) {
    return <section className="card">Loading profile...</section>;
  }

  const avatarPreview = avatarPreviewUrl || user.avatar_url;

  return (
    <section className="profile-layout card">
      <p className="section-kicker">Profile</p>
      <h2>Your identity</h2>
      <p>Change your public display name and avatar. Your username is your fixed account handle.</p>

      <div className="profile-grid">
        <article className="profile-avatar-panel">
          <div className="profile-avatar-shell">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile avatar" className="profile-avatar-image" />
            ) : (
              <span className="profile-avatar-fallback">{(user.display_name || user.username).slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="profile-avatar-actions">
            <label htmlFor="avatar-input">Avatar image</label>
            <input
              id="avatar-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
            />
            <button type="button" onClick={uploadAvatar} disabled={!avatarFile || uploading}>
              {uploading ? 'Uploading avatar...' : 'Upload avatar'}
            </button>
          </div>
        </article>

        <article className="profile-form-panel">
          <div className="profile-readonly-row">
            <span>Username (cannot be changed)</span>
            <strong>@{user.username}</strong>
          </div>
          <div className="profile-readonly-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="profile-readonly-row">
            <span>Elo</span>
            <strong>{user.elo}</strong>
          </div>

          <label htmlFor="display-name-input">Display name (this is what friends see)</label>
          <input
            id="display-name-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
          />
          <button type="button" onClick={save} disabled={saving}>
            {saving ? 'Saving profile...' : 'Save display name'}
          </button>
        </article>
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="profile-success">{success}</p>}
    </section>
  );
}
