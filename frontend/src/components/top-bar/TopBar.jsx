import { Link, useNavigate } from "react-router-dom"
import { clearTokens } from "../../api";
import { clearStoredAchievements } from '../../hooks/useAchievementToasts';
import { MenuDisplay } from "./MenuDisplay";
import { useTranslation } from '../../contexts/LanguageContext';

function BrandBlock()
{
	const { t } = useTranslation();
	return (
		<div className="brand-block">
			<h1 className="brand-title">
				{t('topbar.brandTitle')}
			</h1>
			<p className="brand-subtitle">
				{t('topbar.brandSubtitle')}
			</p>
		</div>
	);
}

function LanguageSelector() {
	const { lang, changeLanguage } = useTranslation();
	
	const styles = {
		container: { display: 'flex', gap: '8px', alignItems: 'center', margin: '0 16px', fontSize: '0.85rem', color: 'var(--text-muted, #888)' },
		active: { color: 'var(--text-color, #fff)', fontWeight: 'bold', cursor: 'pointer' },
		inactive: { cursor: 'pointer', opacity: 0.7 },
		separator: { opacity: 0.3 }
	};

	return (
		<div className="language-selector" style={styles.container}>
			<span style={lang === 'en' ? styles.active : styles.inactive} onClick={() => changeLanguage('en')}>EN</span>
			<span style={styles.separator}>|</span>
			<span style={lang === 'es' ? styles.active : styles.inactive} onClick={() => changeLanguage('es')}>ES</span>
			<span style={styles.separator}>|</span>
			<span style={lang === 'fr' ? styles.active : styles.inactive} onClick={() => changeLanguage('fr')}>FR</span>
		</div>
	);
}

function TopNav(props)
{
	const navigate = useNavigate();
	const { t } = useTranslation();

	function handleDevLogin()
	{
		sessionStorage.setItem('dev_auth', 'true');
		navigate('/lobby');
	}

	function handleLogout()
	{
		clearTokens();
		clearStoredAchievements();
		sessionStorage.removeItem('dev_auth');
		navigate('/login');
	}

	if (props.authed)
	{
		return (
			<nav className="top-nav">
				<LanguageSelector />
				<MenuDisplay current={props.current}/>
				<button className="btn nav-btn" onClick={handleLogout}>
					{t('topbar.logout')}
				</button>
			</nav>
		);
	}

	else 
		return (
			<nav className="top-nav">
				<LanguageSelector />
				<Link className="btn nav-btn" to="/login">
					{t('topbar.login')}
				</Link>
				<Link className="btn nav-btn" to="/register">
					{t('topbar.register')}
				</Link>
			</nav>
		);
}

export default function TopBar(props)
{
	return (
		<header className="topbar">
			<BrandBlock/>
			<TopNav current={props.current} authed={props.authed}/>
		</header>
	);
}
