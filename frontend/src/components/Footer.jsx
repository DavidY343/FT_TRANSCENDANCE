import { Link } from "react-router-dom"
import { useTranslation } from '../contexts/LanguageContext';
import appFooterStyles from '../styles/layout/app-footer.module.css';

export default function Footer()
{
	const { t } = useTranslation();
	return (
		<footer className={`${appFooterStyles.appFooter}`}>
				<Link className="footer-link" to="/privacy-policy">
					{t('footer.privacyPolicy')}
				</Link>
				<Link className="footer-link" to="/terms-of-service">
					{t('footer.terms')}
				</Link>
		</footer>
	);
}
