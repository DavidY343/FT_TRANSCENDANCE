import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage, setTokens } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setTokens(data.access_token, data.refresh_token);
      navigate('/lobby');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Login timeout. Please try again.');
      } else if (!err.response) {
        setError('Cannot reach server. Check that Docker is running and localhost:8080 is available.');
      } else {
        setError(getApiErrorMessage(err, 'Login failed'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <article className="card auth-card auth-card-copy">
        <p className="section-kicker">Members Entrance</p>
        <h2>Return to the board.</h2>
        <p>
          Pick up unfinished rivalries, review your last games and step back into a room that looks like it has been waiting for you all evening.
        </p>
        <div className="auth-note">
          <span>House note</span>
          <p>Best experienced with coffee nearby and your queen protected.</p>
        </div>
      </article>

      <section className="card auth-card auth-card-form">
        <p className="section-kicker">Login</p>
        <h2>Sign in</h2>
        <form onSubmit={onSubmit}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required />
          <button type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
        </form>
        {error && <p className="form-error">{error}</p>}
        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </section>
    </section>
  );
}
