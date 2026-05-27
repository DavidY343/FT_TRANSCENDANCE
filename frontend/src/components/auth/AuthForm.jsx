import { Link } from 'react-router-dom';

export function RegisterForm({
	form,
	updateField,
	error,
	submitting,
	onSubmit
})
{
	return (
		<section className="card auth-card auth-card-form">
			<h2 className="card-title">
				Create account
			</h2>

			<form className="form-container" onSubmit={onSubmit}>
				<input
					value={form.email}
					onChange={(event) => updateField('email', event.target.value)}
					type="email"
					placeholder="Email"
					required
				/>

				<input
					value={form.username}
					onChange={(event) => updateField('username', event.target.value)}
					placeholder="Username"
					required
				/>

				<input
					value={form.display_name}
					onChange={(event) => updateField('display_name', event.target.value)}
					placeholder="Display name"
					required
				/>

				<input
					value={form.password}
					onChange={(event) => updateField('password', event.target.value)}
					type="password"
					placeholder="Password"
					required
				/>

				<input
					value={form.confirmPassword}
					onChange={(event) => updateField('confirmPassword', event.target.value)}
					type="password"
					placeholder="Confirm password"
					required
				/>

				<button className="btn submit-btn" disabled={submitting}>
					{submitting ? 'Creating account...' : 'Create'}
				</button>
			</form>

			{error && (
				<p className="form-error">
					{error}
				</p>
			)}

			<p className="auth-switch">
				Already have an account? <Link to="/login">Sign in</Link>
			</p>
		</section>
	);
}

export function LoginForm({
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
			<h2 className="card-title">
				Sign in
			</h2>

			<form className="form-container" onSubmit={onSubmit}>
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

				<button className="btn submit-btn" disabled={submitting}>
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
