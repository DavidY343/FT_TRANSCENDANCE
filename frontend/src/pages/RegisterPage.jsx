import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage, setTokens } from '../api';

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/\d/.test(password)) return 'Password must include at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character.';
  return '';
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    display_name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setError('');

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setTokens(data.access_token, data.refresh_token);
      navigate('/lobby');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Register failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <article className="card auth-card auth-card-copy">
        <p className="section-kicker">New Membership</p>
        <h2>Join the club.</h2>
        <p>
          Set your name on the ledger, claim your table and start playing rapid duels, quiet endgames and reckless attacks against friends or AI.
        </p>
        <div className="auth-note">
          <span>Entry standard</span>
          <p>Bring a valid email, a solid alias and enough patience for your first opening mistake.</p>
        </div>
      </article>

      <section className="card auth-card auth-card-form">
        <p className="section-kicker">Register</p>
        <h2>Create account</h2>
        <p className="auth-password-policy">Use 8+ characters with uppercase, lowercase, number and symbol.</p>
        <form onSubmit={onSubmit}>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" required />
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" required />
          <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Display name" required />
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Password" required />
          <button type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        {error && <p className="form-error">{error}</p>}
        <p className="auth-switch">
          Have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </section>
  );
}
