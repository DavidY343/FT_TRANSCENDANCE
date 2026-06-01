import { Link } from 'react-router-dom';

export function RegisterForm({
	form,
	updateField,
	error,
	errorField,
	submitting,
	onSubmit
})
{
	return (
		<section className="card auth-card form-card">
			<h2 className="form-title">
				Create account
			</h2>

			<form className="form-container" onSubmit={onSubmit} noValidate>
				<label className="lab" htmlFor="register-email">Email</label>
				<input
					className={errorField === 'email' ? 'input-error' : ''}
					aria-describedby={error ? 'register-form-error' : undefined}
					aria-invalid={errorField === 'email'}
					id="register-email"
					value={form.email}
					onChange={(event) => updateField('email', event.target.value)}
					type="email"
					placeholder="Email"
					required
				/>

				<label className="lab" htmlFor="register-username">Username</label>
				<input
					className={errorField === 'username' ? 'input-error' : ''}
					aria-describedby={error ? 'register-form-error' : undefined}
					aria-invalid={errorField === 'username'}
					id="register-username"
					value={form.username}
					onChange={(event) => updateField('username', event.target.value)}
					placeholder="Username"
					required
				/>

				<label className="lab" htmlFor="register-display-name">Display name</label>
				<input
					className={errorField === 'display_name' ? 'input-error' : ''}
					aria-describedby={error ? 'register-form-error' : undefined}
					aria-invalid={errorField === 'display_name'}
					id="register-display-name"
					value={form.display_name}
					onChange={(event) => updateField('display_name', event.target.value)}
					placeholder="Display name"
					required
				/>

				<label className="lab" htmlFor="register-password">Password</label>
				<input
					className={errorField === 'password' ? 'input-error' : ''}
					aria-describedby={error ? 'register-form-error' : undefined}
					aria-invalid={errorField === 'password'}
					id="register-password"
					value={form.password}
					onChange={(event) => updateField('password', event.target.value)}
					type="password"
					placeholder="Password"
					required
				/>

				<label className="lab" htmlFor="register-confirm-password">Confirm password</label>
				<input
					className={errorField === 'confirm_password' ? 'input-error' : ''}
					aria-describedby={error ? 'register-form-error' : undefined}
					aria-invalid={errorField === 'confirm_password'}
					id="register-confirm-password"
					value={form.confirm_password}
					onChange={(event) => updateField('confirm_password', event.target.value)}
					type="password"
					placeholder="Confirm password"
					required
				/>

				<button className="btn submit-btn" disabled={submitting}>
					{submitting ? 'Creating account...' : 'Create'}
				</button>
			</form>

			{error && (
				<p className="form-error" id="register-form-error" aria-live="polite">
					{error}
				</p>
			)}

			<p className="auth-switch">
				Already have an account? <Link className='auth-link' to="/login">Sign in</Link>
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
	errorField,
	submitting,
	onSubmit
})
{
	return (
		<section className="card auth-card form-card">
			<h2 className="form-title">
				Sign in
			</h2>

			<form className="form-container" onSubmit={onSubmit} noValidate>
				<label className="lab" htmlFor="login-email">Email</label>
				<input
					className={errorField === 'email' ? 'input-error' : ''}
					aria-describedby={error ? 'login-form-error' : undefined}
					aria-invalid={errorField === 'email'}
					id="login-email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					type="email"
					placeholder="Email"
					required
				/>
				<label className="lab" htmlFor="login-password">Password</label>
				<input
					className={errorField === 'password' ? 'input-error' : ''}
					aria-describedby={error ? 'login-form-error' : undefined}
					aria-invalid={errorField === 'password'}
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
				<p className="form-error" id="login-form-error" aria-live="polite">
					{error}
				</p>
			)}

			<p className="auth-switch">
				No account? <Link className="auth-link" to="/register">Register</Link>
			</p>
		</section>
	);
}
