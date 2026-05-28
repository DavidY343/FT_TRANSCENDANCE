import { RegisterForm } from "../components/auth/AuthForm";
import { RegisterIntroCard } from "../components/auth/AuthIntroCard";
import { useRegisterForm } from '../hooks/useFormHooks/useRegisterForm';

export default function Register()
{
	const registerForm = useRegisterForm();

	return (
		<section className="auth-layout">
			<RegisterIntroCard />
			<RegisterForm
				form={registerForm.form}
				updateField={registerForm.updateField}
				error={registerForm.error}
				submitting={registerForm.submitting}
				onSubmit={registerForm.onSubmit}
			/>
		</section>
	);
}
