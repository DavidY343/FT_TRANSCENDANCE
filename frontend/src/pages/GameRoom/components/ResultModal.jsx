import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function ResultModal({ room })
{
	const navigate = useNavigate();

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && room.gameResult) {
				navigate('/lobby');
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [room.gameResult, navigate]);

	if (!room.gameResult)
		return (null);

	const resultText = {
		win: 'YOU WIN',
		lost: 'YOU LOST',
		draw: 'DRAW',
	}[room.gameResult];

	return (
		<div className="card result-card result-modal-card" role="dialog" aria-modal="true">
			<h2 className={`result-title result-title-${room.gameResult}`}>
				{resultText}
			</h2>
			<Link className="btn" to="/lobby">
				Lobby
			</Link>
		</div>
	);
}
