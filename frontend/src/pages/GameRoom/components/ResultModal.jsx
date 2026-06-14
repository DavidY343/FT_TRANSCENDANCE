import { Link } from 'react-router-dom';

export function ResultModal({ room })
{
	if (!room.gameResult)
		return (null);

	const resultText = {
		win: 'YOU WIN',
		lost: 'YOU LOST',
		draw: 'DRAW',
	}[room.gameResult];

	return (
		<div className="card result-card result-modal-card">
			<h2 className={`result-title result-title-${room.gameResult}`}>
				{resultText}
			</h2>
			<Link className="btn" to="/lobby">
				Lobby
			</Link>
		</div>
	);
}
