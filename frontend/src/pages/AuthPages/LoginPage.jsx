import { LoginIntroCard } from "./components/AuthIntroCard";
import { LoginForm } from "./components/AuthForm";
import { useLoginForm } from './hooks/useFormHooks/useLoginForm';
import authStyles from './style/auth.module.css';
export default function LoginPage()
{
	const loginForm = useLoginForm();

	return (
		<section className={`${authStyles.authLayout}`}>
			<LoginIntroCard />
			<LoginForm
				email={loginForm.email}
				setEmail={loginForm.setEmail}
				password={loginForm.password}
				setPassword={loginForm.setPassword}
				error={loginForm.error}
				errorField={loginForm.errorField}
				submitting={loginForm.submitting}
				onSubmit={loginForm.onSubmit}
			/>
		</section>
	);
}
