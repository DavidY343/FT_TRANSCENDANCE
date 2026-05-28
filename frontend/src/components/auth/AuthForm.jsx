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
		<section className="card auth-card form-card">
			<h2 className="form-title">
				Create account
			</h2>

			<form className="form-container" onSubmit={onSubmit}>
				<label className="lab" htmlFor="register-email">Email</label>
				<input
					id="register-email"
					value={form.email}
					onChange={(event) => updateField('email', event.target.value)}
					type="email"
					placeholder="Email"
					required
				/>

				<label className="lab" htmlFor="register-username">Username</label>
				<input
					id="register-username"
					value={form.username}
					onChange={(event) => updateField('username', event.target.value)}
					placeholder="Username"
					required
				/>

				<label className="lab" htmlFor="register-display-name">Display name</label>
				<input
					id="register-display-name"
					value={form.display_name}
					onChange={(event) => updateField('display_name', event.target.value)}
					placeholder="Display name"
					required
				/>

				<label className="lab" htmlFor="register-password">Password</label>
				<input
					id="register-passwor"
					value={form.password}
					onChange={(event) => updateField('password', event.target.value)}
					type="password"
					placeholder="Password"
					required
				/>

				<label className="lab" htmlFor="register-confirm-password">Confirm password</label>
				<input
					id="register-confirm-password"
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
		<section className="card auth-card form-card">
			<h2 className="form-title">
				Sign in
			</h2>

			<form className="form-container" onSubmit={onSubmit}>
				<label className="lab" htmlFor="login-email">Email</label>
				<input
					id="login-email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					type="email"
					placeholder="Email"
					required
				/>
				<label className="lab" htmlFor="login-password">Password</label>
				<input
					id="login-password"
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
				No account? <Link className="auth-link" to="/register">Register</Link>
			</p>
		</section>
	);
}
