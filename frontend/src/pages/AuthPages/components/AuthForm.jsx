import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../contexts/LanguageContext';
import cardsStyles from '../../../styles/cards/cards.module.css';
import buttonStyles from '../../../styles/buttons/button.module.css';
import layoutStyles from '../../../styles/layout/layout.module.css';
import introCardsStyles from '../../../styles/cards/intro-cards.module.css';

export function RegisterForm({
	form,
	updateField,
	error,
	errorField,
	submitting,
	onSubmit
})
{
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<section className={`${cardsStyles.card} ${cardsStyles.authCard} ${cardsStyles.formCard}`}>
			<h2 className={`${cardsStyles.panelTitle} ${cardsStyles.panelTitleLarge}`}>
				{t('auth.register.title')}
			</h2>

			<form className="form-container" onSubmit={onSubmit} noValidate>
				<label className={`${layoutStyles.lab}`} htmlFor="register-email">{t('auth.register.emailLabel')}</label>
				<input
					className={errorField === 'email' ? 'input-error' : ''}
					aria-describedby={error ? 'register-form-error' : undefined}
					aria-invalid={errorField === 'email'}
					id="register-email"
					value={form.email}
					onChange={(event) => updateField('email', event.target.value)}
					type="email"
					autoComplete="email"
					placeholder={t('auth.register.emailPlaceholder')}
					required
				/>

				<label className={`${layoutStyles.lab}`} htmlFor="register-username">{t('auth.register.usernameLabel')}</label>
				<input
					className={errorField === 'username' ? 'input-error' : ''}
					aria-describedby={error ? 'register-form-error' : undefined}
					aria-invalid={errorField === 'username'}
					id="register-username"
					value={form.username}
					onChange={(event) => updateField('username', event.target.value)}
					autoComplete="username"
					placeholder={t('auth.register.usernamePlaceholder')}
					required
				/>

				<label className={`${layoutStyles.lab}`} htmlFor="register-display-name">{t('auth.register.displayNameLabel')}</label>
				<input
					className={errorField === 'display_name' ? 'input-error' : ''}
					aria-describedby={error ? 'register-form-error' : undefined}
					aria-invalid={errorField === 'display_name'}
					id="register-display-name"
					value={form.display_name}
					onChange={(event) => updateField('display_name', event.target.value)}
					autoComplete="name"
					placeholder={t('auth.register.displayNamePlaceholder')}
					required
				/>

				<label className={`${layoutStyles.lab}`} htmlFor="register-password">{t('auth.register.passwordLabel')}</label>
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
						placeholder={t('auth.register.passwordPlaceholder')}
						required
						style={{ width: '100%', paddingRight: '4rem' }}
					/>
					<button
						type="button"
						aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
						{showPassword ? t('auth.hide') : t('auth.show')}
					</button>
				</div>

				<label className={`${layoutStyles.lab}`} htmlFor="register-confirm-password">{t('auth.register.confirmPasswordLabel')}</label>
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
						placeholder={t('auth.register.confirmPasswordPlaceholder')}
						required
						style={{ width: '100%', paddingRight: '4rem' }}
					/>
					<button
						type="button"
						aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
						{showConfirmPassword ? t('auth.hide') : t('auth.show')}
					</button>
				</div>

				<button className={`${buttonStyles.btn} ${buttonStyles.submitBtn}`} disabled={submitting || !form.email || !form.username || !form.display_name || !form.password || !form.confirm_password || form.password !== form.confirm_password}>
					{submitting ? t('auth.register.submitting') : t('auth.register.submit')}
				</button>
			</form>

			{error && (
				<p className={`${introCardsStyles.formError}`} id="register-form-error" aria-live="polite">
					{error}
				</p>
			)}

			<p className={`${introCardsStyles.authSwitch}`}>
				{t('auth.register.alreadyHaveAccount')} <Link className='auth-link' to="/login">{t('auth.register.signInLink')}</Link>
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
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);

	return (
		<section className={`${cardsStyles.card} ${cardsStyles.authCard} ${cardsStyles.formCard}`}>
			<h2 className={`${cardsStyles.panelTitle} ${cardsStyles.panelTitleLarge}`}>
				{t('auth.login.title')}
			</h2>

			<form className="form-container" onSubmit={onSubmit} noValidate>
				<label className={`${layoutStyles.lab}`} htmlFor="login-email">{t('auth.login.emailLabel')}</label>
				<input
					className={errorField === 'email' ? 'input-error' : ''}
					aria-describedby={error ? 'login-form-error' : undefined}
					aria-invalid={errorField === 'email'}
					id="login-email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					type="email"
					autoComplete="username"
					placeholder={t('auth.login.emailPlaceholder')}
					required
				/>
				<label className={`${layoutStyles.lab}`} htmlFor="login-password">{t('auth.login.passwordLabel')}</label>
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
						placeholder={t('auth.login.passwordPlaceholder')}
						required
						style={{ width: '100%', paddingRight: '4rem' }}
					/>
					<button
						type="button"
						aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
						{showPassword ? t('auth.hide') : t('auth.show')}
					</button>
				</div>

				<button className={`${buttonStyles.btn} ${buttonStyles.submitBtn}`} disabled={submitting || !email || !password}>
					{submitting ? t('auth.login.submitting') : t('auth.login.submit')}
				</button>
			</form>

			{error && (
				<p className={`${introCardsStyles.formError}`} id="login-form-error" aria-live="polite">
					{error}
				</p>
			)}

			<p className={`${introCardsStyles.authSwitch}`}>
				{t('auth.login.noAccount')} <Link className="auth-link" to="/register">{t('auth.login.registerLink')}</Link>
			</p>
		</section>
	);
}
