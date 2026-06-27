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
  const [activeTab, setActiveTab] = useState('settings');
  const [achievements, setAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'achievements') {
      (async () => {
        try {
          setLoadingAchievements(true);
          const { data } = await api.get('/users/me/achievements');
          setAchievements(data);
        } catch (err) {
          setError(getApiErrorMessage(err, 'Failed to load achievements'));
        } finally {
          setLoadingAchievements(false);
        }
      })();
    }
  }, [activeTab]);

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
      <div className="profile-tabs-header">
        <button
          className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('settings');
            setError('');
            setSuccess('');
          }}
          type="button"
        >
          Profile Settings
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('achievements');
            setError('');
            setSuccess('');
          }}
          type="button"
        >
          Achievements
        </button>
      </div>

      {activeTab === 'settings' ? (
        <>
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
        </>
      ) : (
        <>
          <p className="section-kicker">Badges of Honor</p>
          <h2>Achievements</h2>
          <p>Complete challenges to unlock unique badges and showcase your chess prowess.</p>

          {loadingAchievements ? (
            <p>Loading achievements...</p>
          ) : (
            <div className="achievements-grid">
              {achievements.map((ach) => (
                <div key={ach.id} className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-emoji-container">
                    <span>{ach.emoji}</span>
                  </div>
                  <div className="achievement-info">
                    <h3 className="achievement-title">{ach.title}</h3>
                    <p className="achievement-desc">{ach.description}</p>
                    <span className={`achievement-badge ${ach.unlocked ? 'unlocked-badge' : 'locked-badge'}`}>
                      {ach.unlocked ? '✓ Completed' : '🔒 Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {error && <p className="form-error">{error}</p>}
      {success && <p className="profile-success">{success}</p>}
    </section>
  );
}
