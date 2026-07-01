import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';

export function MenuDisplay({current})
{
	const { t } = useTranslation();
	const detailsRef = useRef(null);
	const privateLinks = [
		{ to: '/lobby', label: t('menu.lobby') },
		{ to: '/profile', label: t('menu.profile') },
		{ to: '/friends', label: t('menu.friends') },
		{ to: '/history', label: t('menu.history') },
		{ to: '/leaderboard', label: t('menu.leaderboard') },
	];
	const visibleLinks = privateLinks.filter((link) => link.to !== current);

	useEffect(() => {
		function handleClickOutside(event)
		{
			if (detailsRef.current && !detailsRef.current.contains(event.target))
				detailsRef.current.open = false;
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);
	
	return (
		<details className="nav-menu" ref={detailsRef}>
			<summary className="btn nav-btn">
				{t('menu.title')}
			</summary>

			<div className="nav-menu-panel">
				{visibleLinks.map((link) => (
					<Link
						className="nav-menu-link"
						key={link.to}
						to={link.to}
					>
						{link.label}
					</Link>
				))}
			</div>
		</details>
	);
}
