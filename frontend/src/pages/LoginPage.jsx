import AuthIntroCard from "../components/auth/AuthIntroCard";
import LoginForm from "../components/auth/LoginForm";
import { useLoginForm } from '../hooks/useLoginForm';

export default function LoginPage()
{
	const loginForm = useLoginForm();

	return (
		<section className="auth-layout">
			<AuthIntroCard />

			<LoginForm
				email={loginForm.email}
				setEmail={loginForm.setEmail}
				password={loginForm.password}
				setPassword={loginForm.setPassword}
				error={loginForm.error}
				submitting={loginForm.submitting}
				onSubmit={loginForm.onSubmit}
			/>
		</section>
	);
}