import { useState } from 'react';
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
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<section className="card auth-card form-card">
			<h2 className="panel-title panel-title-large">
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
					autoComplete="email"
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
					autoComplete="username"
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
					autoComplete="name"
					placeholder="Display name"
					required
				/>

				<label className="lab" htmlFor="register-password">Password</label>
				<div style={{ position: 'relative', width: '100%' }}>
					<input
						className={errorField === 'password' ? 'input-error' : ''}
						aria-describedby={error ? 'register-form-error' : undefined}
						aria-invalid={errorField === 'password'}
						id="register-password"
						value={form.password}
						onChange={(event) => updateField('password', event.target.value)}
						type={showPassword ? 'text' : 'password'}
						autoComplete="new-password"
						placeholder="Password"
						required
						style={{ width: '100%', paddingRight: '4rem' }}
					/>
					<button
						type="button"
						aria-label={showPassword ? "Hide password" : "Show password"}
						onClick={() => setShowPassword(!showPassword)}
						style={{
							position: 'absolute',
							right: '0.5rem',
							top: '50%',
							transform: 'translateY(-50%)',
							background: 'transparent',
							border: 'none',
							cursor: 'pointer',
							fontSize: '0.85rem',
							color: '#666'
						}}
					>
						{showPassword ? 'Hide' : 'Show'}
					</button>
				</div>

				<label className="lab" htmlFor="register-confirm-password">Confirm password</label>
				<div style={{ position: 'relative', width: '100%' }}>
					<input
						className={errorField === 'confirm_password' ? 'input-error' : ''}
						aria-describedby={error ? 'register-form-error' : undefined}
						aria-invalid={errorField === 'confirm_password'}
						id="register-confirm-password"
						value={form.confirm_password}
						onChange={(event) => updateField('confirm_password', event.target.value)}
						type={showConfirmPassword ? 'text' : 'password'}
						autoComplete="new-password"
						placeholder="Confirm password"
						required
						style={{ width: '100%', paddingRight: '4rem' }}
					/>
					<button
						type="button"
						aria-label={showConfirmPassword ? "Hide password" : "Show password"}
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						style={{
							position: 'absolute',
							right: '0.5rem',
							top: '50%',
							transform: 'translateY(-50%)',
							background: 'transparent',
							border: 'none',
							cursor: 'pointer',
							fontSize: '0.85rem',
							color: '#666'
						}}
					>
						{showConfirmPassword ? 'Hide' : 'Show'}
					</button>
				</div>

				<button className="btn submit-btn" disabled={submitting || !form.email || !form.username || !form.display_name || !form.password || !form.confirm_password || form.password !== form.confirm_password}>
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
	const [showPassword, setShowPassword] = useState(false);

	return (
		<section className="card auth-card form-card">
			<h2 className="panel-title panel-title-large">
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
					autoComplete="username"
					placeholder="Email"
					required
				/>
				<label className="lab" htmlFor="login-password">Password</label>
				<div style={{ position: 'relative', width: '100%' }}>
					<input
						className={errorField === 'password' ? 'input-error' : ''}
						aria-describedby={error ? 'login-form-error' : undefined}
						aria-invalid={errorField === 'password'}
						id="login-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						type={showPassword ? 'text' : 'password'}
						autoComplete="current-password"
						placeholder="Password"
						required
						style={{ width: '100%', paddingRight: '4rem' }}
					/>
					<button
						type="button"
						aria-label={showPassword ? "Hide password" : "Show password"}
						onClick={() => setShowPassword(!showPassword)}
						style={{
							position: 'absolute',
							right: '0.5rem',
							top: '50%',
							transform: 'translateY(-50%)',
							background: 'transparent',
							border: 'none',
							cursor: 'pointer',
							fontSize: '0.85rem',
							color: '#666'
						}}
					>
						{showPassword ? 'Hide' : 'Show'}
					</button>
				</div>

				<button className="btn submit-btn" disabled={submitting || !email || !password}>
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
