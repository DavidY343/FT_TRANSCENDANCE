import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export function MenuDisplay({current})
{
	const detailsRef = useRef(null);
	const privateLinks = [
		{ to: '/lobby', label: 'Lobby' },
		{ to: '/profile', label: 'Profile' },
		{ to: '/friends', label: 'Friends' },
		{ to: '/history', label: 'History' },
		{ to: '/leaderboard', label: 'Leaderboard' },
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
				Menu
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
