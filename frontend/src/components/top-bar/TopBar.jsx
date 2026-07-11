import { Link, useNavigate } from "react-router-dom"
import { clearTokens } from "../../api";
import { clearStoredAchievements } from '../../hooks/useAchievementToasts';
import { MenuDisplay } from "./MenuDisplay";
import { useTranslation } from '../../contexts/LanguageContext';
import buttonStyles from '../../styles/buttons/button.module.css';
import appTopbarStyles from '../../styles/layout/app-topbar.module.css';

function BrandBlock()
{
	const { t } = useTranslation();
	return (
		<div className={`${appTopbarStyles.brandBlock}`}>
			<h1 className={`${appTopbarStyles.brandTitle}`}>
				{t('topbar.brandTitle')}
			</h1>
			<p className={`${appTopbarStyles.brandSubtitle}`}>
				{t('topbar.brandSubtitle')}
			</p>
		</div>
	);
}

function LanguageSelector() {
	const { lang, changeLanguage } = useTranslation();
	
	const styles = {
		select: {
			background: 'transparent',
			color: 'inherit',
			border: '1px solid var(--shadow, #ccc)',
			borderRadius: '8px',
			padding: '4px 8px',
			margin: '0 16px',
			cursor: 'pointer',
			fontSize: '1rem',
			outline: 'none',
			fontFamily: 'inherit',
			width: '64px',
			textAlign: 'center'
		},
		option: {
			color: 'black'
		}
	};

	return (
		<select 
			className="language-selector" 
			style={styles.select} 
			value={lang} 
			onChange={(e) => changeLanguage(e.target.value)}
		>
			<option style={styles.option} value="en">EN</option>
			<option style={styles.option} value="es">ES</option>
			<option style={styles.option} value="fr">FR</option>
		</select>
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
			<nav className={`${appTopbarStyles.topNav}`}>
				<LanguageSelector />
				<MenuDisplay current={props.current}/>
				<button className={`${buttonStyles.btn} ${buttonStyles.navBtn}`} onClick={handleLogout}>
					{t('topbar.logout')}
				</button>
			</nav>
		);
	}

	else 
		return (
			<nav className={`${appTopbarStyles.topNav}`}>
				<LanguageSelector />
				<Link className={`${buttonStyles.btn} ${buttonStyles.navBtn}`} to="/login">
					{t('topbar.login')}
				</Link>
				<Link className={`${buttonStyles.btn} ${buttonStyles.navBtn}`} to="/register">
					{t('topbar.register')}
				</Link>
			</nav>
		);
}

export default function TopBar(props)
{
	return (
		<header className={`${appTopbarStyles.topbar}`}>
			<BrandBlock/>
			<TopNav current={props.current} authed={props.authed}/>
		</header>
	);
}
