import { Link } from 'react-router-dom';

export default function LoginForm({
	email,
	setEmail,
	password,
	setPassword,
	error,
	submitting,
	onSubmit
})
{
	return (
		<section className="card auth-card auth-card-form">
			<p className="section-kicker">
				Login
			</p>

			<h2>
				Sign in
			</h2>

			<form onSubmit={onSubmit}>
				<input
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					type="email"
					placeholder="Email"
					required
				/>

				<input
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					type="password"
					placeholder="Password"
					required
				/>

				<button type="submit" disabled={submitting}>
					{submitting ? 'Signing in...' : 'Sign in'}
				</button>
			</form>

			{error && (
				<p className="form-error">
					{error}
				</p>
			)}

			<p className="auth-switch">
				No account? <Link to="/register">Register</Link>
			</p>
		</section>
	);
}