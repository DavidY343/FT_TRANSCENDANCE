import { RegisterForm } from "./components/AuthForm";
import { RegisterIntroCard } from "./components/AuthIntroCard";
import { useRegisterForm } from './hooks/useFormHooks/useRegisterForm';
import authStyles from './style/auth.module.css';
export default function Register()
{
	const registerForm = useRegisterForm();

	return (
		<section className={`${authStyles.authLayout}`}>
			<RegisterIntroCard />
			<RegisterForm
				form={registerForm.form}
				updateField={registerForm.updateField}
				error={registerForm.error}
				errorField={registerForm.errorField}
				submitting={registerForm.submitting}
				onSubmit={registerForm.onSubmit}
			/>
		</section>
	);
}
