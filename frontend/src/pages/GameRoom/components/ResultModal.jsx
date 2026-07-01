import { Link, useNavigate } from 'react-router-dom';
import { useModalA11y } from '../../../hooks/useModalA11y';

export function ResultModal({ room })
{
	const navigate = useNavigate();
	const isOpen = !!room.gameResult;
	const onClose = () => navigate('/lobby');
	const { modalRef, cancelBtnRef } = useModalA11y(isOpen, onClose);

	if (!isOpen)
		return (null);

	const resultText = {
		win: 'YOU WIN',
		lost: 'YOU LOST',
		draw: 'DRAW',
	}[room.gameResult];

	return (
		<div className="card result-card result-modal-card" role="dialog" aria-modal="true" ref={modalRef} tabIndex="-1">
			<h2 className={`result-title result-title-${room.gameResult}`}>
				{resultText}
			</h2>
			<Link className="btn" to="/lobby" ref={cancelBtnRef}>
				Lobby
			</Link>
		</div>
	);
}
